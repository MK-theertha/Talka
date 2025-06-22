import { createContext, useState } from 'react';

// @ts-ignore
export const ChatContext = createContext();

export const ChatProvider = ({ children }) => {
  const [selectedUser, setSelectedUser] = useState(null);

  const value = {
    setSelectedUser,
    selectedUser,
  };
  return <ChatContext.Provider value={value}>{children}</ChatContext.Provider>;
};
