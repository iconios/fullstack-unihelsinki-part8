import { useQuery } from "@apollo/client"
import { ALL_BOOKS, ME_QUERY } from "../services/queries"

const Recommended = () => {
    const { data: meData, loading: meLoading } = useQuery(ME_QUERY, {
        fetchPolicy: 'network-only',
    })
    console.log('Me data fetched ', meData)

    const { data, loading } = useQuery(ALL_BOOKS, {
        variables: { genres: meData?.me?.favoriteGenre },
        skip: !meData?.me?.favoriteGenre || meLoading,
    })
    console.log('Books received ', data)
    const books = data?.allBooks

    if(loading) {
        return <p>Loading...</p>
    }

    if(!meData?.me?.favoriteGenre){
        return <p>No favorite genre set</p>
    }

    if(!books) {
       return <p>No recommended books</p> 
    }

    return (
        <div>
          <h2>Recommendations</h2>  
          <p>Books in your favorite genre <span><strong>{meData.me.favoriteGenre}</strong></span></p>
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
        </div>
    )
}

export default Recommended