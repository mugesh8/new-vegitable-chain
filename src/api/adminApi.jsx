import api from './axiosConfig';

export const registerAdmin = async (adminData) => {
  const response = await api.post('/admin/register', adminData);
  return response.data;
};

export const getAllAdmins = async () => {
  const response = await api.get('/admin/all');
  return response.data;
};

export const getAdminById = async (id) => {
  const response = await api.get(`/admin/${id}`);
  return response.data;
};

export const updateAdmin = async (id, adminData) => {
  const response = await api.put(`/admin/${id}`, adminData);
  return response.data;
};

export const deleteAdmin = async (id) => {
  const response = await api.delete(`/admin/${id}`);
  return response.data;
};

export const updateRolesPermissions = async (id, permissions) => {
  const response = await api.put(`/admin/${id}/permissions`, permissions);
  return response.data;
};

export const getRolesPermissions = async (id) => {
  const response = await api.get(`/admin/${id}/permissions`);
  return response.data;
};