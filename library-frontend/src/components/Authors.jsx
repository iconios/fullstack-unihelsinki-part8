import { useQuery, useMutation } from "@apollo/client"
import { ALL_AUTHORS, SET_BIRTHYEAR } from "../services/queries"
import { v4 as uuidv4 } from 'uuid'

const Authors = () => {

  const { data, loading } = useQuery(ALL_AUTHORS)
  console.log('Authors received ', data)
  const [ setBirthYear ] = useMutation(SET_BIRTHYEAR, { refetchQueries: [ {query: ALL_AUTHORS} ] })

  const authors = data?.allAuthors
  console.log('Authors fetched ', authors)

  const handleBirthYear = (e) => {
    e.preventDefault()
    const name = e.target.name.value
    const setBornTo = e.target.setBornTo.value
    if(name && setBornTo) {
      setBirthYear({ variables: { name, setBornTo: Number(setBornTo) } })
      e.target.name.value = ''
      e.target.setBornTo.value = 0
    }
  }

  if(loading) {
    return <p>Loading...</p>
  }

  if(authors) {
    return (
      <div>
        <h2>authors</h2>
        <table>
          <tbody>
            <tr>
              <th></th>
              <th>born</th>
              <th>books</th>
            </tr>
            {authors.toSorted((a,b) => b.bookCount - a.bookCount).map((a) => (
              <tr key={a.name}>
                <td>{a.name}</td>
                <td>{a.born}</td>
                <td>{a.bookCount}</td>
              </tr>
            ))}
          </tbody>
        </table>
        <h2>Set birthyear</h2>
        <form onSubmit={handleBirthYear}>
          <div>
            name <select name="name">{authors.map(author => <option key={uuidv4()} value={author.name}>{author.name}</option>)}
            </select>
          </div>
          <div>
            born <input type="text" name="setBornTo" />
          </div>
          <button type="submit">Update author</button>
        </form>
      </div>
    )
  }
}

export default Authors
