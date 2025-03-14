import { useQuery } from "@apollo/client"
import { ALL_BOOKS, ALL_GENRES } from "../services/queries"
import { useState } from "react"

const Books = () => {
  const [ genreFilter, setGenreFilter ] = useState(null)
  const { data, loading } = useQuery(ALL_BOOKS, {
    variables: { genres: genreFilter }
  })
  console.log('Books received ', data)
  const books = data?.allBooks
  const { data: genresData, loading: genresLoading } = useQuery(ALL_GENRES)

  if(loading) {
    return <p>Loading...</p>
  }

  if(books) {
    return (
      <div>
        <h2>books</h2>  
        {genreFilter && <p>in genre <span><strong>{genreFilter}</strong></span></p>}
        <table>
          <tbody>
            <tr>
              <th></th>
              <th>author</th>
              <th>published</th>
            </tr>
            {books.toSorted((a,b) => b.published - a.published).map((a) => (
              <tr key={a.title}>
                <td>{a.title}</td>
                <td>{a.author.name}</td>
                <td>{a.published}</td>
              </tr>
            ))}
          </tbody>
        </table>
        <div>
        { genresLoading && <p>Loading genres...</p> }
        { genresData && genresData.allGenres.map(genre => <button key={genre} type="button" onClick={() => setGenreFilter(genre)}>{genre}</button>) }
        <button type="button" onClick={() => setGenreFilter(null)}>all genres</button>
        </div>
      </div>
    )
  }
}

export default Books
