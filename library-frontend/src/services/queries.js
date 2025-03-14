import { gql } from "@apollo/client";

export const ALL_AUTHORS = gql`
    query getAllAuthors {
      allAuthors {
        name
        born
        bookCount
      }
    }
`

export const ALL_BOOKS = gql`
    query getAllBooks($genres: String) {
        allBooks(genres: $genres) {
            id
            title
            published
            author {
                name
            }
        }
    }
`

export const BOOK_COUNT = gql`
    query getBookCount($name: String) {
        bookCount(name: $name)
    }
`

export const ADD_BOOK = gql`
    mutation addNewBook($title: String!, $author: String!, $published: Int!, $genres: [String!]!) {
        addBook(title: $title, author: $author, published: $published, genres: $genres) {
            title
            published
        }
    }
`

export const SET_BIRTHYEAR = gql`
    mutation setBirthYear($name: String!, $setBornTo: Int!) {
        editAuthor(name: $name, setBornTo: $setBornTo) {
            name
            born
        }
    }
`

export const USER_LOGIN = gql`
    mutation userLogin($username: String!, $password: String!) {
        login(username: $username, password: $password) {
            value
        }
    }
`

export const ALL_GENRES = gql`
    query allGenresQuery {
        allGenres
    }
`

export const ME_QUERY = gql`
    query meQuery {
        me {
            favoriteGenre
        } 
    }
`

export const BOOK_ADDED = gql`
    subscription bookAddedSubscriptions {
        bookAdded {
            id
            title
            published
            author {
                name
            }
        }
    }
`