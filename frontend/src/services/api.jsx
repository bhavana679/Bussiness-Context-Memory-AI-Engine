import axios from 'axios';
import toast from 'react-hot-toast';
import React from 'react';

const apiClient = axios.create({
    baseURL: import.meta.env.VITE_API_BASE_URL || 'http://localhost:8000',
    timeout: 10000,
    headers: {
        'Content-Type': 'application/json',
    },
});

apiClient.interceptors.request.use(
    (config) => {
        config.metadata = { startTime: new Date() };
        const token = localStorage.getItem('auth_token');
        if (token) {
            config.headers.Authorization = `Bearer ${token}`;
        }
        return config;
    },
    (error) => {
        return Promise.reject(error);
    }
);

apiClient.interceptors.response.use(
    (response) => {
        return response.data;
    },
    (error) => {
        if (axios.isCancel(error) || error.name === 'CanceledError') {
            return Promise.reject(error);
        }

        const normalizedError = {
            message: 'Engine communication failure',
            status: error.response?.status,
            data: error.response?.data,
            config: error.config,
        };

        if (error.response) {
            if (error.response.status === 401 && error.config.url.includes('/login')) {
                normalizedError.message = error.response.data?.detail || 'Invalid email or password.';
            } else if (error.response.status === 401) {
                normalizedError.message = 'Authentication required. Please re-login.';
                localStorage.removeItem('auth_token');
                localStorage.removeItem('user_role');
                // Redirect user back to login so they don't get stuck
                if (!window.location.pathname.includes('/login')) {
                    window.location.href = '/login';
                }
            } else if (error.response.status === 422) {
                // FastAPI gives validation errors as an array in detail
                const detail = error.response.data?.detail;
                if (Array.isArray(detail)) {
                    normalizedError.message = detail.map(e => e.msg).join(', ');
                } else {
                    normalizedError.message = detail || 'Validation Error';
                }
            } else {
                normalizedError.message = error.response.data?.detail || 'The request was rejected by the server.';
            }
        } else if (error.request) {
            normalizedError.message = 'No response from memory layer. Pulse check failed.';
        }

        toast.error((t) => (
            <div className="flex items-center space-x-4">
                <span className="text-xs font-bold">{normalizedError.message}</span>
                {normalizedError.config && (
                    <button
                        onClick={() => {
                            toast.dismiss(t.id);
                            apiClient.request(normalizedError.config);
                        }}
                        className="bg-red-500 text-white px-2 py-1 rounded text-[10px] font-black uppercase hover:bg-red-600 transition-colors"
                    >
                        Retry
                    </button>
                )}
            </div>
        ), {
            duration: 5000,
            position: 'top-right',
            style: {
                borderRadius: '12px',
                background: '#fff',
                color: '#1f2937',
                border: '1px solid #fee2e2',
                boxShadow: '0 10px 15px -3px rgb(0 0 0 / 0.1)',
            }
        });

        return Promise.reject(normalizedError);
    }
);


export const postSignup = async (payload, config = {}) => {
    return apiClient.post('/api/auth/signup', payload, config);
};

export const postLogin = async (payload, config = {}) => {
    return apiClient.post('/api/auth/login', payload, config);
};

export const getDashboardSummary = async (config = {}) => {
    return apiClient.get('/api/dashboard-summary', config);
};

export const getDistributors = async (params = {}, config = {}) => {
    return apiClient.get('/api/distributors', { ...config, params });
};

export const getDistributorById = async (id, config = {}) => {
    return apiClient.get(`/api/distributor/${id}`, config);
};

export const postCreditRequest = async (payload, config = {}) => {
    return apiClient.post('/api/credit-request', payload, config);
};

export const getCreditHistory = async (config = {}) => {
    return apiClient.get('/api/credit-history', config);
};

export const getRiskAlerts = async (config = {}) => {
    return apiClient.get('/api/risk-alerts', config);
};


export default apiClient;
