import { Link, useNavigate } from "react-router-dom"
import { useApolloClient } from "@apollo/client"
import { useState, useEffect } from "react"
import propTypes from 'prop-types'


const centerHorizontal = {
  display: 'flex',
  justifyContent: 'center',
}

const NavBar = ({ user }) => {
    const navigate = useNavigate()
    const [ token, setToken ] = useState(null)
    const apolloClient = useApolloClient()
    const loggedInUser = JSON.parse(window.localStorage.getItem('loggedInUser'))
    useEffect(() => {
        if(loggedInUser || user) {
          setToken(loggedInUser)
        }
      }, [loggedInUser, user])

      const handleLogOut = (e) => {
        e.preventDefault()
        window.localStorage.clear('loggedInUser')
        setToken(null)
        apolloClient.resetStore()
        navigate('/login')
      }

    return (
        <div style={centerHorizontal}>            
            {!token && <Link to='/login'><button>login</button></Link>}
            <Link to='/'><button>authors</button></Link>
            <Link to='/books'><button>books</button></Link>
            {token && <Link to='/newbook'><button>add book</button></Link>}
            {token && <Link to='/recommended'><button>recommended</button></Link>}
            {token && <button type="button" onClick={handleLogOut}>logout</button>}
        </div>
    )
}

NavBar.propTypes = {
    user: propTypes.string
}

export default NavBar