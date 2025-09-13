import React, { useState } from 'react';
import api from '../services/api';

const DonorLogin = ({ onNavigate }) => {
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

      // Determine if loginField is email or phone
      const isEmail = formData.loginField.includes('@');
      const isPhone = /^\d+$/.test(formData.loginField);
      
      if (!isEmail && !isPhone) {
        setError('Please enter a valid email address or phone number');
        setIsLoading(false);
        return;
      }

      let requestData = { password: formData.password };
      
      if (isEmail) {
        requestData.email = formData.loginField;
      } else {
        requestData.phone = formData.loginField;
      }

      // API call for donor login
      const response = await api.post('/auth/login/donor', requestData);

      // Store user data (token is handled by cookies from backend)
      localStorage.setItem('userType', 'donor');
      localStorage.setItem('userData', JSON.stringify(response.data.donor));
      
      setSuccess('Donor login successful!');
      
      // Reset form
      setFormData({
        loginField: '',
        password: ''
      });

      // Redirect to donor dashboard after successful login
      setTimeout(() => {
        window.location.href = '/donor-dashboard';
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
        <h2 className="login-form-title">Donor Portal</h2>
        <p className="login-form-subtitle">Access your donor account</p>
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
          <label htmlFor="donor-login" className="form-label">
            Email or Phone Number
          </label>
          <input
            type="text"
            id="donor-login"
            name="loginField"
            value={formData.loginField}
            onChange={handleChange}
            className="form-input"
            placeholder="Enter email or phone number"
            required
          />
        </div>

        <div className="form-group">
          <label htmlFor="donor-password" className="form-label">
            Password
          </label>
          <input
            type="password"
            id="donor-password"
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
          className="login-button donor-button"
          disabled={isLoading}
        >
          {isLoading ? 'Signing In...' : 'Sign In as Donor'}
        </button>
      </form>

      <div className="login-footer">
        <p>
          New donor?{' '}
          <button 
            onClick={() => onNavigate('donor-register')} 
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

export default DonorLogin;
