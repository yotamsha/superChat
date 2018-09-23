
const mockUsers = [
  {id: '1', firstName: 'Avi', lastName: 'Cohen', username: 'Aviii'},
  {id: '2', firstName: 'Dana', lastName: 'Cohen',  username: 'Yaell'},
  {id: '3', firstName: 'Meir', lastName: 'Cohen',  username: 'Longlonglonglongolong long'},
  {id: '4', firstName: 'Shoshi', lastName: 'Cohen',  username: 'A random Guy'},
];
const mockMessages = [
  {
    id: '1',
    text: 'yooo!',
    user: mockUsers[0]
  },
  {
    id: '2',
    text: 'yooou2!',
    user: mockUsers[1]
  },
  {
    id: '3',
    text: 'yooou3!',
    user: mockUsers[2]

  }
];
const mockChannels = [
  {
    title: 'Main Channel',
    id: '1',
    users: [mockUsers[0], mockUsers[1]],
    parentChannel: 'parentChannel',
    messages: [mockMessages[0], mockMessages[1]]
  },
  {
    title: 'Sub Channel',
    id: '2',
    users: [mockUsers[2], mockUsers[3]],
    parentChannel: 'parentChannel',
    messages: [mockMessages[1], mockMessages[2]]
  }
];

export {
  mockUsers,
  mockChannels,
  mockMessages
}