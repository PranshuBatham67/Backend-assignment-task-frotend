import api from './api';

export const taskService = {
    // Use V1 by default, but allow switching to V2 for advanced features

    async getTasks(params = {}) {
        // Determine if we need V2 features (multiple status filters)
        const useV2 = Array.isArray(params.status) && params.status.length > 1;
        const version = useV2 ? 'v2' : 'v1';

        // Construct query string manually for arrays if needed
        // axios handles arrays as 'status[]=TODO&status[]=IN_PROGRESS' 
        // but FastApi expects 'status=TODO&status=IN_PROGRESS' by default

        return api.get(`/${version}/tasks`, { params });
    },

    async getTask(id) {
        return api.get(`/v1/tasks/${id}`);
    },

    async createTask(data) {
        return api.post('/v1/tasks', data);
    },

    async updateTask(id, data, currentVersion) {
        // Must include current version for optimistic locking
        return api.put(`/v1/tasks/${id}`, { ...data, version: currentVersion });
    },

    async deleteTask(id) {
        return api.delete(`/v1/tasks/${id}`);
    },

    async getStats() {
        return api.get('/v1/tasks/stats');
    }
};
