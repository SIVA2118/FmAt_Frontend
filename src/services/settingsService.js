import authService from './authService';

const API_URL = 'http://localhost:5000/api/admin/settings';

const getSettings = async () => {
    const user = authService.getCurrentUser();
    if (!user || !user.token) {
        throw new Error('No authentication token');
    }

    const response = await fetch(API_URL, {
        method: 'GET',
        headers: {
            'Authorization': `Bearer ${user.token}`,
            'Content-Type': 'application/json'
        }
    });

    const data = await response.json();
    if (!response.ok) {
        throw new Error(data.message || 'Failed to fetch settings');
    }
    return data;
};

const updateSettings = async (settingsData) => {
    const user = authService.getCurrentUser();
    if (!user || !user.token) {
        throw new Error('No authentication token');
    }

    const response = await fetch(API_URL, {
        method: 'PUT',
        headers: {
            'Authorization': `Bearer ${user.token}`,
            'Content-Type': 'application/json'
        },
        body: JSON.stringify(settingsData)
    });

    const data = await response.json();
    if (!response.ok) {
        throw new Error(data.message || 'Failed to update settings');
    }
    return data;
};

const settingsService = {
    getSettings,
    updateSettings
};

export default settingsService;
