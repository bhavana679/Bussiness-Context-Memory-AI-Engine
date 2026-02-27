import { create } from 'zustand';

const useAppStore = create((set, get) => ({
    auth: {
        token: localStorage.getItem('auth_token') || null,
        role: localStorage.getItem('user_role') || 'guest',
        isAuthenticated: !!localStorage.getItem('auth_token'),
    },

    selectedDistributorId: null,

    dashboardCache: null,
    alertsCache: [],
    lastCacheUpdate: {
        dashboard: null,
        alerts: null
    },

    setAuth: (token, role) => {
        set(() => ({
            auth: { token, role, isAuthenticated: !!token }
        }));
        if (token) {
            localStorage.setItem('auth_token', token);
            localStorage.setItem('user_role', role);
        } else {
            localStorage.removeItem('auth_token');
            localStorage.removeItem('user_role');
        }
    },

    setRole: (role) => {
        set((state) => ({
            auth: { ...state.auth, role, isAuthenticated: true }
        }));
        localStorage.setItem('user_role', role);
    },

    logout: () => {
        localStorage.removeItem('auth_token');
        localStorage.removeItem('user_role');
        set({
            auth: { token: null, role: 'guest', isAuthenticated: false },
            dashboardCache: null,
            alertsCache: [],
            selectedDistributorId: null
        });
    },

    setSelectedDistributor: (id) => set({ selectedDistributorId: id }),

    setDashboardCache: (data) => set({
        dashboardCache: data,
        lastCacheUpdate: { ...get().lastCacheUpdate, dashboard: Date.now() }
    }),

    setAlertsCache: (data) => set({
        alertsCache: data,
        lastCacheUpdate: { ...get().lastCacheUpdate, alerts: Date.now() }
    }),

    isCacheValid: (key) => {
        const lastUpdate = get().lastCacheUpdate[key];
        if (!lastUpdate) return false;

        const fiveMinutes = 5 * 60 * 1000;
        return (Date.now() - lastUpdate) < fiveMinutes;
    },

    addAlert: (alert) => set((state) => ({
        alertsCache: [alert, ...state.alertsCache],
        lastCacheUpdate: { ...state.lastCacheUpdate, alerts: Date.now() }
    })),

    clearCache: () => set({
        dashboardCache: null,
        alertsCache: [],
        lastCacheUpdate: { dashboard: null, alerts: null }
    })
}));

export default useAppStore;
