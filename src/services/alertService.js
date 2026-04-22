import axios from 'axios';

const API_BASE_URL = 'http://localhost:8080';

const getAuthHeader = () => ({
    Authorization: `Bearer ${localStorage.getItem('token')}`
});

export const alertService = {
    // Get all active alerts
    getAlerts: async () => {
        try {
            const response = await axios.get(`${API_BASE_URL}/api/alerts`, {
                headers: getAuthHeader()
            });
            return response.data;
        } catch (error) {
            console.error('Failed to fetch alerts:', error);
            throw error;
        }
    },

    // Get unread alerts only
    getUnreadAlerts: async () => {
        try {
            const response = await axios.get(`${API_BASE_URL}/api/alerts/unread`, {
                headers: getAuthHeader()
            });
            return response.data;
        } catch (error) {
            console.error('Failed to fetch unread alerts:', error);
            throw error;
        }
    },

    // Mark alert as read
    markAsRead: async (alertId) => {
        try {
            const response = await axios.put(`${API_BASE_URL}/api/alerts/${alertId}/read`, {}, {
                headers: getAuthHeader()
            });
            return response.data;
        } catch (error) {
            console.error('Failed to mark alert as read:', error);
            throw error;
        }
    },

    // Mark alert as resolved
    markAsResolved: async (alertId) => {
        try {
            const response = await axios.put(`${API_BASE_URL}/api/alerts/${alertId}/resolve`, {}, {
                headers: getAuthHeader()
            });
            return response.data;
        } catch (error) {
            console.error('Failed to mark alert as resolved:', error);
            throw error;
        }
    }
};