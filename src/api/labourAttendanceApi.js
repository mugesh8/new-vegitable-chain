import api from './axiosConfig';

export const getAllAttendance = async (filters = {}) => {
  try {
    const params = new URLSearchParams();
    if (filters.date) params.append('date', filters.date);
    if (filters.status && filters.status !== 'All') params.append('status', filters.status);
    if (filters.department && filters.department !== 'All') params.append('department', filters.department);
    if (filters.search) params.append('search', filters.search);
    
    const response = await api.get(`/labour-attendance/overview?${params.toString()}`);
    return response.data;
  } catch (error) {
    throw error.response?.data || error.message;
  }
};

export const markPresent = async (labourId, data = {}) => {
  try {
    const response = await api.post(`/labour-attendance/${labourId}/mark-present`, data);
    return response.data;
  } catch (error) {
    throw error.response?.data || error.message;
  }
};

export const markCheckOut = async (labourId, data = {}) => {
  try {
    const response = await api.post(`/labour-attendance/${labourId}/check-out`, data);
    return response.data;
  } catch (error) {
    throw error.response?.data || error.message;
  }
};

export const markAbsent = async (labourId, data = {}) => {
  try {
    const response = await api.post(`/labour-attendance/${labourId}/mark-absent`, data);
    return response.data;
  } catch (error) {
    throw error.response?.data || error.message;
  }
};

export const getPresentLaboursToday = async (date) => {
  try {
    const params = date ? `?date=${date}` : '';
    const response = await api.get(`/labour-attendance/overview${params}`);
    return response.data;
  } catch (error) {
    throw error.response?.data || error.message;
  }
};
