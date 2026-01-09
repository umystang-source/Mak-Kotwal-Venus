import axios from 'axios';

const API_URL = process.env.REACT_APP_API_URL || '';
const DOWNLOAD_URL = process.env.REACT_APP_API_URL || 'http://localhost:5000';

// Projects API
export const projectsAPI = {
  // Search projects with filters
  search: async (filters = {}) => {
    const params = new URLSearchParams();
    Object.entries(filters).forEach(([key, value]) => {
      if (value !== undefined && value !== '' && value !== null) {
        params.append(key, value);
      }
    });
    const response = await axios.get(`${API_URL}/api/projects/search?${params.toString()}`);
    return response.data;
  },

  // Get single project
  getById: async (id) => {
    const response = await axios.get(`${API_URL}/api/projects/${id}`);
    return response.data;
  },

  // Create project
  create: async (projectData) => {
    const response = await axios.post(`${API_URL}/api/projects`, projectData);
    return response.data;
  },

  // Update project
  update: async (id, projectData) => {
    const response = await axios.put(`${API_URL}/api/projects/${id}`, projectData);
    return response.data;
  },

  // Delete project
  delete: async (id) => {
    const response = await axios.delete(`${API_URL}/api/projects/${id}`);
    return response.data;
  },

  // Bulk upload via Excel
  bulkUpload: async (file) => {
    const formData = new FormData();
    formData.append('file', file);
    const response = await axios.post(`${API_URL}/api/projects/bulk-upload`, formData, {
      headers: { 'Content-Type': 'multipart/form-data' }
    });
    return response.data;
  },

  // Upload media files
  uploadMedia: async (projectId, files, mediaType, configuration, description) => {
    const formData = new FormData();
    files.forEach(file => formData.append('files', file));
    if (mediaType) formData.append('media_type', mediaType);
    if (configuration) formData.append('configuration', configuration);
    if (description) formData.append('description', description);
    
    const response = await axios.post(`${API_URL}/api/projects/${projectId}/media`, formData, {
      headers: { 'Content-Type': 'multipart/form-data' }
    });
    return response.data;
  },

  // Update visibility
  updateVisibility: async (id, field, visible) => {
    const response = await axios.patch(`${API_URL}/api/projects/${id}/visibility`, { 
      field, visible 
    });
    return response.data;
  },

  // Toggle project visibility
  toggleProjectVisibility: async (id, visible) => {
    const response = await axios.patch(`${API_URL}/api/projects/${id}/visibility`, { 
      projectVisible: visible 
    });
    return response.data;
  },

  // Toggle media visibility
  toggleMediaVisibility: async (mediaId, visible) => {
    const response = await axios.patch(`${API_URL}/api/projects/media/${mediaId}/visibility`, { 
      visible 
    });
    return response.data;
  },

  // Get similar projects
  getSimilar: async (id) => {
    const response = await axios.get(`${API_URL}/api/projects/${id}/similar`);
    return response.data;
  },

  // Download media
  getMediaDownloadUrl: (mediaId) => {
    return `${DOWNLOAD_URL}/api/projects/media/${mediaId}/download`;
  },

  // Delete media
  deleteMedia: async (mediaId) => {
    const response = await axios.delete(`${API_URL}/api/projects/media/${mediaId}`);
    return response.data;
  },

  // Bulk delete projects
  bulkDelete: async (projectIds) => {
    const response = await axios.post(`${API_URL}/api/projects/bulk-delete`, { projectIds });
    return response.data;
  },

  // Export projects to Excel
  exportProjects: async (projectIds = []) => {
    const response = await axios.post(`${API_URL}/api/projects/export`,
      { projectIds },
      { responseType: 'blob' }
    );
    return response.data;
  },

  // Download Excel template
  downloadTemplate: async () => {
    const response = await axios.get(`${API_URL}/api/projects/template/download`, {
      responseType: 'blob'
    });
    return response.data;
  }
};

// Users API
export const usersAPI = {
  // Get all users (admin only)
  getAll: async () => {
    const response = await axios.get(`${API_URL}/api/users`);
    return response.data;
  },

  // Create user (admin only)
  create: async (userData) => {
    const response = await axios.post(`${API_URL}/api/users`, userData);
    return response.data;
  },

  // Delete user (admin only)
  delete: async (userId) => {
    const response = await axios.delete(`${API_URL}/api/users/${userId}`);
    return response.data;
  },

  // Toggle user visibility (admin only)
  toggleVisibility: async (userId, visible) => {
    const response = await axios.patch(`${API_URL}/api/users/${userId}/visibility`, { visible });
    return response.data;
  },

  // Update user role (admin only)
  updateRole: async (userId, role) => {
    const response = await axios.patch(`${API_URL}/api/users/${userId}/role`, { role });
    return response.data;
  },

  // Update user attribute visibility (admin only)
  updateUserAttributes: async (userId, visibleAttributes) => {
    const response = await axios.patch(`${API_URL}/api/users/${userId}/attributes`, { visibleAttributes });
    return response.data;
  }
};

// Auth API
export const authAPI = {
  // Setup 2FA - Get QR code
  setup2FA: async () => {
    const response = await axios.post(`${API_URL}/api/auth/setup-2fa`);
    return response.data;
  },

  // Enable 2FA with verification token
  enable2FA: async (token) => {
    const response = await axios.post(`${API_URL}/api/auth/enable-2fa`, { token });
    return response.data;
  },

  // Disable 2FA with verification token
  disable2FA: async (token) => {
    const response = await axios.post(`${API_URL}/api/auth/disable-2fa`, { token });
    return response.data;
  },

  // Verify TOTP during login
  verifyTOTP: async (userId, token) => {
    const response = await axios.post(`${API_URL}/api/auth/verify-totp`, { userId, token });
    return response.data;
  }
};

export default projectsAPI;
