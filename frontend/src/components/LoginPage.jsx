import React, { useState } from 'react';
import DonorLogin from './DonorLogin';
import HospitalLogin from './HospitalLogin';
import '../login.css';

const LoginPage = ({ onNavigate }) => {
  const [activeTab, setActiveTab] = useState('donor');

  return (
    <div className="login-page-container">
      <div className="login-page-card">
        <div className="login-page-header">
          <h1 className="login-page-title">BloodLink</h1>
          <p className="login-page-subtitle">Connect Lives, Save Lives</p>
        </div>

        <div className="login-tabs">
          <button
            className={`tab-button ${activeTab === 'donor' ? 'active' : ''}`}
            onClick={() => setActiveTab('donor')}
          >
            <span className="tab-icon">🩸</span>
            Donor Login
          </button>
          <button
            className={`tab-button ${activeTab === 'hospital' ? 'active' : ''}`}
            onClick={() => setActiveTab('hospital')}
          >
            <span className="tab-icon">🏥</span>
            Hospital Login
          </button>
        </div>

        <div className="login-content">
          {activeTab === 'donor' ? <DonorLogin onNavigate={onNavigate} /> : <HospitalLogin onNavigate={onNavigate} />}
        </div>
      </div>
    </div>
  );
};

export default LoginPage;
