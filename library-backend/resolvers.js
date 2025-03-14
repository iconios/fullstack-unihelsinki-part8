const Book = require('./models/book')
const Author = require('./models/author')
const User = require('./models/user')
const jwt = require('jsonwebtoken')
const JWT_SECRET = require('./utils/config').JWT_SECRET
const { GraphQLError } = require('graphql')
const { PubSub } = require('graphql-subscriptions')
const { UNAUTHENTICATED, NOT_FOUND, INTERNAL_SERVER_ERROR } = require('apollo-server-errors')
const pubsub = new PubSub()
  
const resolvers = {
    Query: {
      bookCount: async (root, args) => {
        if(!args.name) {
            try {
                const count = await Book.countDocuments({}) // Get the count of all books
                return count
            } catch (err) {
                console.error('Error fetching book count:', err)
                throw new Error('Failed to fetch book count')
            }
        }
        else {
            try {
                const count = (await Book.find({}).populate('author')).filter(book => book.author.name === args.name).length
                console.log(`Count for ${args.name}`)
                return count
            }
            catch (err) {
                console.error('Error fetching book count:', err)
                throw new GraphQLError('Error fetching book count', {
                    extensions: {
                        code: ERROR_FETCHING_DATA
                    }
                })
            }
        }
      },
      authorCount: async () => {
        try {
            const count = await Author.countDocuments({}) // Get the count of all authors
            return count
        } catch (err) {
            console.error('Error fetching author count: ', err)
            throw new Error('Failed to fetch author count')
        }
      },
      allBooks: async (root, args) => {
          console.log('Value of arg ', args.genres)
          if(!args.genres) {
            try {
                return await Book.find({}).populate('author')
            } catch(err) {
                console.error('Error fetching books ', err)
                throw new Error('Error fetching books ', err)
            }
          }
          
          try {
            const books = await Book.find({}).populate('author')
            const bookFound = books.filter(book => book.genres.includes(args.genres))
            return bookFound || null
          } catch(err) {
            console.error('No books found ', err)
            throw new Error('No books found ', err)
          }
      },
      allAuthors: async () => {
        try {
            let authorsReturn = []
            const authors = await Author.find({})
            console.log('Authors found ', authors)
            if(authors.length > 0) {
                for(let author of authors){
                    const count = (await Book.find({}).populate('author')).filter(book => book.author.name === author.name).length
                    authorsReturn.push({
                        name: author.name,
                        born: author.born,
                        id: author.id,
                        bookCount: count
                    })
                }
            }
            return authorsReturn
        } catch(err) {
            console.error('Error fetching authors ', err)
            throw new Error('Error fetching authors ', err)
        }
      },
      me: (root, args, context) => {
        console.log('User context ', context)
        return context?.currentUser
      },
      allGenres: async () => {
        // Get all books
        let genres = []       
        const books = await Book.find({})

        // Get the genres of every book into an array list
        for(let book of books) {
            genres = genres.concat(book.genres.map(genre => genre))
        }
        console.log('Genres fetched ', genres)

        // Use Set to ensure only one instance of each genre is in the list
        const uniqueGenres = new Set(genres)

        // return the array list
        return uniqueGenres
      },
    },
  
    Mutation: {
      addBook: async (root, args, context) => {
        if(!context.currentUser) {
            console.error('User authenticated')
            return new GraphQLError('User unauthenticated', {
                extensions: {
                    code: UNAUTHENTICATED,
                    http: { status: 401 }
                }
            })
        }

        try {
            console.log('Frontend args received ', args)

            // Check if the author already exists in the author model
            const authorExist = await Author.findOne({ name: args.author })
            console.log('Author existed ', authorExist)

            // If the author already exists, get the author's ID else create a new author and get its ID
            let authorId = ''
            let bookAuthor = {}
            if(authorExist) {
                authorId = authorExist.id
                bookAuthor = authorExist
                console.log('Found author id ', authorId)
            } 
            else {
                // Create a new author
                const newAuthor = new Author({
                    name: args.author,
                    born: null
                })
                const authorCreated = await newAuthor.save()

                // Get the author id
                authorId = authorCreated.id
                bookAuthor = authorCreated
                console.log('Created author id ', authorId)
            }

            // Create new book with the schema details
            const newBook = new Book({
                title: args.title,
                published: args.published,
                author: authorId,
                genres: args.genres
            })            
            console.log('New book ', newBook)
            const createdBook = await newBook.save()

            const bookAdded = {
                id: createdBook.id,
                title: createdBook.title,
                published: createdBook.published,
                genres: createdBook.genres,
                author: {
                    name: bookAuthor.name,
                    born: bookAuthor.born,
                    id: bookAuthor.id
                }
            }

            // Add the pubsub function to publish the details of new book added
            pubsub.publish('BOOK_ADDED', { bookAdded })

            // Return the book with its populated author field
            return bookAdded
        } 
        catch(err) {
            console.error('Error adding a new book ', err.message)
            throw new GraphQLError('Error adding a new book', {
                extensions: {
                    code: 'Error adding a new book',
                    http: { status: 401 }
                }
            })
        }
      },
      editAuthor: async (root, args, context) => {
        console.log('Current user context ', context?.currentUser)
        if(!context.currentUser) {
            console.error('User authenticated')
            return new GraphQLError('User unauthenticated', {
                extensions: {
                    code: UNAUTHENTICATED,
                    http: { status: 401 }
                }
            })
        }

        const authorFound = await Author.findOne({ name: args.name })
        console.log('Found author ', authorFound)
        if(authorFound) {
            try {
                const updatedAuthor = await Author.findOneAndUpdate({ name: args.name}, { born: args.setBornTo }, { new: true })
                return updatedAuthor
            } catch(err) {
                console.error(err.message)
                throw new GraphQLError('Error updating', {
                    extensions: {
                        code: INTERNAL_SERVER_ERROR,
                        http: { status: 500 }
                    }
                })
            }
        }
        else {
            console.error('User Not Found')
            throw new GraphQLError('User Not Found', {
                extensions: {
                    code: NOT_FOUND,
                    http: { status: 404 }
                }
            })
        }
      },
      createUser: async (root, args) => {
        console.log('Received args ', args)
        try {
            const newUser = new User({
                username: args.username,
                favoriteGenre: args.favoriteGenre.toLowerCase()
            })
            const createdUser = await newUser.save()
            console.log('Created user ', createdUser)
            return {
                username: createdUser.username,
                favoriteGenre: createdUser.favoriteGenre,
                id: createdUser.id
            }
        }
        catch (error) {
            console.error(error.message)

            // Handle validation errors
            if (error.name === 'ValidationError' || error.code === 11000) {
                throw new GraphQLError('Invalid user input', {
                    extensions: {
                        code: BAD_USER_INPUT,
                        errors: error.errors || { message: 'Username already exists' },
                    },
                });
            }

            // Handle other errors
            throw new GraphQLError('Failed to create user', {
                extensions: {
                code: INTERNAL_SERVER_ERROR,
                originalError: error.message,
                },
            });
        }
      },
      login: async (root, args) => {
        const userFound = await User.findOne({ username: args.username })
        console.log('Found user ', userFound)

        if(userFound && args.password === 'password') {
            try {
                const userForToken = {
                    username: userFound.username,
                    favoriteGenre: userFound.favoriteGenre,
                    id: userFound.id
                }
                const token = await jwt.sign(userForToken, JWT_SECRET)
                return { value: token }
            }
            catch (error) {
                console.error('Error logging in', error.GraphQLError.map(e => e.message.join('\n')))
                throw new GraphQLError('Error logging in', {
                    extensions: {
                        code: BAD_USER_INPUT,
                    }
                })
            }
        }
        else return null
      }
    },
    Subscription: {
        bookAdded: {
            subscribe: () => pubsub.asyncIterableIterator('BOOK_ADDED')
        }
    }
  }

  module.exports = resolvers