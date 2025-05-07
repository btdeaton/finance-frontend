import React, { createContext, useState, useEffect, useContext } from 'react';
import { login as apiLogin } from '../api/auth';

const AuthContext = createContext(null);

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    // Check if user is logged in
    const token = localStorage.getItem('token');
    if (token) {
      // You might want to validate the token or fetch user info here
      setUser({ token });
    }
    setLoading(false);
  }, []);

  const login = async (email, password) => {
    try {
      const response = await apiLogin(email, password);
      console.log('Login response in context:', response);
      
      // Check if we got an access token
      if (response && response.data && response.data.access_token) {
        const { access_token } = response.data;
        localStorage.setItem('token', access_token);
        setUser({ token: access_token });
        return true;
      } else {
        console.error('No access token in response:', response);
        return false;
      }
    } catch (error) {
      console.error('Login failed in context:', error);
      return false;
    }
  };

  const logout = () => {
    localStorage.removeItem('token');
    setUser(null);
  };

  return (
    <AuthContext.Provider value={{ user, login, logout, loading }}>
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => useContext(AuthContext);