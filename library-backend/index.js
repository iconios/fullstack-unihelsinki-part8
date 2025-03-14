const { ApolloServer } = require('@apollo/server')
const { expressMiddleware } = require('@apollo/server/express4')
const { ApolloServerPluginDrainHttpServer } = require('@apollo/server/plugin/drainHttpServer')
const { makeExecutableSchema } = require('@graphql-tools/schema')
const express = require('express')
const cors = require('cors')
const http = require('http')
const typeDefs = require('./schema')
const resolvers = require('./resolvers')
const mongoose = require('mongoose')
const mongoUri = require('./utils/config').MONGODB_URI
const PORT = require('./utils/config').PORT
const jwt = require('jsonwebtoken')
const User = require('./models/user')
const { JWT_SECRET } = require('./utils/config')
const { WebSocketServer } = require('ws')
const { useServer } = require('graphql-ws/use/ws')


mongoose.set('strictQuery', false)

mongoose.connect(mongoUri)
.then(() => console.log('Connected to Mongoose Db'))
.catch((error) => {console.log('Error connecting ', error)})

// Setup the graphQL subscriptions configuration
const start = async () => {
  const app = express()
  const httpServer = http.createServer(app)

  const wsServer = new WebSocketServer({
    server: httpServer,
    path: '/',
  })

  const schema = makeExecutableSchema({ typeDefs, resolvers })
  const serverCleanup = useServer({ schema }, wsServer)

  const server = new ApolloServer({
    schema,
    plugins: [
      ApolloServerPluginDrainHttpServer({ httpServer }),
    {
      async serverWillStart() {
        return {
          async drainServer() {
            await serverCleanup.dispose()
          },
        }
      }
    }],
  })

  await server.start()

  app.use(
    '/',
    cors(),
    express.json(),
    expressMiddleware(server, {
      context: async ({ req }) => {
        console.log('Request body ', req.body)
        let currentUser = null;
        const authorization = req.headers.authorization || null;
        console.log('Req header ', authorization);
    
        if (authorization?.toLowerCase().startsWith('bearer ')) {
          const token = authorization.substring(7);
          console.log('Token ', token);
    
          try {
            const decodedUser = jwt.verify(token, JWT_SECRET);
            console.log('Decoded user ', decodedUser);
    
            if (decodedUser) {
              currentUser = await User.findOne({ username: decodedUser.username });
              console.log('User found ', currentUser);
            }
          } catch (error) {
            console.error('Token verification failed:', error.message);
          }
        }
    
        // Return the context object
        return { currentUser };
      }
    },)
  )

  httpServer.listen(PORT, () => 
  console.log(`Server is now running on http://localhost:${PORT}`))
}

// Start the websocket server connection
start()