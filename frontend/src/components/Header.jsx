import React from 'react';

const Header = ({ onNavigate, showHomeButton = true, userType = null, userName = null }) => {
  const handleHomeClick = () => {
    if (userType === 'hospital') {
      onNavigate('hospital-dashboard');
    } else if (userType === 'donor') {
      onNavigate('donor-homepage');
    } else {
      onNavigate('login');
    }
  };

  const handleLogout = async () => {
    try {
      // Clear local storage data
      localStorage.removeItem('userType');
      localStorage.removeItem('userData');
      
      // Clear frontend-set cookies (non-httpOnly)
      document.cookie = 'userType=; expires=Thu, 01 Jan 1970 00:00:00 UTC; path=/;';
      document.cookie = 'userData=; expires=Thu, 01 Jan 1970 00:00:00 UTC; path=/;';
      
      // Call the backend logout endpoint to clear httpOnly cookies
      await api.post('/auth/logout');
      
      onNavigate('login');
    } catch (error) {
      console.error('Logout error:', error);
      onNavigate('login'); // Navigate to login even if there's an error
    }
  };

  return (
    <header style={{
      background: 'white',
      boxShadow: '0 4px 20px rgba(220, 38, 38, 0.15)',
      borderBottom: '3px solid #dc2626',
      position: 'sticky',
      top: 0,
      zIndex: 1000
    }}>
      <div style={{
        maxWidth: '1200px',
        margin: '0 auto',
        padding: '0 1rem',
        display: 'flex',
        justifyContent: 'space-between',
        alignItems: 'center',
        height: '70px'
      }}>
        {/* Logo and Brand */}
        <div 
          style={{ 
            display: 'flex', 
            alignItems: 'center', 
            gap: '0.75rem',
            cursor: 'pointer'
          }}
          onClick={handleHomeClick}
        >
          {/* Logo */}
          <div style={{
            width: '45px',
            height: '45px',
            background: 'linear-gradient(135deg, #dc2626 0%, #b91c1c 100%)',
            borderRadius: '50%',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            boxShadow: '0 4px 15px rgba(220, 38, 38, 0.3)'
          }}>
            <span style={{
              fontSize: '1.5rem',
              color: 'white',
              fontWeight: 'bold'
            }}>
              🩸
            </span>
          </div>
          
          {/* Brand Name and Tagline */}
          <div>
            <h1 style={{
              fontSize: '1.8rem',
              fontWeight: '700',
              color: '#dc2626',
              margin: 0,
              lineHeight: 1.2
            }}>
              BloodLink
            </h1>
            <p style={{
              fontSize: '0.75rem',
              color: '#666',
              margin: 0,
              fontWeight: '500',
              letterSpacing: '0.5px'
            }}>
              Connecting Lives, Saving Lives
            </p>
          </div>
        </div>

        {/* Navigation and User Info */}
        <div style={{ display: 'flex', alignItems: 'center', gap: '1.5rem' }}>
          {/* Home Button */}
          {showHomeButton && (
            <button
              onClick={handleHomeClick}
              style={{
                background: '#f8f9fa',
                color: '#dc2626',
                border: '2px solid #dc2626',
                padding: '0.5rem 1rem',
                borderRadius: '25px',
                fontSize: '0.9rem',
                fontWeight: '600',
                cursor: 'pointer',
                transition: 'all 0.3s ease',
                display: 'flex',
                alignItems: 'center',
                gap: '0.5rem'
              }}
              onMouseEnter={(e) => {
                e.target.style.background = '#dc2626';
                e.target.style.color = 'white';
                e.target.style.transform = 'translateY(-2px)';
                e.target.style.boxShadow = '0 4px 15px rgba(220, 38, 38, 0.3)';
              }}
              onMouseLeave={(e) => {
                e.target.style.background = '#f8f9fa';
                e.target.style.color = '#dc2626';
                e.target.style.transform = 'translateY(0)';
                e.target.style.boxShadow = 'none';
              }}
            >
              <span style={{ fontSize: '1.1rem' }}>🏠</span>
              Home
            </button>
          )}

          {/* User Info and Logout */}
          {userType && userName && (
            <div style={{ display: 'flex', alignItems: 'center', gap: '1rem' }}>
              <div style={{ textAlign: 'right' }}>
                <p style={{
                  fontSize: '0.9rem',
                  fontWeight: '600',
                  color: '#333',
                  margin: 0
                }}>
                  {userName}
                </p>
                <p style={{
                  fontSize: '0.75rem',
                  color: '#666',
                  margin: 0,
                  textTransform: 'capitalize'
                }}>
                  {userType}
                </p>
              </div>
              
              <button
                onClick={handleLogout}
                style={{
                  background: '#dc2626',
                  color: 'white',
                  border: 'none',
                  padding: '0.5rem 1rem',
                  borderRadius: '20px',
                  fontSize: '0.8rem',
                  fontWeight: '600',
                  cursor: 'pointer',
                  transition: 'all 0.3s ease',
                  display: 'flex',
                  alignItems: 'center',
                  gap: '0.5rem'
                }}
                onMouseEnter={(e) => {
                  e.target.style.background = '#b91c1c';
                  e.target.style.transform = 'translateY(-2px)';
                  e.target.style.boxShadow = '0 4px 15px rgba(220, 38, 38, 0.4)';
                }}
                onMouseLeave={(e) => {
                  e.target.style.background = '#dc2626';
                  e.target.style.transform = 'translateY(0)';
                  e.target.style.boxShadow = 'none';
                }}
              >
                <span style={{ fontSize: '1rem' }}>🚪</span>
                Logout
              </button>
            </div>
          )}
        </div>
      </div>
    </header>
  );
};

export default Header;

