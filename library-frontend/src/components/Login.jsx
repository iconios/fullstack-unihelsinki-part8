import { useMutation } from "@apollo/client"
import { USER_LOGIN } from "../services/queries"
import { useNavigate } from "react-router-dom"
import propTypes from 'prop-types'
import { useEffect } from "react"


const Login = ({ userToken }) => {
    const centeredAlign = {
        display: 'flex',
        justifyContent: 'center', /* Horizontally center */
        alignItems: 'center',     /* Vertically center */
        height: '100vh',
    }

    const [ userLogin, { data, loading, error } ] = useMutation(USER_LOGIN)
    const navigate = useNavigate()
    
    useEffect(() => {
        const result = data?.login.value
        if(result) {
            window.localStorage.setItem('loggedInUser', JSON.stringify(result))
            userToken(result)
            navigate('/')
        }
    }, [data?.login.value, navigate, userToken])

    const handleSubmit = async (e) => {
        e.preventDefault()
        const username = e.target.username.value
        const password = e.target.password.value
        if(username.length > 5 && password) {
            try {
                await userLogin({ variables: { username, password } })
            }
            catch(error) {
                console.error(error.message)
            }
        }
        else {
            alert('Check username length')
            e.target.username.value = ''
            e.target.password.value = ''
        }
    }

    if(loading) {
        return <p>Loading...</p>
    }
    
    return (
        <div style={centeredAlign}>
            { loading && <p>Loading...</p> }
            { error && <p>Error: {error.message}</p> }
            <form onSubmit={handleSubmit}>
                <label htmlFor="username">Name </label><input type="text" name="username" autoComplete="username" />
                <br />
                <label htmlFor="password">Password </label><input type="password" name="password" autoComplete="new-password" />
                <br />
                <button type="submit">Login</button>
            </form>
        </div>
    )
}

Login.propTypes = {
    userToken: propTypes.func.isRequired
}

export default Login