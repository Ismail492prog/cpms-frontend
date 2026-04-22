import axios from 'axios';

const API_BASE_URL = 'http://localhost:8080';

const getAuthHeader = () => ({
    Authorization: `Bearer ${localStorage.getItem('token')}`
});

export const workerService = {
    // Get all workers for a project
    getWorkers: async (projectId) => {
        try {
            const response = await axios.get(
                `${API_BASE_URL}/api/projects/${projectId}/workers`,
                { headers: getAuthHeader() }
            );
            return response.data;
        } catch (error) {
            console.error('Failed to fetch workers:', error);
            throw error;
        }
    },

    // Add new worker
    addWorker: async (projectId, workerData) => {
        try {
            const response = await axios.post(
                `${API_BASE_URL}/api/projects/${projectId}/workers`,
                workerData,
                { headers: getAuthHeader() }
            );
            return response.data;
        } catch (error) {
            console.error('Failed to add worker:', error);
            throw error;
        }
    },

    // Remove worker
    removeWorker: async (workerId) => {
        try {
            const response = await axios.delete(
                `${API_BASE_URL}/api/workers/${workerId}`,
                { headers: getAuthHeader() }
            );
            return response.data;
        } catch (error) {
            console.error('Failed to remove worker:', error);
            throw error;
        }
    },

    // Check in
    checkIn: async (projectId, workerId) => {
        try {
            const response = await axios.post(
                `${API_BASE_URL}/api/projects/${projectId}/attendance/${workerId}/checkin`,
                {},
                { headers: getAuthHeader() }
            );
            return response.data;
        } catch (error) {
            console.error('Failed to check in:', error);
            throw error;
        }
    },

    // Check out
    checkOut: async (attendanceId) => {
        try {
            const response = await axios.post(
                `${API_BASE_URL}/api/attendance/${attendanceId}/checkout`,
                {},
                { headers: getAuthHeader() }
            );
            return response.data;
        } catch (error) {
            console.error('Failed to check out:', error);
            throw error;
        }
    },

    // Get daily attendance
    getDailyAttendance: async (projectId, date) => {
        try {
            const response = await axios.get(
                `${API_BASE_URL}/api/projects/${projectId}/attendance/daily?date=${date}`,
                { headers: getAuthHeader() }
            );
            return response.data;
        } catch (error) {
            console.error('Failed to fetch attendance:', error);
            throw error;
        }
    },

    // Get attendance summary
    getAttendanceSummary: async (projectId, startDate, endDate) => {
        try {
            const response = await axios.get(
                `${API_BASE_URL}/api/projects/${projectId}/attendance/summary?startDate=${startDate}&endDate=${endDate}`,
                { headers: getAuthHeader() }
            );
            return response.data;
        } catch (error) {
            console.error('Failed to fetch summary:', error);
            throw error;
        }
    }
};