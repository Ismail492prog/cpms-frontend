import axios from 'axios';

const API_BASE_URL = 'http://localhost:8080';

const getAuthHeader = () => ({
    Authorization: `Bearer ${localStorage.getItem('token')}`
});

export const profileService = {
    // Get user profile
    getProfile: async () => {
        try {
            const response = await axios.get(`${API_BASE_URL}/api/user/profile`, {
                headers: getAuthHeader()
            });
            return response.data;
        } catch (error) {
            console.error('Failed to fetch profile:', error);
            throw error;
        }
    },

    // Update user profile
    updateProfile: async (profileData) => {
        try {
            const response = await axios.put(`${API_BASE_URL}/api/user/profile`, profileData, {
                headers: getAuthHeader()
            });
            return response.data;
        } catch (error) {
            console.error('Failed to update profile:', error);
            throw error;
        }
    },

    // Change password
    changePassword: async (passwordData) => {
        try {
            const response = await axios.post(`${API_BASE_URL}/api/user/change-password`, passwordData, {
                headers: getAuthHeader()
            });
            return response.data;
        } catch (error) {
            console.error('Failed to change password:', error);
            throw error;
        }
    },

    // Upload profile picture (File upload - keep for compatibility)
    uploadProfilePicture: async (file) => {
        try {
            const formData = new FormData();
            formData.append('file', file);
            
            const response = await axios.post(`${API_BASE_URL}/api/user/upload-profile-picture`, formData, {
                headers: {
                    ...getAuthHeader(),
                    'Content-Type': 'multipart/form-data'
                }
            });
            return response.data;
        } catch (error) {
            console.error('Failed to upload profile picture:', error);
            throw error;
        }
    },

    // ✅ Upload profile picture as Base64 (Recommended - no file system issues)
    uploadProfilePictureBase64: async (base64Image) => {
        try {
            const response = await axios.post(`${API_BASE_URL}/api/user/upload-profile-picture-base64`, 
                { image: base64Image },
                { headers: getAuthHeader() }
            );
            return response.data;
        } catch (error) {
            console.error('Failed to upload profile picture:', error);
            throw error;
        }
    }
};