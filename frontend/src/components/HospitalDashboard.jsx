import React, { useState, useEffect } from 'react';
import hospitalApi from '../services/hospitalApi';
import Header from './Header';
import { getCookie } from '../services/api';


const HospitalDashboard = ({ onNavigate }) => {
  const [activeTab, setActiveTab] = useState('post-request');
  const [hospitalData, setHospitalData] = useState({
    name: 'City Hospital',
    email: 'contact@cityhospital.com',
    phone: '+1 (555) 123-4567',
    address: '123 Medical Street, Health City, HC 12345'
  });
  const [requests, setRequests] = useState([]);
  const [filteredRequests, setFilteredRequests] = useState([]);
  const [summary, setSummary] = useState({ Open: 0, Fulfilled: 0, Cancelled: 0 });
  const [selectedRequests, setSelectedRequests] = useState([]);
  const [filters, setFilters] = useState({
    Open: true,
    Fulfilled: true,
    Cancelled: true
  });
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');

  // Form states
  const [requestForm, setRequestForm] = useState({
    bloodGroup: '',
    units: 1
  });
  const [notifyForm, setNotifyForm] = useState({
    bloodType: ''
  });
  const [editForm, setEditForm] = useState({
    id: '',
    bloodGroup: '',
    units: 1,
    status: 'Open'
  });

  const bloodGroups = ['A+', 'A-', 'B+', 'B-', 'AB+', 'AB-', 'O+', 'O-'];

  useEffect(() => {
    // Check if user is authenticated (from localStorage or cookies)
    let userType = localStorage.getItem('userType');
    if (!userType) {
      userType = getCookie('userType');
    }
    
    if (userType !== 'hospital') {
      onNavigate('login');
      return;
    }

    // Get hospital data from localStorage or cookies
    let storedUserData = localStorage.getItem('userData');
    if (!storedUserData) {
      storedUserData = getCookie('userData');
    }
    
    if (storedUserData) {
      const parsedData = JSON.parse(storedUserData);
      setHospitalData(prevData => ({
        ...prevData,
        ...parsedData
      }));
    }

    // Load initial data
    loadRequests();
    loadSummary();
  }, [onNavigate]);

  useEffect(() => {
    // Filter requests based on selected filters
    const filtered = requests.filter(request => filters[request.status]);
    setFilteredRequests(filtered);
  }, [requests, filters]);

  const loadRequests = async () => {
    try {
      setIsLoading(true);
      const requests = await hospitalApi.getAllRequests();
      setRequests(requests);
    } catch (err) {
      console.error('Error loading requests:', err);
      setError('Failed to load requests');
      setRequests([]);
    } finally {
      setIsLoading(false);
    }
  };

  const loadSummary = async () => {
    try {
      const summary = await hospitalApi.getRequestSummary();
      setSummary(summary);
    } catch (err) {
      console.error('Failed to load summary:', err);
      setSummary({ Open: 0, Fulfilled: 0, Cancelled: 0 });
    }
  };

  const handleLogout = () => {
    localStorage.removeItem('token');
    localStorage.removeItem('userType');
    localStorage.removeItem('userData');
    onNavigate('login');
  };

  const handlePostRequest = async (e) => {
    e.preventDefault();
    
    // Validate request data
    const validation = hospitalApi.validateRequestData(requestForm);
    if (!validation.isValid) {
      setError(validation.errors.join(', '));
      return;
    }

    try {
      setIsLoading(true);
      setError('');
      setSuccess('');
      await hospitalApi.createRequest(requestForm);
      setSuccess('Blood request created successfully!');
      setRequestForm({ bloodGroup: '', units: 1 });
      loadRequests();
      loadSummary();
      // Clear success message after 3 seconds
      setTimeout(() => setSuccess(''), 3000);
    } catch (err) {
      console.error('Error creating request:', err);
      setError(err.response?.data?.error || 'Failed to create request');
      // Clear error message after 5 seconds
      setTimeout(() => setError(''), 5000);
    } finally {
      setIsLoading(false);
    }
  };

  const handleEditRequest = async (e) => {
    e.preventDefault();
    
    // Validate edit data
    const validation = hospitalApi.validateEditData(editForm);
    if (!validation.isValid) {
      setError(validation.errors.join(', '));
      return;
    }

    try {
      setIsLoading(true);
      setError('');
      setSuccess('');
      await hospitalApi.updateRequest(editForm.id, {
        bloodGroup: editForm.bloodGroup,
        units: editForm.units,
        status: editForm.status
      });
      setSuccess('Request updated successfully!');
      setEditForm({ id: '', bloodGroup: '', units: 1, status: 'Open' });
      loadRequests();
      loadSummary();
      // Clear success message after 3 seconds
      setTimeout(() => setSuccess(''), 3000);
    } catch (err) {
      console.error('Error updating request:', err);
      setError(err.response?.data?.error || 'Failed to update request');
      // Clear error message after 5 seconds
      setTimeout(() => setError(''), 5000);
    } finally {
      setIsLoading(false);
    }
  };

  const handleDeleteRequest = async (id) => {
    if (!window.confirm('Are you sure you want to delete this request?')) {
      return;
    }

    try {
      setIsLoading(true);
      setError('');
      setSuccess('');
      await hospitalApi.deleteRequest(id);
      setSuccess('Request deleted successfully!');
      loadRequests();
      loadSummary();
      // Clear success message after 3 seconds
      setTimeout(() => setSuccess(''), 3000);
    } catch (err) {
      console.error('Error deleting request:', err);
      setError(err.response?.data?.error || 'Failed to delete request');
      // Clear error message after 5 seconds
      setTimeout(() => setError(''), 5000);
    } finally {
      setIsLoading(false);
    }
  };

  const handleDeleteAllRequests = async () => {
    if (!window.confirm('Are you sure you want to delete ALL requests? This action cannot be undone.')) {
      return;
    }

    try {
      setIsLoading(true);
      setError('');
      setSuccess('');
      await hospitalApi.deleteAllRequests();
      setSuccess('All requests deleted successfully!');
      loadRequests();
      loadSummary();
      // Clear success message after 3 seconds
      setTimeout(() => setSuccess(''), 3000);
    } catch (err) {
      console.error('Error deleting all requests:', err);
      setError(err.response?.data?.error || 'Failed to delete requests');
      // Clear error message after 5 seconds
      setTimeout(() => setError(''), 5000);
    } finally {
      setIsLoading(false);
    }
  };

  const handleDeleteSelectedRequests = async () => {
    if (selectedRequests.length === 0) {
      setError('Please select requests to delete');
      return;
    }

    if (!window.confirm(`Are you sure you want to delete ${selectedRequests.length} selected requests?`)) {
      return;
    }

    try {
      setIsLoading(true);
      setError('');
      setSuccess('');
      await hospitalApi.deleteSelectedRequests(selectedRequests);
      setSuccess(`${selectedRequests.length} requests deleted successfully!`);
      setSelectedRequests([]);
      loadRequests();
      loadSummary();
      // Clear success message after 3 seconds
      setTimeout(() => setSuccess(''), 3000);
    } catch (err) {
      console.error('Error deleting selected requests:', err);
      setError(err.response?.data?.error || 'Failed to delete selected requests');
      // Clear error message after 5 seconds
      setTimeout(() => setError(''), 5000);
    } finally {
      setIsLoading(false);
    }
  };

  const handleSelectRequest = (id) => {
    setSelectedRequests(prev => 
      prev.includes(id) 
        ? prev.filter(requestId => requestId !== id)
        : [...prev, id]
    );
  };

  const handleSelectAllRequests = () => {
    if (selectedRequests.length === filteredRequests.length) {
      setSelectedRequests([]);
    } else {
      setSelectedRequests(filteredRequests.map(request => request._id));
    }
  };

  const openEditModal = (request) => {
    setEditForm({
      id: request._id,
      bloodGroup: request.bloodGroup,
      units: request.units,
      status: request.status
    });
  };

  const handleFilterChange = (status) => {
    setFilters(prev => ({
      ...prev,
      [status]: !prev[status]
    }));
  };

  const handleNotifyDonors = async (e) => {
    e.preventDefault();
    setIsLoading(true);
    setError('');
    setSuccess('');
    
    try {
      const { bloodType } = notifyForm;
      if (!bloodType) {
        setError('Please select a blood type');
        setIsLoading(false);
        return;
      }
      
      const response = await hospitalApi.notifyNearbyDonors(bloodType);
      setSuccess(response.message);
      setNotifyForm({ bloodType: '' });
    } catch (err) {
      setError(err.response?.data?.error || 'Failed to notify donors');
    } finally {
      setIsLoading(false);
    }
  };

  const handleTabChange = (tab) => {
    setActiveTab(tab);
    setError('');
    setSuccess('');
  };

  const renderContent = () => {
    switch (activeTab) {
      case 'notify-donors':
        return (
          <div style={{ display: 'flex', flexDirection: 'column', gap: '2rem' }}>
            <div style={{
              background: 'white',
              borderRadius: '15px',
              boxShadow: '0 20px 40px rgba(220, 38, 38, 0.15)',
              border: '1px solid #fecaca',
              padding: '2rem',
              overflow: 'hidden'
            }}>
              <h2 style={{ fontSize: '1.8rem', fontWeight: '600', color: '#333', marginBottom: '1.5rem', textAlign: 'center' }}>Notify Nearby Donors</h2>
              
              {error && (
                <div style={{
                  background: '#fee',
                  color: '#c33',
                  padding: '1rem',
                  borderRadius: '8px',
                  marginBottom: '1rem',
                  border: '1px solid #fcc'
                }}>
                  {error}
                </div>
              )}

              {success && (
                <div style={{
                  background: '#efe',
                  color: '#363',
                  padding: '1rem',
                  borderRadius: '8px',
                  marginBottom: '1rem',
                  border: '1px solid #cfc'
                }}>
                  {success}
                </div>
              )}

              <form onSubmit={handleNotifyDonors} style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>
                <div>
                  <label style={{ display: 'block', fontSize: '0.9rem', fontWeight: '500', color: '#333', marginBottom: '0.5rem' }}>Blood Type *</label>
                  <select
                    value={notifyForm.bloodType}
                    onChange={(e) => setNotifyForm(prev => ({ ...prev, bloodType: e.target.value }))}
                    style={{
                      width: '100%',
                      padding: '0.75rem',
                      border: '2px solid #e1e5e9',
                      borderRadius: '8px',
                      fontSize: '1rem',
                      transition: 'border-color 0.3s ease'
                    }}
                    onFocus={(e) => {
                      e.target.style.borderColor = '#dc2626';
                      e.target.style.boxShadow = '0 0 0 3px rgba(220, 38, 38, 0.1)';
                    }}
                    onBlur={(e) => {
                      e.target.style.borderColor = '#e1e5e9';
                      e.target.style.boxShadow = 'none';
                    }}
                    required
                  >
                    <option value="">Select Blood Type</option>
                    {bloodGroups.map(group => (
                      <option key={group} value={group}>{group}</option>
                    ))}
                  </select>
                </div>

                <button
                  type="submit"
                  disabled={isLoading}
                  style={{
                    background: '#dc2626',
                    color: 'white',
                    border: 'none',
                    padding: '1rem 2rem',
                    borderRadius: '8px',
                    fontSize: '1rem',
                    fontWeight: '600',
                    cursor: isLoading ? 'not-allowed' : 'pointer',
                    transition: 'all 0.3s ease',
                    textTransform: 'uppercase',
                    letterSpacing: '0.5px',
                    opacity: isLoading ? 0.7 : 1
                  }}
                  onMouseEnter={(e) => {
                    if (!isLoading) {
                      e.target.style.background = '#b91c1c';
                    }
                  }}
                  onMouseLeave={(e) => {
                    if (!isLoading) {
                      e.target.style.background = '#dc2626';
                    }
                  }}
                >
                  {isLoading ? 'Notifying...' : 'Notify Donors'}
                </button>
              </form>
            </div>
          </div>
        );
      
      case 'post-request':
        return (
          <div style={{ display: 'flex', flexDirection: 'column', gap: '2rem' }}>
            <div style={{
              background: 'white',
              borderRadius: '15px',
              boxShadow: '0 20px 40px rgba(220, 38, 38, 0.15)',
              border: '1px solid #fecaca',
              padding: '2rem',
              overflow: 'hidden'
            }}>
              <h2 style={{ fontSize: '1.8rem', fontWeight: '600', color: '#333', marginBottom: '1.5rem', textAlign: 'center' }}>Create Blood Request</h2>
              
              {error && (
                <div style={{
                  background: '#fee',
                  color: '#c33',
                  padding: '1rem',
                  borderRadius: '8px',
                  marginBottom: '1rem',
                  border: '1px solid #fcc'
                }}>
                  {error}
                </div>
              )}

              {success && (
                <div style={{
                  background: '#efe',
                  color: '#363',
                  padding: '1rem',
                  borderRadius: '8px',
                  marginBottom: '1rem',
                  border: '1px solid #cfc'
                }}>
                  {success}
                </div>
              )}

              <form onSubmit={handlePostRequest} style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>
                <div>
                  <label style={{ display: 'block', fontSize: '0.9rem', fontWeight: '500', color: '#333', marginBottom: '0.5rem' }}>Blood Group *</label>
                  <select
                    value={requestForm.bloodGroup}
                    onChange={(e) => setRequestForm(prev => ({ ...prev, bloodGroup: e.target.value }))}
                    style={{
                      width: '100%',
                      padding: '0.75rem',
                      border: '2px solid #e1e5e9',
                      borderRadius: '8px',
                      fontSize: '1rem',
                      transition: 'border-color 0.3s ease'
                    }}
                    onFocus={(e) => {
                      e.target.style.borderColor = '#dc2626';
                      e.target.style.boxShadow = '0 0 0 3px rgba(220, 38, 38, 0.1)';
                    }}
                    onBlur={(e) => {
                      e.target.style.borderColor = '#e1e5e9';
                      e.target.style.boxShadow = 'none';
                    }}
                    required
                  >
                    <option value="">Select Blood Group</option>
                    {bloodGroups.map(group => (
                      <option key={group} value={group}>{group}</option>
                    ))}
                  </select>
                </div>

                <div>
                  <label style={{ display: 'block', fontSize: '0.9rem', fontWeight: '500', color: '#333', marginBottom: '0.5rem' }}>Units Required</label>
                  <input
                    type="number"
                    min="1"
                    value={requestForm.units}
                    onChange={(e) => setRequestForm(prev => ({ ...prev, units: parseInt(e.target.value) || 1 }))}
                    style={{
                      width: '100%',
                      padding: '0.75rem',
                      border: '2px solid #e1e5e9',
                      borderRadius: '8px',
                      fontSize: '1rem',
                      transition: 'border-color 0.3s ease'
                    }}
                    onFocus={(e) => {
                      e.target.style.borderColor = '#dc2626';
                      e.target.style.boxShadow = '0 0 0 3px rgba(220, 38, 38, 0.1)';
                    }}
                    onBlur={(e) => {
                      e.target.style.borderColor = '#e1e5e9';
                      e.target.style.boxShadow = 'none';
                    }}
                  />
                </div>

                <button
                  type="submit"
                  disabled={isLoading}
                  style={{
                    background: '#dc2626',
                    color: 'white',
                    border: 'none',
                    padding: '1rem 2rem',
                    borderRadius: '8px',
                    fontSize: '1rem',
                    fontWeight: '600',
                    cursor: isLoading ? 'not-allowed' : 'pointer',
                    transition: 'all 0.3s ease',
                    textTransform: 'uppercase',
                    letterSpacing: '0.5px',
                    opacity: isLoading ? 0.7 : 1
                  }}
                  onMouseEnter={(e) => {
                    if (!isLoading) {
                      e.target.style.transform = 'translateY(-2px)';
                      e.target.style.boxShadow = '0 5px 15px rgba(220, 38, 38, 0.4)';
                      e.target.style.background = '#b91c1c';
                    }
                  }}
                  onMouseLeave={(e) => {
                    if (!isLoading) {
                      e.target.style.transform = 'translateY(0)';
                      e.target.style.boxShadow = 'none';
                      e.target.style.background = '#dc2626';
                    }
                  }}
                >
                  {isLoading ? 'Creating...' : 'Create Request'}
                </button>
              </form>
            </div>
          </div>
        );

      case 'all-requests':
        return (
          <div style={{ display: 'flex', flexDirection: 'column', gap: '2rem' }}>
            <div style={{
              background: 'white',
              borderRadius: '15px',
              boxShadow: '0 20px 40px rgba(220, 38, 38, 0.15)',
              border: '1px solid #fecaca',
              padding: '2rem',
              overflow: 'hidden'
            }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1.5rem' }}>
                <h2 style={{ fontSize: '1.8rem', fontWeight: '600', color: '#333' }}>All Requests</h2>
                <div style={{ display: 'flex', gap: '1rem' }}>
                  <button
                    onClick={handleSelectAllRequests}
                    style={{
                      background: '#6c757d',
                      color: 'white',
                      border: 'none',
                      padding: '0.5rem 1rem',
                      borderRadius: '8px',
                      fontSize: '0.9rem',
                      fontWeight: '500',
                      cursor: 'pointer',
                      transition: 'all 0.3s ease'
                    }}
                  >
                    {selectedRequests.length === filteredRequests.length ? 'Deselect All' : 'Select All'}
                  </button>
                  {selectedRequests.length > 0 && (
                    <button
                      onClick={handleDeleteSelectedRequests}
                      style={{
                        background: '#dc3545',
                        color: 'white',
                        border: 'none',
                        padding: '0.5rem 1rem',
                        borderRadius: '8px',
                        fontSize: '0.9rem',
                        fontWeight: '500',
                        cursor: 'pointer',
                        transition: 'all 0.3s ease'
                      }}
                    >
                      Delete Selected ({selectedRequests.length})
                    </button>
                  )}
                </div>
              </div>

              {error && (
                <div style={{
                  background: '#fee',
                  color: '#c33',
                  padding: '1rem',
                  borderRadius: '8px',
                  marginBottom: '1rem',
                  border: '1px solid #fcc'
                }}>
                  {error}
                </div>
              )}

              {success && (
                <div style={{
                  background: '#efe',
                  color: '#363',
                  padding: '1rem',
                  borderRadius: '8px',
                  marginBottom: '1rem',
                  border: '1px solid #cfc'
                }}>
                  {success}
                </div>
              )}

              {isLoading ? (
                <div style={{ textAlign: 'center', padding: '2rem' }}>
                  <p style={{ color: '#666' }}>Loading requests...</p>
                </div>
              ) : filteredRequests.length === 0 ? (
                <div style={{ textAlign: 'center', padding: '2rem' }}>
                  <p style={{ color: '#666' }}>No requests found</p>
                </div>
              ) : (
                <div style={{ overflowX: 'auto' }}>
                  <table style={{ width: '100%', borderCollapse: 'collapse' }}>
                    <thead>
                      <tr style={{ borderBottom: '2px solid #e1e5e9' }}>
                        <th style={{ textAlign: 'left', padding: '1rem 0.5rem', fontWeight: '600', color: '#333' }}>
                          <input
                            type="checkbox"
                            checked={selectedRequests.length === filteredRequests.length && filteredRequests.length > 0}
                            onChange={handleSelectAllRequests}
                            style={{ accentColor: '#dc2626' }}
                          />
                        </th>
                        <th style={{ textAlign: 'left', padding: '1rem 0.5rem', fontWeight: '600', color: '#333' }}>Blood Group</th>
                        <th style={{ textAlign: 'left', padding: '1rem 0.5rem', fontWeight: '600', color: '#333' }}>Units</th>
                        <th style={{ textAlign: 'left', padding: '1rem 0.5rem', fontWeight: '600', color: '#333' }}>Status</th>
                        <th style={{ textAlign: 'left', padding: '1rem 0.5rem', fontWeight: '600', color: '#333' }}>Created</th>
                        <th style={{ textAlign: 'left', padding: '1rem 0.5rem', fontWeight: '600', color: '#333' }}>Actions</th>
                      </tr>
                    </thead>
                    <tbody>
                      {filteredRequests.map((request) => (
                        <tr key={request._id} style={{ borderBottom: '1px solid #e1e5e9' }}>
                          <td style={{ padding: '1rem 0.5rem' }}>
                            <input
                              type="checkbox"
                              checked={selectedRequests.includes(request._id)}
                              onChange={() => handleSelectRequest(request._id)}
                              style={{ accentColor: '#dc2626' }}
                            />
                          </td>
                          <td style={{ padding: '1rem 0.5rem', fontWeight: '500' }}>{request.bloodGroup}</td>
                          <td style={{ padding: '1rem 0.5rem' }}>{request.units}</td>
                          <td style={{ padding: '1rem 0.5rem' }}>
                            <span style={{
                              padding: '0.25rem 0.75rem',
                              borderRadius: '12px',
                              fontSize: '0.8rem',
                              fontWeight: '500',
                              background: request.status === 'Open' ? '#d1ecf1' : request.status === 'Fulfilled' ? '#d4edda' : '#f8d7da',
                              color: request.status === 'Open' ? '#0c5460' : request.status === 'Fulfilled' ? '#155724' : '#721c24'
                            }}>
                              {request.status}
                            </span>
                          </td>
                          <td style={{ padding: '1rem 0.5rem', color: '#666' }}>
                            {new Date(request.createdAt).toLocaleDateString()}
                          </td>
                          <td style={{ padding: '1rem 0.5rem' }}>
                            <div style={{ display: 'flex', gap: '0.5rem' }}>
                              <button
                                onClick={() => openEditModal(request)}
                                style={{
                                  background: '#007bff',
                                  color: 'white',
                                  border: 'none',
                                  padding: '0.25rem 0.75rem',
                                  borderRadius: '4px',
                                  fontSize: '0.8rem',
                                  cursor: 'pointer',
                                  transition: 'all 0.3s ease'
                                }}
                                onMouseEnter={(e) => e.target.style.background = '#0056b3'}
                                onMouseLeave={(e) => e.target.style.background = '#007bff'}
                              >
                                Edit
                              </button>
                              <button
                                onClick={() => handleDeleteRequest(request._id)}
                                style={{
                                  background: '#dc3545',
                                  color: 'white',
                                  border: 'none',
                                  padding: '0.25rem 0.75rem',
                                  borderRadius: '4px',
                                  fontSize: '0.8rem',
                                  cursor: 'pointer',
                                  transition: 'all 0.3s ease'
                                }}
                                onMouseEnter={(e) => e.target.style.background = '#c82333'}
                                onMouseLeave={(e) => e.target.style.background = '#dc3545'}
                              >
                                Delete
                              </button>
                            </div>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              )}
            </div>

            {/* Edit Modal */}
            {editForm.id && (
              <div style={{
                position: 'fixed',
                top: 0,
                left: 0,
                right: 0,
                bottom: 0,
                background: 'rgba(0, 0, 0, 0.5)',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                zIndex: 1000
              }}>
                <div style={{
                  background: 'white',
                  borderRadius: '15px',
                  padding: '2rem',
                  maxWidth: '500px',
                  width: '90%',
                  maxHeight: '90vh',
                  overflow: 'auto'
                }}>
                  <h3 style={{ fontSize: '1.5rem', fontWeight: '600', color: '#333', marginBottom: '1.5rem', textAlign: 'center' }}>Edit Request</h3>
                  
                  <form onSubmit={handleEditRequest} style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>
                    <div>
                      <label style={{ display: 'block', fontSize: '0.9rem', fontWeight: '500', color: '#333', marginBottom: '0.5rem' }}>Blood Group *</label>
                      <select
                        value={editForm.bloodGroup}
                        onChange={(e) => setEditForm(prev => ({ ...prev, bloodGroup: e.target.value }))}
                        style={{
                          width: '100%',
                          padding: '0.75rem',
                          border: '2px solid #e1e5e9',
                          borderRadius: '8px',
                          fontSize: '1rem',
                          transition: 'border-color 0.3s ease'
                        }}
                        required
                      >
                        {bloodGroups.map(group => (
                          <option key={group} value={group}>{group}</option>
                        ))}
                      </select>
                    </div>

                    <div>
                      <label style={{ display: 'block', fontSize: '0.9rem', fontWeight: '500', color: '#333', marginBottom: '0.5rem' }}>Units</label>
                      <input
                        type="number"
                        min="1"
                        value={editForm.units}
                        onChange={(e) => setEditForm(prev => ({ ...prev, units: parseInt(e.target.value) || 1 }))}
                        style={{
                          width: '100%',
                          padding: '0.75rem',
                          border: '2px solid #e1e5e9',
                          borderRadius: '8px',
                          fontSize: '1rem',
                          transition: 'border-color 0.3s ease'
                        }}
                      />
                    </div>

                    <div>
                      <label style={{ display: 'block', fontSize: '0.9rem', fontWeight: '500', color: '#333', marginBottom: '0.5rem' }}>Status</label>
                      <select
                        value={editForm.status}
                        onChange={(e) => setEditForm(prev => ({ ...prev, status: e.target.value }))}
                        style={{
                          width: '100%',
                          padding: '0.75rem',
                          border: '2px solid #e1e5e9',
                          borderRadius: '8px',
                          fontSize: '1rem',
                          transition: 'border-color 0.3s ease'
                        }}
                      >
                        <option value="Open">Open</option>
                        <option value="Fulfilled">Fulfilled</option>
                        <option value="Cancelled">Cancelled</option>
                      </select>
                    </div>

                    <div style={{ display: 'flex', gap: '1rem' }}>
                      <button
                        type="submit"
                        disabled={isLoading}
                        style={{
                          flex: 1,
                          background: '#dc2626',
                          color: 'white',
                          border: 'none',
                          padding: '0.75rem 1.5rem',
                          borderRadius: '8px',
                          fontSize: '1rem',
                          fontWeight: '600',
                          cursor: isLoading ? 'not-allowed' : 'pointer',
                          transition: 'all 0.3s ease',
                          opacity: isLoading ? 0.7 : 1
                        }}
                      >
                        {isLoading ? 'Updating...' : 'Update Request'}
                      </button>
                      <button
                        type="button"
                        onClick={() => setEditForm({ id: '', bloodGroup: '', units: 1, status: 'Open' })}
                        style={{
                          flex: 1,
                          background: '#6c757d',
                          color: 'white',
                          border: 'none',
                          padding: '0.75rem 1.5rem',
                          borderRadius: '8px',
                          fontSize: '1rem',
                          fontWeight: '600',
                          cursor: 'pointer',
                          transition: 'all 0.3s ease'
                        }}
                      >
                        Cancel
                      </button>
                    </div>
                  </form>
                </div>
              </div>
            )}
          </div>
        );

      case 'delete-requests':
        return (
          <div style={{ display: 'flex', flexDirection: 'column', gap: '2rem' }}>
            <div style={{
              background: 'white',
              borderRadius: '15px',
              boxShadow: '0 20px 40px rgba(220, 38, 38, 0.15)',
              border: '1px solid #fecaca',
              padding: '2rem',
              overflow: 'hidden'
            }}>
              <h2 style={{ fontSize: '1.8rem', fontWeight: '600', color: '#333', marginBottom: '1.5rem', textAlign: 'center' }}>Delete Requests</h2>
              
              {error && (
                <div style={{
                  background: '#fee',
                  color: '#c33',
                  padding: '1rem',
                  borderRadius: '8px',
                  marginBottom: '1rem',
                  border: '1px solid #fcc'
                }}>
                  {error}
                </div>
              )}

              {success && (
                <div style={{
                  background: '#efe',
                  color: '#363',
                  padding: '1rem',
                  borderRadius: '8px',
                  marginBottom: '1rem',
                  border: '1px solid #cfc'
                }}>
                  {success}
                </div>
              )}

              <div style={{ display: 'flex', flexDirection: 'column', gap: '2rem' }}>
                <div style={{
                  background: '#fff5f5',
                  border: '2px solid #fed7d7',
                  borderRadius: '8px',
                  padding: '1.5rem',
                  textAlign: 'center'
                }}>
                  <h3 style={{ fontSize: '1.2rem', fontWeight: '600', color: '#c53030', marginBottom: '1rem' }}>⚠️ Delete All Requests</h3>
                  <p style={{ color: '#666', marginBottom: '1rem' }}>This will permanently delete ALL your blood requests. This action cannot be undone.</p>
                  <button
                    onClick={handleDeleteAllRequests}
                    disabled={isLoading}
                    style={{
                      background: '#dc3545',
                      color: 'white',
                      border: 'none',
                      padding: '1rem 2rem',
                      borderRadius: '8px',
                      fontSize: '1rem',
                      fontWeight: '600',
                      cursor: isLoading ? 'not-allowed' : 'pointer',
                      transition: 'all 0.3s ease',
                      opacity: isLoading ? 0.7 : 1
                    }}
                    onMouseEnter={(e) => {
                      if (!isLoading) {
                        e.target.style.background = '#c82333';
                        e.target.style.transform = 'translateY(-2px)';
                        e.target.style.boxShadow = '0 5px 15px rgba(220, 53, 69, 0.4)';
                      }
                    }}
                    onMouseLeave={(e) => {
                      if (!isLoading) {
                        e.target.style.background = '#dc3545';
                        e.target.style.transform = 'translateY(0)';
                        e.target.style.boxShadow = 'none';
                      }
                    }}
                  >
                    {isLoading ? 'Deleting...' : 'Delete All Requests'}
                  </button>
                </div>

                <div style={{
                  background: '#f8f9fa',
                  border: '1px solid #e1e5e9',
                  borderRadius: '8px',
                  padding: '1.5rem'
                }}>
                  <h3 style={{ fontSize: '1.2rem', fontWeight: '600', color: '#333', marginBottom: '1rem' }}>Request Statistics</h3>
                  <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(150px, 1fr))', gap: '1rem' }}>
                    <div style={{ textAlign: 'center' }}>
                      <p style={{ fontSize: '2rem', fontWeight: '700', color: '#dc2626', margin: 0 }}>{requests.length}</p>
                      <p style={{ color: '#666', margin: 0 }}>Total Requests</p>
                    </div>
                    <div style={{ textAlign: 'center' }}>
                      <p style={{ fontSize: '2rem', fontWeight: '700', color: '#007bff', margin: 0 }}>{summary.Open}</p>
                      <p style={{ color: '#666', margin: 0 }}>Open</p>
                    </div>
                    <div style={{ textAlign: 'center' }}>
                      <p style={{ fontSize: '2rem', fontWeight: '700', color: '#28a745', margin: 0 }}>{summary.Fulfilled}</p>
                      <p style={{ color: '#666', margin: 0 }}>Fulfilled</p>
                    </div>
                    <div style={{ textAlign: 'center' }}>
                      <p style={{ fontSize: '2rem', fontWeight: '700', color: '#dc3545', margin: 0 }}>{summary.Cancelled}</p>
                      <p style={{ color: '#666', margin: 0 }}>Cancelled</p>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        );

      case 'filter':
        return (
          <div style={{ display: 'flex', flexDirection: 'column', gap: '2rem' }}>
            <div style={{
              background: 'white',
              borderRadius: '15px',
              boxShadow: '0 20px 40px rgba(220, 38, 38, 0.15)',
              border: '1px solid #fecaca',
              padding: '2rem',
              overflow: 'hidden'
            }}>
              <h2 style={{ fontSize: '1.8rem', fontWeight: '600', color: '#333', marginBottom: '1.5rem', textAlign: 'center' }}>Filter Requests</h2>
              
              <div style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>
                <div>
                  <h3 style={{ fontSize: '1.2rem', fontWeight: '600', color: '#333', marginBottom: '1rem' }}>Filter by Status</h3>
                  <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
                    {Object.entries(filters).map(([status, isChecked]) => (
                      <label key={status} style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', cursor: 'pointer', padding: '0.75rem', background: '#f8f9fa', borderRadius: '8px', border: '1px solid #e1e5e9' }}>
                        <input
                          type="checkbox"
                          checked={isChecked}
                          onChange={() => handleFilterChange(status)}
                          style={{ accentColor: '#dc2626', transform: 'scale(1.2)' }}
                        />
                        <span style={{ fontSize: '1rem', fontWeight: '500', color: '#333' }}>{status}</span>
                        <span style={{
                          marginLeft: 'auto',
                          padding: '0.25rem 0.75rem',
                          borderRadius: '12px',
                          fontSize: '0.8rem',
                          fontWeight: '600',
                          background: status === 'Open' ? '#d1ecf1' : status === 'Fulfilled' ? '#d4edda' : '#f8d7da',
                          color: status === 'Open' ? '#0c5460' : status === 'Fulfilled' ? '#155724' : '#721c24'
                        }}>
                          {summary[status]} requests
                        </span>
                      </label>
                    ))}
                  </div>
                </div>

                <div style={{
                  background: '#f8f9fa',
                  border: '1px solid #e1e5e9',
                  borderRadius: '8px',
                  padding: '1.5rem'
                }}>
                  <h3 style={{ fontSize: '1.2rem', fontWeight: '600', color: '#333', marginBottom: '1rem' }}>Filtered Results</h3>
                  <p style={{ fontSize: '1.5rem', fontWeight: '700', color: '#dc2626', margin: 0 }}>
                    {filteredRequests.length} request{filteredRequests.length !== 1 ? 's' : ''} match your filters
                  </p>
                </div>

                <div style={{ display: 'flex', gap: '1rem' }}>
                  <button
                    onClick={() => setFilters({ Open: true, Fulfilled: true, Cancelled: true })}
                    style={{
                      background: '#28a745',
                      color: 'white',
                      border: 'none',
                      padding: '0.75rem 1.5rem',
                      borderRadius: '8px',
                      fontSize: '1rem',
                      fontWeight: '600',
                      cursor: 'pointer',
                      transition: 'all 0.3s ease'
                    }}
                    onMouseEnter={(e) => {
                      e.target.style.background = '#218838';
                      e.target.style.transform = 'translateY(-2px)';
                    }}
                    onMouseLeave={(e) => {
                      e.target.style.background = '#28a745';
                      e.target.style.transform = 'translateY(0)';
                    }}
                  >
                    Select All
                  </button>
                  <button
                    onClick={() => setFilters({ Open: false, Fulfilled: false, Cancelled: false })}
                    style={{
                      background: '#6c757d',
                      color: 'white',
                      border: 'none',
                      padding: '0.75rem 1.5rem',
                      borderRadius: '8px',
                      fontSize: '1rem',
                      fontWeight: '600',
                      cursor: 'pointer',
                      transition: 'all 0.3s ease'
                    }}
                    onMouseEnter={(e) => {
                      e.target.style.background = '#5a6268';
                      e.target.style.transform = 'translateY(-2px)';
                    }}
                    onMouseLeave={(e) => {
                      e.target.style.background = '#6c757d';
                      e.target.style.transform = 'translateY(0)';
                    }}
                  >
                    Clear All
                  </button>
                </div>
              </div>
            </div>
          </div>
        );

      default:
        return null;
    }
  };

  return (
    <div style={{ background: 'linear-gradient(135deg, #fecaca 0%, #fca5a5 100%)', fontFamily: "'Segoe UI', Tahoma, Geneva, Verdana, sans-serif", minHeight: '100vh', display: 'flex', flexDirection: 'column' }}>
      {/* Header */}
      <Header 
        onNavigate={onNavigate} 
        showHomeButton={true} 
        userType="hospital" 
        userName={hospitalData.name} 
      />
      
      <div style={{ display: 'flex', flex: 1 }}>
        {/* Left Sidebar */}
        <div style={{
          width: '280px',
          background: 'white',
          boxShadow: '0 20px 40px rgba(220, 38, 38, 0.15)',
          borderRight: '3px solid #dc2626',
          display: 'flex',
          flexDirection: 'column'
        }}>
        {/* Hospital Info */}
        <div style={{
          padding: '1.5rem',
          borderBottom: '1px solid #e1e5e9',
          background: '#f8f9fa'
        }}>
          <h3 style={{ fontSize: '1rem', fontWeight: '600', color: '#333', marginBottom: '0.5rem' }}>{hospitalData.name}</h3>
          <p style={{ fontSize: '0.8rem', color: '#666', margin: 0 }}>{hospitalData.email}</p>
          <p style={{ fontSize: '0.8rem', color: '#666', margin: 0 }}>{hospitalData.phone}</p>
        </div>

        {/* Navigation */}
        <div style={{ flex: 1, padding: '1rem 0' }}>
          <nav style={{ display: 'flex', flexDirection: 'column' }}>
            <button
              onClick={() => handleTabChange('post-request')}
              style={{
                display: 'flex',
                alignItems: 'center',
                gap: '0.75rem',
                padding: '1rem 1.5rem',
                border: 'none',
                background: activeTab === 'post-request' ? '#dc2626' : 'transparent',
                color: activeTab === 'post-request' ? 'white' : '#333',
                cursor: 'pointer',
                transition: 'all 0.3s ease',
                fontSize: '0.9rem',
                fontWeight: '500',
                textAlign: 'left'
              }}
              onMouseEnter={(e) => {
                if (activeTab !== 'post-request') {
                  e.target.style.background = '#e9ecef';
                  e.target.style.color = '#495057';
                }
              }}
              onMouseLeave={(e) => {
                if (activeTab !== 'post-request') {
                  e.target.style.background = 'transparent';
                  e.target.style.color = '#333';
                }
              }}
            >
              <span style={{ fontSize: '1.2rem' }}>📝</span>
              Post Request
            </button>

            <button
              onClick={() => handleTabChange('all-requests')}
              style={{
                display: 'flex',
                alignItems: 'center',
                gap: '0.75rem',
                padding: '1rem 1.5rem',
                border: 'none',
                background: activeTab === 'all-requests' ? '#dc2626' : 'transparent',
                color: activeTab === 'all-requests' ? 'white' : '#333',
                cursor: 'pointer',
                transition: 'all 0.3s ease',
                fontSize: '0.9rem',
                fontWeight: '500',
                textAlign: 'left'
              }}
              onMouseEnter={(e) => {
                if (activeTab !== 'all-requests') {
                  e.target.style.background = '#e9ecef';
                  e.target.style.color = '#495057';
                }
              }}
              onMouseLeave={(e) => {
                if (activeTab !== 'all-requests') {
                  e.target.style.background = 'transparent';
                  e.target.style.color = '#333';
                }
              }}
            >
              <span style={{ fontSize: '1.2rem' }}>📋</span>
              All Requests
            </button>

            <button
              onClick={() => handleTabChange('delete-requests')}
              style={{
                display: 'flex',
                alignItems: 'center',
                gap: '0.75rem',
                padding: '1rem 1.5rem',
                border: 'none',
                background: activeTab === 'delete-requests' ? '#dc2626' : 'transparent',
                color: activeTab === 'delete-requests' ? 'white' : '#333',
                cursor: 'pointer',
                transition: 'all 0.3s ease',
                fontSize: '0.9rem',
                fontWeight: '500',
                textAlign: 'left'
              }}
              onMouseEnter={(e) => {
                if (activeTab !== 'delete-requests') {
                  e.target.style.background = '#e9ecef';
                  e.target.style.color = '#495057';
                }
              }}
              onMouseLeave={(e) => {
                if (activeTab !== 'delete-requests') {
                  e.target.style.background = 'transparent';
                  e.target.style.color = '#333';
                }
              }}
            >
              <span style={{ fontSize: '1.2rem' }}>🗑️</span>
              Delete Requests
            </button>

            <button
              onClick={() => handleTabChange('notify-donors')}
              style={{
                display: 'flex',
                alignItems: 'center',
                gap: '0.75rem',
                padding: '1rem 1.5rem',
                border: 'none',
                background: activeTab === 'notify-donors' ? '#dc2626' : 'transparent',
                color: activeTab === 'notify-donors' ? 'white' : '#333',
                cursor: 'pointer',
                transition: 'all 0.3s ease',
                fontSize: '0.9rem',
                fontWeight: '500',
                textAlign: 'left'
              }}
              onMouseEnter={(e) => {
                if (activeTab !== 'notify-donors') {
                  e.target.style.background = '#e9ecef';
                  e.target.style.color = '#495057';
                }
              }}
              onMouseLeave={(e) => {
                if (activeTab !== 'notify-donors') {
                  e.target.style.background = 'transparent';
                  e.target.style.color = '#333';
                }
              }}
            >
              <span style={{ fontSize: '1.2rem' }}>🔔</span>
              Notify Donors
            </button>

            <button
              onClick={() => handleTabChange('filter')}
              style={{
                display: 'flex',
                alignItems: 'center',
                gap: '0.75rem',
                padding: '1rem 1.5rem',
                border: 'none',
                background: activeTab === 'filter' ? '#dc2626' : 'transparent',
                color: activeTab === 'filter' ? 'white' : '#333',
                cursor: 'pointer',
                transition: 'all 0.3s ease',
                fontSize: '0.9rem',
                fontWeight: '500',
                textAlign: 'left'
              }}
              onMouseEnter={(e) => {
                if (activeTab !== 'filter') {
                  e.target.style.background = '#e9ecef';
                  e.target.style.color = '#495057';
                }
              }}
              onMouseLeave={(e) => {
                if (activeTab !== 'filter') {
                  e.target.style.background = 'transparent';
                  e.target.style.color = '#333';
                }
              }}
            >
              <span style={{ fontSize: '1.2rem' }}>🔍</span>
              Filter
            </button>
          </nav>
        </div>

      </div>

        {/* Main Content */}
        <div style={{ flex: 1, padding: '2rem', overflow: 'auto' }}>
          {renderContent()}
        </div>
      </div>
    </div>
  );
};

export default HospitalDashboard;
