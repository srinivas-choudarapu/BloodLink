import api from './api';

// Hospital API service for all dashboard operations
const hospitalApi = {
  // Notify nearby donors about blood request
  notifyNearbyDonors: async (bloodType) => {
    try {
      const response = await api.post('/hospital/notify-donors', { bloodType });
      return response.data;
    } catch (error) {
      throw error;
    }
  },
  // Create a new blood request
  createRequest: async (requestData) => {
    try {
      const response = await api.post('/hospital/request', requestData);
      return response.data;
    } catch (error) {
      throw error;
    }
  },

  // Get all requests for the hospital
  getAllRequests: async () => {
    try {
      const response = await api.get('/hospital/requests');
      return response.data.requests || [];
    } catch (error) {
      throw error;
    }
  },

  // Get request summary statistics
  getRequestSummary: async () => {
    try {
      const response = await api.get('/hospital/requests/summary');
      return response.data || { Open: 0, Fulfilled: 0, Cancelled: 0 };
    } catch (error) {
      throw error;
    }
  },

  // Update a specific request
  updateRequest: async (requestId, updateData) => {
    try {
      const response = await api.patch(`/hospital/request/${requestId}`, updateData);
      return response.data;
    } catch (error) {
      throw error;
    }
  },

  // Delete a specific request
  deleteRequest: async (requestId) => {
    try {
      const response = await api.delete(`/hospital/request/${requestId}`);
      return response.data;
    } catch (error) {
      throw error;
    }
  },

  // Delete all requests for the hospital
  deleteAllRequests: async () => {
    try {
      const response = await api.delete('/hospital/requests');
      return response.data;
    } catch (error) {
      throw error;
    }
  },

  // Delete multiple selected requests
  deleteSelectedRequests: async (requestIds) => {
    try {
      const deletePromises = requestIds.map(id => api.delete(`/hospital/request/${id}`));
      const responses = await Promise.all(deletePromises);
      return responses.map(response => response.data);
    } catch (error) {
      throw error;
    }
  },

  // Get requests by status
  getRequestsByStatus: async (status) => {
    try {
      const response = await api.get(`/hospital/requests/status/${status}`);
      return response.data.requests || [];
    } catch (error) {
      throw error;
    }
  },

  // Get hospital profile
  getHospitalProfile: async () => {
    try {
      const response = await api.get('/hospital/profile');
      return response.data;
    } catch (error) {
      throw error;
    }
  },

  // Update hospital profile
  updateHospitalProfile: async (profileData) => {
    try {
      const response = await api.patch('/hospital/profile', profileData);
      return response.data;
    } catch (error) {
      throw error;
    }
  },

  // Get available donors
  getDonors: async () => {
    try {
      const response = await api.get('/hospital/donors');
      return response.data.donors || [];
    } catch (error) {
      throw error;
    }
  },

  // Validate request data before submission
  validateRequestData: (data) => {
    const errors = [];
    
    if (!data.bloodGroup) {
      errors.push('Blood group is required');
    }
    
    if (!data.units || data.units < 1) {
      errors.push('Units must be at least 1');
    }
    
    if (data.units > 100) {
      errors.push('Units cannot exceed 100');
    }
    
    const validBloodGroups = ['A+', 'A-', 'B+', 'B-', 'AB+', 'AB-', 'O+', 'O-'];
    if (data.bloodGroup && !validBloodGroups.includes(data.bloodGroup)) {
      errors.push('Invalid blood group');
    }
    
    return {
      isValid: errors.length === 0,
      errors
    };
  },

  // Validate edit data
  validateEditData: (data) => {
    const errors = [];
    
    if (!data.id) {
      errors.push('Request ID is required');
    }
    
    if (!data.bloodGroup) {
      errors.push('Blood group is required');
    }
    
    if (!data.units || data.units < 1) {
      errors.push('Units must be at least 1');
    }
    
    if (data.units > 100) {
      errors.push('Units cannot exceed 100');
    }
    
    const validBloodGroups = ['A+', 'A-', 'B+', 'B-', 'AB+', 'AB-', 'O+', 'O-'];
    if (data.bloodGroup && !validBloodGroups.includes(data.bloodGroup)) {
      errors.push('Invalid blood group');
    }
    
    const validStatuses = ['Open', 'Fulfilled', 'Cancelled'];
    if (data.status && !validStatuses.includes(data.status)) {
      errors.push('Invalid status');
    }
    
    return {
      isValid: errors.length === 0,
      errors
    };
  },

  // Format request data for display
  formatRequestData: (request) => {
    return {
      ...request,
      formattedDate: new Date(request.createdAt).toLocaleDateString('en-US', {
        year: 'numeric',
        month: 'short',
        day: 'numeric',
        hour: '2-digit',
        minute: '2-digit'
      }),
      statusColor: getStatusColor(request.status),
      statusIcon: getStatusIcon(request.status)
    };
  },

  // Get status color for UI
  getStatusColor: (status) => {
    const colors = {
      'Open': '#007bff',
      'Fulfilled': '#28a745',
      'Cancelled': '#dc3545'
    };
    return colors[status] || '#6c757d';
  },

  // Get status icon for UI
  getStatusIcon: (status) => {
    const icons = {
      'Open': '⏳',
      'Fulfilled': '✅',
      'Cancelled': '❌'
    };
    return icons[status] || '❓';
  },

  // Filter requests by multiple criteria
  filterRequests: (requests, filters) => {
    return requests.filter(request => {
      // Status filter
      if (filters.status && !filters.status[request.status]) {
        return false;
      }
      
      // Blood group filter
      if (filters.bloodGroup && filters.bloodGroup.length > 0) {
        if (!filters.bloodGroup.includes(request.bloodGroup)) {
          return false;
        }
      }
      
      // Date range filter
      if (filters.dateFrom) {
        const requestDate = new Date(request.createdAt);
        const fromDate = new Date(filters.dateFrom);
        if (requestDate < fromDate) {
          return false;
        }
      }
      
      if (filters.dateTo) {
        const requestDate = new Date(request.createdAt);
        const toDate = new Date(filters.dateTo);
        if (requestDate > toDate) {
          return false;
        }
      }
      
      // Units range filter
      if (filters.minUnits && request.units < filters.minUnits) {
        return false;
      }
      
      if (filters.maxUnits && request.units > filters.maxUnits) {
        return false;
      }
      
      return true;
    });
  },

  // Sort requests by various criteria
  sortRequests: (requests, sortBy, sortOrder = 'asc') => {
    return [...requests].sort((a, b) => {
      let aValue = a[sortBy];
      let bValue = b[sortBy];
      
      // Handle date sorting
      if (sortBy === 'createdAt') {
        aValue = new Date(aValue);
        bValue = new Date(bValue);
      }
      
      // Handle string sorting
      if (typeof aValue === 'string') {
        aValue = aValue.toLowerCase();
        bValue = bValue.toLowerCase();
      }
      
      if (sortOrder === 'asc') {
        return aValue > bValue ? 1 : -1;
      } else {
        return aValue < bValue ? 1 : -1;
      }
    });
  },

  // Get request statistics
  getRequestStatistics: (requests) => {
    const stats = {
      total: requests.length,
      open: 0,
      fulfilled: 0,
      cancelled: 0,
      totalUnits: 0,
      bloodGroupCounts: {},
      monthlyCounts: {}
    };
    
    requests.forEach(request => {
      // Count by status
      stats[request.status.toLowerCase()]++;
      
      // Count total units
      stats.totalUnits += request.units;
      
      // Count by blood group
      stats.bloodGroupCounts[request.bloodGroup] = (stats.bloodGroupCounts[request.bloodGroup] || 0) + 1;
      
      // Count by month
      const month = new Date(request.createdAt).toISOString().substring(0, 7);
      stats.monthlyCounts[month] = (stats.monthlyCounts[month] || 0) + 1;
    });
    
    return stats;
  },

  // Export requests to CSV format
  exportRequestsToCSV: (requests) => {
    const headers = ['Blood Group', 'Units', 'Status', 'Created Date', 'Updated Date'];
    const csvContent = [
      headers.join(','),
      ...requests.map(request => [
        request.bloodGroup,
        request.units,
        request.status,
        new Date(request.createdAt).toLocaleDateString(),
        new Date(request.updatedAt).toLocaleDateString()
      ].join(','))
    ].join('\n');
    
    return csvContent;
  },

  // Download CSV file
  downloadCSV: (csvContent, filename = 'blood-requests.csv') => {
    const blob = new Blob([csvContent], { type: 'text/csv' });
    const url = window.URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = filename;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    window.URL.revokeObjectURL(url);
  }
};

export default hospitalApi;

