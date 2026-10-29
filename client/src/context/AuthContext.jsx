
import {
  createContext,
  useContext,
  useEffect,
  useMemo,
  useState,
} from 'react';

import api from '../api/axios';

const AuthContext = createContext(null);

// Safely retrieve the saved user from localStorage
const getStoredUser = () => {
  try {
    const raw = localStorage.getItem('lf_user');

    if (!raw || raw === 'undefined' || raw === 'null') {
      return null;
    }

    return JSON.parse(raw);
  } catch (error) {
    console.error('Could not read saved user:', error);
    localStorage.removeItem('lf_user');
    return null;
  }
};

export function AuthProvider({ children }) {
  const [user, setUser] = useState(getStoredUser);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const token = localStorage.getItem('lf_token');

    if (!token || token === 'undefined' || token === 'null') {
      localStorage.removeItem('lf_token');
      localStorage.removeItem('lf_user');
      setUser(null);
      setLoading(false);
      return;
    }

    api
      .get('/auth/profile')
      .then(({ data }) => {
        const nextUser = data.user;

        if (!nextUser) {
          throw new Error('User information was not returned by the server.');
        }

        setUser(nextUser);
        localStorage.setItem('lf_user', JSON.stringify(nextUser));
      })
      .catch((error) => {
        console.error('Authentication check failed:', error);
        localStorage.removeItem('lf_token');
        localStorage.removeItem('lf_user');
        setUser(null);
      })
      .finally(() => {
        setLoading(false);
      });
  }, []);

  const login = async (email, password) => {
    const { data } = await api.post('/auth/login', {
      email,
      password,
    });

    if (!data.token || !data.user) {
      throw new Error('Login response is missing the token or user information.');
    }

    localStorage.setItem('lf_token', data.token);
    localStorage.setItem('lf_user', JSON.stringify(data.user));

    setUser(data.user);

    return data.user;
  };

  const register = async (form) => {
    const { data } = await api.post('/auth/register', form);

    if (!data.token || !data.user) {
      throw new Error('Registration response is missing the token or user information.');
    }

    localStorage.setItem('lf_token', data.token);
    localStorage.setItem('lf_user', JSON.stringify(data.user));

    setUser(data.user);

    return data.user;
  };

  const logout = () => {
    localStorage.removeItem('lf_token');
    localStorage.removeItem('lf_user');
    setUser(null);
  };

  const value = useMemo(
    () => ({
      user,
      setUser,
      loading,
      login,
      register,
      logout,
    }),
    [user, loading]
  );

  return (
    <AuthContext.Provider value={value}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  return useContext(AuthContext);
}

