import { createContext, useContext, useState, useEffect } from 'react';
import api from '../api/api';

const AuthContext = createContext();

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const saved = localStorage.getItem('cts_user');
    if (saved) {
      try {
        setUser(JSON.parse(saved));
      } catch {
        localStorage.removeItem('cts_user');
      }
    }
    setLoading(false);
  }, []);

  const login = async (data) => {
    const res = await api.post('/user/login', data);
    // fetch full user profile for consistency
    if (res.data?.user?.id) {
      try {
        const profile = await api.get(`/user/auth/get/${res.data.user.id}`);
        setUser(profile.data);
        localStorage.setItem('cts_user', JSON.stringify(profile.data));
      } catch {
        setUser(res.data.user);
        localStorage.setItem('cts_user', JSON.stringify(res.data.user));
      }
    }
  };

  const logout = async () => {
    await api.post('/user/auth/logout');
    setUser(null);
    localStorage.removeItem('cts_user');
  };

  return (
    <AuthContext.Provider value={{ user, login, logout, loading }}>
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => useContext(AuthContext);
