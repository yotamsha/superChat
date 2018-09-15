import React from 'react'
import {mockUsers} from '../mocks'

const UserContext = React.createContext({
  user: mockUsers[1]
});

export default UserContext