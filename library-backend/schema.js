const typeDefs = `
  type Book {
    title: String!,
    published: Int!,
    author: Author!,
    id: ID!,
    genres: [String!]!
  }

  type Author {
    name: String!
    id: ID!
    born: Int
  }

  type AuthorReturns {
    name: String
    born: Int
    id: ID!
    bookCount: Int
  }

  type User {
    username: String!
    favoriteGenre: String!
    id: ID!
  }

  type Token {
    value: String!
  }

  type Query {
    me: User
    bookCount(name: String): Int!
    authorCount: Int!
    allBooks(author: String, genres: String): [Book]
    allAuthors: [AuthorReturns]
    allGenres: [String!]
  }

  type Mutation {
    addBook(
        title: String!
        author: String!
        published: Int!
        genres: [String!]!
    ): Book

    editAuthor(
        name: String!
        setBornTo: Int!
    ): Author

    createUser(
        username: String!
        favoriteGenre: String!
    ): User

    login(
        username: String!
        password: String!
    ): Token
  }

  type Subscription{
    bookAdded: Book
  }
`
module.exports = typeDefs