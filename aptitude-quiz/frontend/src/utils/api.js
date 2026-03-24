// // // // import axios from 'axios';

// // // // const api = axios.create({
// // // //   baseURL: import.meta.env.VITE_API_URL || '/api',
// // // //   withCredentials: true,
// // // // });

// // // // // Attach access token to every request
// // // // api.interceptors.request.use((config) => {
// // // //   const token = localStorage.getItem('accessToken');
// // // //   if (token) config.headers.Authorization = `Bearer ${token}`;
// // // //   return config;
// // // // });

// // // // // Auto-refresh on 401
// // // // let isRefreshing = false;
// // // // let failedQueue = [];

// // // // const processQueue = (error, token = null) => {
// // // //   failedQueue.forEach(prom => {
// // // //     if (error) prom.reject(error);
// // // //     else prom.resolve(token);
// // // //   });
// // // //   failedQueue = [];
// // // // };

// // // // api.interceptors.response.use(
// // // //   (res) => res,
// // // //   async (error) => {
// // // //     const originalRequest = error.config;

// // // //     if (error.response?.status === 401 && !originalRequest._retry) {
// // // //       if (isRefreshing) {
// // // //         return new Promise((resolve, reject) => {
// // // //           failedQueue.push({ resolve, reject });
// // // //         }).then(token => {
// // // //           originalRequest.headers.Authorization = `Bearer ${token}`;
// // // //           return api(originalRequest);
// // // //         });
// // // //       }

// // // //       originalRequest._retry = true;
// // // //       isRefreshing = true;

// // // //       try {
// // // //         const { data } = await api.post('/auth/refresh');
// // // //         const newToken = data.accessToken;
// // // //         localStorage.setItem('accessToken', newToken);
// // // //         processQueue(null, newToken);
// // // //         originalRequest.headers.Authorization = `Bearer ${newToken}`;
// // // //         return api(originalRequest);
// // // //       } catch (refreshError) {
// // // //         processQueue(refreshError, null);
// // // //         localStorage.removeItem('accessToken');
// // // //         window.location.href = '/login';
// // // //         return Promise.reject(refreshError);
// // // //       } finally {
// // // //         isRefreshing = false;
// // // //       }
// // // //     }

// // // //     return Promise.reject(error);
// // // //   }
// // // // );

// // // // export default api;
// // // import axios from 'axios';

// // // const api = axios.create({
// // //   baseURL: import.meta.env.VITE_API_URL || '/api',
// // //   withCredentials: true,
// // //   timeout: 30000,
// // // });

// // // // Attach access token to every request
// // // api.interceptors.request.use((config) => {
// // //   const token = localStorage.getItem('accessToken');
// // //   if (token) config.headers.Authorization = `Bearer ${token}`;
// // //   return config;
// // // }, (error) => Promise.reject(error));

// // // // Auto-refresh on 401
// // // let isRefreshing = false;
// // // let failedQueue = [];

// // // const processQueue = (error, token = null) => {
// // //   failedQueue.forEach(prom => {
// // //     if (error) prom.reject(error);
// // //     else prom.resolve(token);
// // //   });
// // //   failedQueue = [];
// // // };

// // // api.interceptors.response.use(
// // //   (res) => res,
// // //   async (error) => {
// // //     const originalRequest = error.config;

// // //     // If no response at all (network error), just reject
// // //     if (!error.response) {
// // //       return Promise.reject(error);
// // //     }

// // //     // Only try refresh on 401, and only once
// // //     if (error.response?.status === 401 && !originalRequest._retry) {
// // //       // If the failing request IS the refresh endpoint, just logout
// // //       if (originalRequest.url?.includes('/auth/refresh') ||
// // //           originalRequest.url?.includes('/auth/me')) {
// // //         localStorage.removeItem('accessToken');
// // //         return Promise.reject(error);
// // //       }

// // //       if (isRefreshing) {
// // //         return new Promise((resolve, reject) => {
// // //           failedQueue.push({ resolve, reject });
// // //         }).then(token => {
// // //           originalRequest.headers.Authorization = `Bearer ${token}`;
// // //           return api(originalRequest);
// // //         }).catch(err => Promise.reject(err));
// // //       }

// // //       originalRequest._retry = true;
// // //       isRefreshing = true;

// // //       try {
// // //         const { data } = await api.post('/auth/refresh');
// // //         const newToken = data.accessToken;
// // //         localStorage.setItem('accessToken', newToken);
// // //         processQueue(null, newToken);
// // //         originalRequest.headers.Authorization = `Bearer ${newToken}`;
// // //         return api(originalRequest);
// // //       } catch (refreshError) {
// // //         processQueue(refreshError, null);
// // //         localStorage.removeItem('accessToken');
// // //         // Don't redirect — let the app handle it gracefully
// // //         return Promise.reject(refreshError);
// // //       } finally {
// // //         isRefreshing = false;
// // //       }
// // //     }

// // //     return Promise.reject(error);
// // //   }
// // // );

// // // export default api;


// // import axios from 'axios';

// // const api = axios.create({
// //   baseURL: import.meta.env.VITE_API_URL || '/api',
// //   withCredentials: false, // Using localStorage instead of cookies
// // });

// // // Attach access token to every request
// // api.interceptors.request.use((config) => {
// //   const token = localStorage.getItem('accessToken');
// //   if (token) config.headers.Authorization = `Bearer ${token}`;
// //   return config;
// // });

// // // Auto-refresh on 401
// // let isRefreshing = false;
// // let failedQueue = [];

// // const processQueue = (error, token = null) => {
// //   failedQueue.forEach(prom => {
// //     if (error) prom.reject(error);
// //     else prom.resolve(token);
// //   });
// //   failedQueue = [];
// // };

// // api.interceptors.response.use(
// //   (res) => res,
// //   async (error) => {
// //     const originalRequest = error.config;

// //     if (error.response?.status === 401 && !originalRequest._retry) {
// //       if (isRefreshing) {
// //         return new Promise((resolve, reject) => {
// //           failedQueue.push({ resolve, reject });
// //         }).then(token => {
// //           originalRequest.headers.Authorization = `Bearer ${token}`;
// //           return api(originalRequest);
// //         });
// //       }

// //       originalRequest._retry = true;
// //       isRefreshing = true;

// //       try {
// //         const refreshToken = localStorage.getItem('refreshToken');
// //         if (!refreshToken) throw new Error('No refresh token');

// //         const { data } = await api.post('/auth/refresh', { refreshToken });
// //         const newAccessToken = data.accessToken;
// //         const newRefreshToken = data.refreshToken;

// //         localStorage.setItem('accessToken', newAccessToken);
// //         localStorage.setItem('refreshToken', newRefreshToken);

// //         processQueue(null, newAccessToken);
// //         originalRequest.headers.Authorization = `Bearer ${newAccessToken}`;
// //         return api(originalRequest);
// //       } catch (refreshError) {
// //         processQueue(refreshError, null);
// //         localStorage.removeItem('accessToken');
// //         localStorage.removeItem('refreshToken');
// //         window.location.href = '/login';
// //         return Promise.reject(refreshError);
// //       } finally {
// //         isRefreshing = false;
// //       }
// //     }

// //     return Promise.reject(error);
// //   }
// // );

// // export default api;


// import axios from 'axios';

// const api = axios.create({
//   baseURL: import.meta.env.VITE_API_URL || '/api',
//   withCredentials: false,
//   timeout: 15000, // 15 second timeout — don't hang forever
// });

// // Attach access token to every request
// api.interceptors.request.use((config) => {
//   const token = localStorage.getItem('accessToken');
//   if (token) config.headers.Authorization = `Bearer ${token}`;
//   return config;
// });

// // Auto-refresh on 401
// let isRefreshing = false;
// let failedQueue = [];

// const processQueue = (error, token = null) => {
//   failedQueue.forEach(prom => {
//     if (error) prom.reject(error);
//     else prom.resolve(token);
//   });
//   failedQueue = [];
// };

// const clearAndRedirect = () => {
//   localStorage.removeItem('accessToken');
//   localStorage.removeItem('refreshToken');
//   // Only redirect if not already on login page
//   if (!window.location.pathname.includes('/login')) {
//     window.location.href = '/login';
//   }
// };

// api.interceptors.response.use(
//   (res) => res,
//   async (error) => {
//     const originalRequest = error.config;

//     // Network timeout or no response — don't try to refresh
//     if (!error.response) {
//       return Promise.reject(error);
//     }

//     if (error.response?.status === 401 && !originalRequest._retry) {
//       // Skip refresh for the refresh endpoint itself and login endpoints
//       if (
//         originalRequest.url?.includes('/auth/refresh') ||
//         originalRequest.url?.includes('/auth/login') ||
//         originalRequest.url?.includes('/auth/candidate-login')
//       ) {
//         clearAndRedirect();
//         return Promise.reject(error);
//       }

//       if (isRefreshing) {
//         return new Promise((resolve, reject) => {
//           failedQueue.push({ resolve, reject });
//         }).then(token => {
//           originalRequest.headers.Authorization = `Bearer ${token}`;
//           return api(originalRequest);
//         }).catch(err => Promise.reject(err));
//       }

//       originalRequest._retry = true;
//       isRefreshing = true;

//       try {
//         const refreshToken = localStorage.getItem('refreshToken');

//         // No refresh token at all — go to login immediately
//         if (!refreshToken) {
//           clearAndRedirect();
//           return Promise.reject(error);
//         }

//         const { data } = await axios.post(
//           `${import.meta.env.VITE_API_URL || '/api'}/auth/refresh`,
//           { refreshToken },
//           { timeout: 10000 }
//         );

//         const newAccessToken = data.accessToken;
//         const newRefreshToken = data.refreshToken;

//         localStorage.setItem('accessToken', newAccessToken);
//         localStorage.setItem('refreshToken', newRefreshToken);

//         processQueue(null, newAccessToken);
//         originalRequest.headers.Authorization = `Bearer ${newAccessToken}`;
//         return api(originalRequest);
//       } catch (refreshError) {
//         processQueue(refreshError, null);
//         clearAndRedirect();
//         return Promise.reject(refreshError);
//       } finally {
//         isRefreshing = false;
//       }
//     }

//     return Promise.reject(error);
//   }
// );

// export default api;


import axios from 'axios';

const api = axios.create({
  baseURL: import.meta.env.VITE_API_URL || '/api',
  withCredentials: false,
  timeout: 20000,
});

// Attach access token to every request
api.interceptors.request.use((config) => {
  const token = localStorage.getItem('accessToken');
  if (token) config.headers.Authorization = `Bearer ${token}`;
  return config;
});

let isRefreshing = false;
let failedQueue = [];

const processQueue = (error, token = null) => {
  failedQueue.forEach(prom => {
    if (error) prom.reject(error);
    else prom.resolve(token);
  });
  failedQueue = [];
};

const clearAndRedirect = () => {
  localStorage.removeItem('accessToken');
  localStorage.removeItem('refreshToken');
  if (!window.location.pathname.includes('/login')) {
    window.location.href = '/login';
  }
};

api.interceptors.response.use(
  (res) => res,
  async (error) => {
    const originalRequest = error.config;

    // No response at all (network error/timeout)
    if (!error.response) {
      return Promise.reject(error);
    }

    // Skip refresh for auth endpoints to avoid loops
    const isAuthEndpoint =
      originalRequest.url?.includes('/auth/refresh') ||
      originalRequest.url?.includes('/auth/login') ||
      originalRequest.url?.includes('/auth/candidate-login');

    if (error.response?.status === 401 && !originalRequest._retry && !isAuthEndpoint) {
      if (isRefreshing) {
        return new Promise((resolve, reject) => {
          failedQueue.push({ resolve, reject });
        }).then(token => {
          originalRequest.headers.Authorization = `Bearer ${token}`;
          return api(originalRequest);
        }).catch(err => Promise.reject(err));
      }

      originalRequest._retry = true;
      isRefreshing = true;

      const refreshToken = localStorage.getItem('refreshToken');

      if (!refreshToken) {
        isRefreshing = false;
        clearAndRedirect();
        return Promise.reject(error);
      }

      try {
        const { data } = await axios.post(
          `${import.meta.env.VITE_API_URL || '/api'}/auth/refresh`,
          { refreshToken },
          { timeout: 10000 }
        );

        localStorage.setItem('accessToken', data.accessToken);
        localStorage.setItem('refreshToken', data.refreshToken);

        processQueue(null, data.accessToken);
        originalRequest.headers.Authorization = `Bearer ${data.accessToken}`;
        return api(originalRequest);
      } catch (refreshError) {
        processQueue(refreshError, null);
        clearAndRedirect();
        return Promise.reject(refreshError);
      } finally {
        isRefreshing = false;
      }
    }

    return Promise.reject(error);
  }
);

export default api;