// // import { createContext, useContext, useState, useEffect, useCallback } from 'react';
// // import api from '../utils/api';

// // const AuthContext = createContext(null);

// // export const AuthProvider = ({ children }) => {
// //   const [user, setUser] = useState(null);
// //   const [loading, setLoading] = useState(true);

// //   const fetchMe = useCallback(async () => {
// //     try {
// //       const { data } = await api.get('/auth/me');
// //       setUser(data.user);
// //     } catch {
// //       setUser(null);
// //       localStorage.removeItem('accessToken');
// //     } finally {
// //       setLoading(false);
// //     }
// //   }, []);

// //   useEffect(() => {
// //     const token = localStorage.getItem('accessToken');
// //     if (token) fetchMe();
// //     else setLoading(false);
// //   }, [fetchMe]);

// //   const login = async (email, password) => {
// //     const { data } = await api.post('/auth/login', { email, password });
// //     localStorage.setItem('accessToken', data.accessToken);
// //     setUser(data.user);
// //     return data.user;
// //   };

// //   const register = async (name, email, password) => {
// //     const { data } = await api.post('/auth/register', { name, email, password });
// //     localStorage.setItem('accessToken', data.accessToken);
// //     setUser(data.user);
// //     return data.user;
// //   };

// //   const logout = async () => {
// //     try { await api.post('/auth/logout'); } catch {}
// //     localStorage.removeItem('accessToken');
// //     setUser(null);
// //   };

// //   return (
// //     <AuthContext.Provider value={{ user, loading, login, register, logout }}>
// //       {children}
// //     </AuthContext.Provider>
// //   );
// // };

// // export const useAuth = () => {
// //   const ctx = useContext(AuthContext);
// //   if (!ctx) throw new Error('useAuth must be used within AuthProvider');
// //   return ctx;
// // };


// import { createContext, useContext, useState, useEffect, useCallback } from 'react';
// import api from '../utils/api';

// const AuthContext = createContext(null);

// export const AuthProvider = ({ children }) => {
//   const [user, setUser] = useState(null);
//   const [loading, setLoading] = useState(true);

//   const fetchMe = useCallback(async () => {
//     try {
//       const { data } = await api.get('/auth/me');
//       setUser(data.user);
//     } catch {
//       setUser(null);
//       localStorage.removeItem('accessToken');
//     } finally {
//       setLoading(false);
//     }
//   }, []);

//   useEffect(() => {
//     const token = localStorage.getItem('accessToken');
//     if (token) fetchMe();
//     else setLoading(false);
//   }, [fetchMe]);

//   // Candidate login — name + email only, no password
//   const candidateLogin = async (name, email) => {
//     const { data } = await api.post('/auth/candidate-login', { name, email });
//     localStorage.setItem('accessToken', data.accessToken);
//     setUser(data.user);
//     return data.user;
//   };

//   // Admin login — email + password
//   const adminLogin = async (email, password) => {
//     const { data } = await api.post('/auth/login', { email, password });
//     localStorage.setItem('accessToken', data.accessToken);
//     setUser(data.user);
//     return data.user;
//   };

//   const logout = async () => {
//     try { await api.post('/auth/logout'); } catch {}
//     localStorage.removeItem('accessToken');
//     setUser(null);
//   };

//   return (
//     <AuthContext.Provider value={{ user, loading, candidateLogin, adminLogin, logout }}>
//       {children}
//     </AuthContext.Provider>
//   );
// };

// export const useAuth = () => {
//   const ctx = useContext(AuthContext);
//   if (!ctx) throw new Error('useAuth must be used within AuthProvider');
//   return ctx;
// };

import { createContext, useContext, useState, useEffect, useCallback } from 'react';
import api from '../utils/api';

const AuthContext = createContext(null);

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);

  const fetchMe = useCallback(async () => {
    try {
      const { data } = await api.get('/auth/me');
      setUser(data.user);
    } catch {
      // Not logged in — that's fine, just show login page
      setUser(null);
      localStorage.removeItem('accessToken');
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    const token = localStorage.getItem('accessToken');
    if (token) {
      fetchMe();
    } else {
      // No token — just stop loading and show login
      setLoading(false);
    }
  }, [fetchMe]);

  // Candidate login — name + email only
  const candidateLogin = async (name, email) => {
    const { data } = await api.post('/auth/candidate-login', { name, email });
    localStorage.setItem('accessToken', data.accessToken);
    setUser(data.user);
    return data.user;
  };

  // Admin login — email + password
  const adminLogin = async (email, password) => {
    const { data } = await api.post('/auth/login', { email, password });
    localStorage.setItem('accessToken', data.accessToken);
    setUser(data.user);
    return data.user;
  };

  const logout = async () => {
    try { await api.post('/auth/logout'); } catch {}
    localStorage.removeItem('accessToken');
    setUser(null);
  };

  // Show nothing while checking auth — prevents blank flash
  if (loading) {
    return (
      <div style={{
        minHeight: '100vh',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        background: '#0f0f1a'
      }}>
        <div style={{
          width: '32px',
          height: '32px',
          border: '2px solid #4f5fff',
          borderTopColor: 'transparent',
          borderRadius: '50%',
          animation: 'spin 0.8s linear infinite'
        }} />
        <style>{`@keyframes spin { to { transform: rotate(360deg); } }`}</style>
      </div>
    );
  }

  return (
    <AuthContext.Provider value={{ user, loading, candidateLogin, adminLogin, logout }}>
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error('useAuth must be used within AuthProvider');
  return ctx;
};