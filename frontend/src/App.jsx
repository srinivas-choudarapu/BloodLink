import React, { useState } from 'react'
import LoginPage from './components/LoginPage'
import DonorRegister from './components/DonorRegister'
import HospitalRegister from './components/HospitalRegister'
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
      default:
        return <LoginPage onNavigate={setCurrentPage} />;
    }
  };

  return (
    <div className="App">
      {renderPage()}
    </div>
  )
}

export default App
