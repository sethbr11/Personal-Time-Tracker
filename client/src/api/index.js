import axios from 'axios';

const apiClient = axios.create({
  baseURL: '/api',
});

const api = {
  getData: async () => {
    const response = await apiClient.get('/data');
    return response.data;
  },

  clockIn: async startTime => {
    return await apiClient.post('/clock-in', { startTime });
  },

  clockOut: async (endTime, duration, notes) => {
    return await apiClient.post('/clock-out', { endTime, duration, notes });
  },

  addManualEntry: async entry => {
    return await apiClient.post('/manual-entry', entry);
  },

  addLegacyHours: async legacyHours => {
    const { hours, date, notes } = legacyHours;
    return await apiClient.post('/legacy-hours', { hours, date, notes });
  },
};

export default api;
