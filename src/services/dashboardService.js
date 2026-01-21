import authService from './authService';

const API_URL = 'http://localhost:5000/api/admin';

const getStats = async () => {
    const user = authService.getCurrentUser();
    if (!user || !user.token) {
        throw new Error('No authentication token');
    }

    const response = await fetch(`${API_URL}/dashboard-stats`, {
        method: 'GET',
        headers: {
            'Authorization': `Bearer ${user.token}`,
            'Content-Type': 'application/json'
        }
    });

    const data = await response.json();

    if (!response.ok) {
        throw new Error(data.message || 'Failed to fetch dashboard stats');
    }

    return data;
};

const getUsersByCategory = async (category) => {
    const user = authService.getCurrentUser();
    if (!user || !user.token) {
        throw new Error('No authentication token');
    }

    const response = await fetch(`${API_URL}/users-by-category?category=${category}`, {
        method: 'GET',
        headers: {
            'Authorization': `Bearer ${user.token}`,
            'Content-Type': 'application/json'
        }
    });

    const data = await response.json();

    if (!response.ok) {
        throw new Error(data.message || 'Failed to fetch category users');
    }

    return data;
};

const getDailyLogs = async (date) => {
    const user = authService.getCurrentUser();
    if (!user || !user.token) {
        throw new Error('No authentication token');
    }

    let url = `${API_URL}/daily-log`;
    if (date) {
        url += `?date=${date}`;
    }

    const response = await fetch(url, {
        method: 'GET',
        headers: {
            'Authorization': `Bearer ${user.token}`,
            'Content-Type': 'application/json'
        }
    });

    const data = await response.json();

    if (!response.ok) {
        throw new Error(data.message || 'Failed to fetch daily logs');
    }

    return data;
};

const dashboardService = {
    getStats,
    getUsersByCategory,
    getDailyLogs
};

export default dashboardService;
