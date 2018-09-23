import React from 'react'
import UserAPI from '../model/UserAPI'
import sessionProvider from './../services/sessionProvider'

const sessionUser = sessionProvider.has('user') && JSON.parse(sessionProvider.get('user'))
const UserContext = React.createContext({
  user: sessionUser || UserAPI.getDefaultUser()
});

export default UserContext