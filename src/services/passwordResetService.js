import api from './api';

export const passwordResetService = {
    /**
     * Request a password reset email
     * @param {string} email - User's email address
     * @returns {Promise} API response
     */
    async requestPasswordReset(email) {
        const response = await api.post('/v1/auth/forgot-password', { email });
        return response.data;
    },

    /**
     * Verify if a reset token is valid
     * @param {string} token - Reset token from URL
     * @returns {Promise} Validation result with user email if valid
     */
    async verifyResetToken(token) {
        const response = await api.post('/v1/auth/verify-reset-token', { token });
        return response.data;
    },

    /**
     * Reset password with OTP
     * @param {string} email - User's email address
     * @param {string} otp - 6-digit OTP from email
     * @param {string} newPassword - New password
     * @returns {Promise} API response
     */
    async resetPassword(email, otp, newPassword) {
        const response = await api.post('/v1/auth/reset-password', {
            email,
            otp,
            new_password: newPassword
        });
        return response.data;
    }
};
