import { createContext, useState } from 'react';

// @ts-ignore
// eslint-disable-next-line react-refresh/only-export-components
export const ChatContext = createContext();

export const ChatProvider = ({ children }) => {
  const [selectedUser, setSelectedUser] = useState(null);
  const [users, setUsers] = useState([]);

  const value = {
    setSelectedUser,
    selectedUser,
    users,
    setUsers,
  };
  return <ChatContext.Provider value={value}>{children}</ChatContext.Provider>;
};
