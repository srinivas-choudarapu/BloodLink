import React, { useState } from 'react'
import LoginPage from './components/LoginPage'
import DonorRegister from './components/DonorRegister'
import HospitalRegister from './components/HospitalRegister'
import DonorHomepage from './components/DonorHomepage'
import HospitalDashboard from './components/HospitalDashboard'
import Footer from './components/Footer'
import './App.css'

function App() {
  const [currentPage, setCurrentPage] = useState('login');

  const renderPage = () => {
    switch (currentPage) {
      case 'login':
        return <LoginPage onNavigate={setCurrentPage} />;
      case 'donor-register':
        return <DonorRegister onNavigate={setCurrentPage} />;
      case 'hospital-register':
        return <HospitalRegister onNavigate={setCurrentPage} />;
      case 'donor-homepage':
        return <DonorHomepage onNavigate={setCurrentPage} />;
      case 'hospital-dashboard':
        return <HospitalDashboard onNavigate={setCurrentPage} />;
      default:
        return <LoginPage onNavigate={setCurrentPage} />;
    }
  };

  return (
    <div className="App" style={{ display: 'flex', flexDirection: 'column', minHeight: '100vh' }}>
      <div style={{ flex: 1 }}>
        {renderPage()}
      </div>
      <Footer />
    </div>
  )
}

export default App
