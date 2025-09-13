import React, { useState } from 'react';
import api from '../services/api';

const HospitalLogin = ({ onNavigate }) => {
  const [formData, setFormData] = useState({
    loginField: '',
    password: ''
  });
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
    if (error) setError('');
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setIsLoading(true);
    setError('');
    setSuccess('');

    try {
      // Basic validation
      if (!formData.loginField || !formData.password) {
        setError('Please fill in all fields');
        setIsLoading(false);
        return;
      }

      // Determine if loginField is email, phone, or licenseId
      const isEmail = formData.loginField.includes('@');
      const isPhone = /^\d+$/.test(formData.loginField);
      
      let requestData = { password: formData.password };
      
      if (isEmail) {
        requestData.email = formData.loginField;
      } else if (isPhone) {
        requestData.phone = formData.loginField;
      } else {
        requestData.licenseId = formData.loginField;
      }

      // API call for hospital login
      const response = await api.post('/auth/login/hospital', requestData);

      // Store user data (token is handled by cookies from backend)
      localStorage.setItem('userType', 'hospital');
      localStorage.setItem('userData', JSON.stringify(response.data.hospital));
      
      setSuccess('Hospital login successful!');
      
      // Reset form
      setFormData({
        loginField: '',
        password: ''
      });

      // Redirect to hospital dashboard after successful login
      setTimeout(() => {
        window.location.href = '/hospital-dashboard';
      }, 1500);

    } catch (err) {
      // Handle different error types
      if (err.response) {
        // Server responded with error status
        const errorMessage = err.response.data?.message || 'Login failed. Please check your credentials.';
        setError(errorMessage);
      } else if (err.request) {
        // Network error
        setError('Network error. Please check your connection and try again.');
      } else {
        // Other error
        setError('Login failed. Please try again.');
      }
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="login-form-container">
      <div className="login-form-header">
        <h2 className="login-form-title">Hospital Portal</h2>
        <p className="login-form-subtitle">Access your hospital account</p>
      </div>

      <form className="login-form" onSubmit={handleSubmit}>
        {error && (
          <div className="error-message">
            {error}
          </div>
        )}

        {success && (
          <div className="success-message">
            {success}
          </div>
        )}

        <div className="form-group">
          <label htmlFor="hospital-login" className="form-label">
            Email, Phone, or License ID
          </label>
          <input
            type="text"
            id="hospital-login"
            name="loginField"
            value={formData.loginField}
            onChange={handleChange}
            className="form-input"
            placeholder="Enter email, phone, or license ID"
            required
          />
        </div>

        <div className="form-group">
          <label htmlFor="hospital-password" className="form-label">
            Password
          </label>
          <input
            type="password"
            id="hospital-password"
            name="password"
            value={formData.password}
            onChange={handleChange}
            className="form-input"
            placeholder="Enter your password"
            required
          />
        </div>

        <button
          type="submit"
          className="login-button hospital-button"
          disabled={isLoading}
        >
          {isLoading ? 'Signing In...' : 'Sign In as Hospital'}
        </button>
      </form>

      <div className="login-footer">
        <p>
          New hospital?{' '}
          <button 
            onClick={() => onNavigate('hospital-register')} 
            className="login-link-button"
          >
            Register here
          </button>
        </p>
        <p>
          <a href="/forgot-password" className="login-link">
            Forgot your password?
          </a>
        </p>
      </div>
    </div>
  );
};

export default HospitalLogin;
