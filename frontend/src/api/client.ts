import axios from 'axios';

const api = axios.create({
    baseURL: 'http://localhost:3000/api', // Should be in env, hardcoded for MVP speed
    headers: {
        'Content-Type': 'application/json',
    },
});

api.interceptors.request.use((config) => {
    const token = localStorage.getItem('token');
    if (token) {
        config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
});

api.interceptors.response.use(
    (response) => response,
    (error) => {
        if (error.response) {
            const { status } = error.response;

            // Auth errors
            if (status === 401 || status === 403) {
                localStorage.removeItem('token');
                localStorage.removeItem('user');
                if (window.location.pathname !== '/login') {
                    window.location.href = '/login';
                }
            }

            // Server errors
            if (status >= 500) {
                if (window.location.pathname !== '/server-error') {
                    window.location.href = '/server-error';
                }
            }
        }
        return Promise.reject(error);
    }
);

export default api;
