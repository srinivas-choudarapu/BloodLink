import React, { useState } from 'react';
import api from '../services/api';
import '../register.css';

const DonorRegister = ({ onNavigate }) => {
  const [formData, setFormData] = useState({
    name: '',
    age: '',
    gender: '',
    phone: '',
    email: '',
    password: '',
    confirmPassword: '',
    bloodGroup: '',
    location: {
      coordinates: [0, 0] // [longitude, latitude]
    }
  });
  
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const [locationPermission, setLocationPermission] = useState(false);

  const bloodGroups = ['A+', 'A-', 'B+', 'B-', 'AB+', 'AB-', 'O+', 'O-'];
  const genders = ['Male', 'Female', 'Other'];

  const handleChange = (e) => {
    const { name, value } = e.target;
    if (name === 'longitude' || name === 'latitude') {
      setFormData(prev => ({
        ...prev,
        location: {
          ...prev.location,
          coordinates: name === 'longitude' 
            ? [parseFloat(value) || 0, prev.location.coordinates[1]]
            : [prev.location.coordinates[0], parseFloat(value) || 0]
        }
      }));
    } else {
      setFormData(prev => ({
        ...prev,
        [name]: value
      }));
    }
    if (error) setError('');
  };

  const getCurrentLocation = () => {
    if (!navigator.geolocation) {
      setError('Geolocation is not supported by this browser.');
      return;
    }

    setIsLoading(true);
    navigator.geolocation.getCurrentPosition(
      (position) => {
        setFormData(prev => ({
          ...prev,
          location: {
            coordinates: [position.coords.longitude, position.coords.latitude]
          }
        }));
        setLocationPermission(true);
        setIsLoading(false);
        setSuccess('Location detected successfully!');
      },
      (error) => {
        setError('Unable to retrieve your location. Please enter coordinates manually.');
        setIsLoading(false);
      }
    );
  };

  const validateForm = () => {
    if (!formData.name.trim()) {
      setError('Name is required');
      return false;
    }
    if (!formData.phone.trim()) {
      setError('Phone number is required');
      return false;
    }
    if (!formData.email.trim()) {
      setError('Email is required');
      return false;
    }
    if (!isValidEmail(formData.email)) {
      setError('Please enter a valid email address');
      return false;
    }
    if (!formData.password) {
      setError('Password is required');
      return false;
    }
    if (formData.password.length < 6) {
      setError('Password must be at least 6 characters long');
      return false;
    }
    if (formData.password !== formData.confirmPassword) {
      setError('Passwords do not match');
      return false;
    }
    if (!formData.bloodGroup) {
      setError('Blood group is required');
      return false;
    }
    if (formData.location.coordinates[0] === 0 && formData.location.coordinates[1] === 0) {
      setError('Please provide your location coordinates');
      return false;
    }
    return true;
  };

  const isValidEmail = (email) => {
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    return emailRegex.test(email);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setIsLoading(true);
    setError('');
    setSuccess('');

    if (!validateForm()) {
      setIsLoading(false);
      return;
    }

    try {
      // Prepare data for API (exclude confirmPassword)
      const { confirmPassword, ...registrationData } = formData;
      
      // API call for donor registration
      const response = await api.post('/auth/register/donor', registrationData);
      
      setSuccess('Registration successful! You can now login with your credentials.');
      
      // Reset form
      setFormData({
        name: '',
        age: '',
        gender: '',
        phone: '',
        email: '',
        password: '',
        confirmPassword: '',
        bloodGroup: '',
        location: {
          coordinates: [0, 0]
        }
      });
      setLocationPermission(false);

    } catch (err) {
      // Handle different error types
      if (err.response) {
        const errorMessage = err.response.data?.error || 'Registration failed. Please try again.';
        setError(errorMessage);
      } else if (err.request) {
        setError('Network error. Please check your connection and try again.');
      } else {
        setError('Registration failed. Please try again.');
      }
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="register-container">
      <div className="register-card">
        <div className="register-header">
          <h1 className="register-title">Donor Registration</h1>
          <p className="register-subtitle">Join BloodLink and help save lives</p>
        </div>

        <form className="register-form" onSubmit={handleSubmit}>
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

          <div className="form-row">
            <div className="form-group">
              <label htmlFor="name" className="form-label">
                Full Name *
              </label>
              <input
                type="text"
                id="name"
                name="name"
                value={formData.name}
                onChange={handleChange}
                className="form-input"
                placeholder="Enter your full name"
                required
              />
            </div>

            <div className="form-group">
              <label htmlFor="age" className="form-label">
                Age
              </label>
              <input
                type="number"
                id="age"
                name="age"
                value={formData.age}
                onChange={handleChange}
                className="form-input"
                placeholder="Enter your age"
                min="18"
                max="65"
              />
            </div>
          </div>

          <div className="form-row">
            <div className="form-group">
              <label htmlFor="gender" className="form-label">
                Gender
              </label>
              <select
                id="gender"
                name="gender"
                value={formData.gender}
                onChange={handleChange}
                className="form-input"
              >
                <option value="">Select Gender</option>
                {genders.map(gender => (
                  <option key={gender} value={gender}>{gender}</option>
                ))}
              </select>
            </div>

            <div className="form-group">
              <label htmlFor="bloodGroup" className="form-label">
                Blood Group *
              </label>
              <select
                id="bloodGroup"
                name="bloodGroup"
                value={formData.bloodGroup}
                onChange={handleChange}
                className="form-input"
                required
              >
                <option value="">Select Blood Group</option>
                {bloodGroups.map(group => (
                  <option key={group} value={group}>{group}</option>
                ))}
              </select>
            </div>
          </div>

          <div className="form-row">
            <div className="form-group">
              <label htmlFor="phone" className="form-label">
                Phone Number *
              </label>
              <input
                type="tel"
                id="phone"
                name="phone"
                value={formData.phone}
                onChange={handleChange}
                className="form-input"
                placeholder="Enter your phone number"
                required
              />
            </div>

            <div className="form-group">
              <label htmlFor="email" className="form-label">
                Email Address *
              </label>
              <input
                type="email"
                id="email"
                name="email"
                value={formData.email}
                onChange={handleChange}
                className="form-input"
                placeholder="Enter your email"
                required
              />
            </div>
          </div>

          <div className="form-row">
            <div className="form-group">
              <label htmlFor="password" className="form-label">
                Password *
              </label>
              <input
                type="password"
                id="password"
                name="password"
                value={formData.password}
                onChange={handleChange}
                className="form-input"
                placeholder="Create a password"
                required
              />
            </div>

            <div className="form-group">
              <label htmlFor="confirmPassword" className="form-label">
                Confirm Password *
              </label>
              <input
                type="password"
                id="confirmPassword"
                name="confirmPassword"
                value={formData.confirmPassword}
                onChange={handleChange}
                className="form-input"
                placeholder="Confirm your password"
                required
              />
            </div>
          </div>



          <div className="form-group">
            <label className="form-label">
              Location *
            </label>
            <div className="location-section">
              <button
                type="button"
                onClick={getCurrentLocation}
                className="location-button"
                disabled={isLoading}
              >
                {isLoading ? 'Getting Location...' : 'Use Current Location'}
              </button>
              
              <div className="coordinates-input">
                <div className="coordinate-group">
                  <label htmlFor="longitude" className="coordinate-label">Longitude</label>
                  <input
                    type="number"
                    id="longitude"
                    name="longitude"
                    value={formData.location.coordinates[0]}
                    onChange={handleChange}
                    className="form-input coordinate-input"
                    placeholder="0.000000"
                    step="any"
                  />
                </div>
                <div className="coordinate-group">
                  <label htmlFor="latitude" className="coordinate-label">Latitude</label>
                  <input
                    type="number"
                    id="latitude"
                    name="latitude"
                    value={formData.location.coordinates[1]}
                    onChange={handleChange}
                    className="form-input coordinate-input"
                    placeholder="0.000000"
                    step="any"
                  />
                </div>
              </div>
            </div>
            {locationPermission && (
              <p className="location-success">✓ Location detected successfully</p>
            )}
          </div>

          <button
            type="submit"
            className="register-button"
            disabled={isLoading}
          >
            {isLoading ? 'Registering...' : 'Register as Donor'}
          </button>
        </form>

        <div className="register-footer">
          <p>
            Already have an account?{' '}
            <button 
              onClick={() => onNavigate('login')} 
              className="register-link-button"
            >
              Login here
            </button>
          </p>
        </div>
      </div>
    </div>
  );
};

export default DonorRegister;
