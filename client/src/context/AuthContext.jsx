import { createContext, useCallback, useEffect, useState } from 'react';
import axios from 'axios';
import toast from 'react-hot-toast';
import { io } from 'socket.io-client';

// @ts-ignore
export const AuthContext = createContext();

const backendUrl = import.meta.env.VITE_BACKEND_URL;
axios.defaults.baseURL = backendUrl;

export const AuthProvider = ({ children }) => {
  const [token, setToken] = useState(localStorage.getItem('token'));
  const [authUser, setAuthUser] = useState(null);
  const [onlineUsers, setOnlineUsers] = useState([]);
  const [socket, setSocket] = useState(null);

  const checkAuth = useCallback(async () => {
    try {
      const { data } = await axios.get('/api/auth/check');
      if (data.success) {
        setAuthUser(data.user);
        connectSocket(data.user); // ⚠️ called only if socket is not already connected
      }
    } catch (error) {
      if (error.response?.status === 401) {
        console.log(
          'Not authenticated or token expired. Redirecting to login.'
        );
        setAuthUser(null);
        localStorage.removeItem('token');
        setToken(null);
      } else {
        console.error(
          'Check Auth Error:',
          error.response?.data?.message || error.message
        );
        toast.error(
          error.response?.data?.message || 'Authentication check failed.'
        );
      }
    }
  }, []);

  const login = async (state, credentials) => {
    try {
      const { data } = await axios.post(`/api/auth/${state}`, credentials);
      if (data.success) {
        setAuthUser(data.userData);
        connectSocket(data.userData);
        axios.defaults.headers.common['token'] = data.token;
        setToken(data.token);
        localStorage.setItem('token', data.token);
        toast.success(data.message);
        return { success: true, userData: data.userData };
      } else {
        toast.error(data.message || 'Login failed.');
      }
    } catch (error) {
      toast.error(
        error.response?.data?.message || error.message || 'Login failed.'
      );
    }
  };

  const logout = async () => {
    localStorage.removeItem('token');
    setToken(null);
    setAuthUser(null);
    setOnlineUsers([]);
    delete axios.defaults.headers.common['token'];

    if (socket) {
      socket.disconnect();
      setSocket(null);
    }

    toast.success('User logged out successfully');
  };

  const updateProfile = async (body) => {
    try {
      const { data } = await axios.put('/api/auth/update-profile', body);
      if (data.success) {
        setAuthUser(data.user);
        toast.success('User profile updated successfully');
      } else {
        toast.error(data.message || 'Profile update failed.');
      }
    } catch (error) {
      toast.error(
        error.response?.data?.message ||
          error.message ||
          'Profile update failed.'
      );
    }
  };

  const connectSocket = (userData) => {
    if (!userData || socket) return; // ✅ prevent duplicate connection

    const newSocket = io(backendUrl, {
      query: { userId: userData._id },
      transports: ['websocket'], // ✅ force websocket only
    });

    setSocket(newSocket);

    newSocket.on('connect', () => {
      console.log('Socket connected:', newSocket.id);
    });

    newSocket.on('getOnlineUsers', (userIds) => {
      setOnlineUsers(userIds);
    });

    newSocket.on('disconnect', () => {
      console.log('Socket disconnected');
    });
  };

  // Check auth on initial load
  useEffect(() => {
    if (token) {
      axios.defaults.headers.common['token'] = token;
      checkAuth();
    } else {
      setAuthUser(null);
      if (socket) {
        socket.disconnect();
        setSocket(null);
      }
    }
  }, [token, checkAuth]); // ✅ removed `socket` from dependency array

  // Disconnect socket on unmount
  useEffect(() => {
    return () => {
      if (socket) {
        socket.disconnect();
      }
    };
  }, [socket]);

  const value = {
    axios,
    authUser,
    onlineUsers,
    socket,
    login,
    logout,
    updateProfile,
  };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
};
