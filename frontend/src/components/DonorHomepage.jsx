import React, { useState, useEffect } from 'react';

const DonorHomepage = ({ onNavigate }) => {
  const [activeTab, setActiveTab] = useState('home');
  const [isDropdownOpen, setIsDropdownOpen] = useState(false);
  const [donorData, setDonorData] = useState({
    name: 'John Doe',
    email: 'john.doe@example.com',
    bloodType: 'O+',
    totalDonations: 7,
    lastDonation: 'March 15, 2024',
    profilePicture: 'https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?w=150&h=150&fit=crop&crop=face'
  });

  useEffect(() => {
    // Check if user is authenticated
    const userType = localStorage.getItem('userType');
    if (userType !== 'donor') {
      onNavigate('login');
      return;
    }

    // Get donor data from localStorage
    const storedUserData = localStorage.getItem('userData');
    if (storedUserData) {
      const parsedData = JSON.parse(storedUserData);
      setDonorData(prevData => ({
        ...prevData,
        ...parsedData,
        profilePicture: parsedData.profilePicture || prevData.profilePicture
      }));
    }
  }, [onNavigate]);

  const handleLogout = () => {
    localStorage.removeItem('token');
    localStorage.removeItem('userType');
    localStorage.removeItem('userData');
    onNavigate('login');
  };

  const renderContent = () => {
    // Show profile or settings if accessed from dropdown, otherwise show home
    if (activeTab === 'profile' || activeTab === 'settings') {
      switch (activeTab) {
        case 'profile':
          return (
            <div style={{ display: 'flex', flexDirection: 'column', gap: '2rem' }}>
              {/* Back to Home Button */}
              <button
                onClick={() => setActiveTab('home')}
                style={{
                  background: '#dc2626',
                  color: 'white',
                  border: 'none',
                  padding: '0.75rem 1.5rem',
                  borderRadius: '8px',
                  fontSize: '0.9rem',
                  fontWeight: '600',
                  cursor: 'pointer',
                  transition: 'all 0.3s ease',
                  alignSelf: 'flex-start'
                }}
                onMouseEnter={(e) => {
                  e.target.style.background = '#b91c1c';
                }}
                onMouseLeave={(e) => {
                  e.target.style.background = '#dc2626';
                }}
              >
                ← Back to Dashboard
              </button>

              {/* Profile Content */}
              <div style={{
                background: 'white',
                borderRadius: '15px',
                boxShadow: '0 20px 40px rgba(220, 38, 38, 0.15)',
                border: '1px solid #fecaca',
                padding: '2rem',
                overflow: 'hidden'
              }}>
                <h2 style={{ fontSize: '1.8rem', fontWeight: '600', color: '#333', marginBottom: '1.5rem', textAlign: 'center' }}>Profile</h2>
                <div style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>
                  <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '1rem' }}>
                    <img
                      style={{
                        width: '120px',
                        height: '120px',
                        borderRadius: '50%',
                        objectFit: 'cover',
                        border: '4px solid #dc2626'
                      }}
                      src={donorData.profilePicture}
                      alt="Profile"
                    />
                    <button style={{
                      background: '#dc2626',
                      color: 'white',
                      border: 'none',
                      padding: '0.75rem 1.5rem',
                      borderRadius: '8px',
                      fontSize: '0.9rem',
                      fontWeight: '600',
                      cursor: 'pointer',
                      transition: 'all 0.3s ease'
                    }}>
                      Change Photo
                    </button>
                  </div>
                  
                  <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(250px, 1fr))', gap: '1rem' }}>
                    <div>
                      <label style={{ display: 'block', fontSize: '0.9rem', fontWeight: '500', color: '#333', marginBottom: '0.5rem' }}>Full Name</label>
                      <input
                        type="text"
                        value={donorData.name}
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
                    
                    <div>
                      <label style={{ display: 'block', fontSize: '0.9rem', fontWeight: '500', color: '#333', marginBottom: '0.5rem' }}>Email</label>
                      <input
                        type="email"
                        value={donorData.email}
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
                    
                    <div>
                      <label style={{ display: 'block', fontSize: '0.9rem', fontWeight: '500', color: '#333', marginBottom: '0.5rem' }}>Blood Type</label>
                      <input
                        type="text"
                        value={donorData.bloodType}
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
                  </div>
                  
                  <button style={{
                    background: '#dc2626',
                    color: 'white',
                    border: 'none',
                    padding: '1rem 2rem',
                    borderRadius: '8px',
                    fontSize: '1rem',
                    fontWeight: '600',
                    cursor: 'pointer',
                    transition: 'all 0.3s ease',
                    textTransform: 'uppercase',
                    letterSpacing: '0.5px',
                    alignSelf: 'center'
                  }}
                  onMouseEnter={(e) => {
                    e.target.style.transform = 'translateY(-2px)';
                    e.target.style.boxShadow = '0 5px 15px rgba(220, 38, 38, 0.4)';
                    e.target.style.background = '#b91c1c';
                  }}
                  onMouseLeave={(e) => {
                    e.target.style.transform = 'translateY(0)';
                    e.target.style.boxShadow = 'none';
                    e.target.style.background = '#dc2626';
                  }}
                  >
                    Save Changes
                  </button>
                </div>
              </div>
            </div>
          );
        case 'settings':
          return (
            <div style={{ display: 'flex', flexDirection: 'column', gap: '2rem' }}>
              {/* Back to Home Button */}
              <button
                onClick={() => setActiveTab('home')}
                style={{
                  background: '#dc2626',
                  color: 'white',
                  border: 'none',
                  padding: '0.75rem 1.5rem',
                  borderRadius: '8px',
                  fontSize: '0.9rem',
                  fontWeight: '600',
                  cursor: 'pointer',
                  transition: 'all 0.3s ease',
                  alignSelf: 'flex-start'
                }}
                onMouseEnter={(e) => {
                  e.target.style.background = '#b91c1c';
                }}
                onMouseLeave={(e) => {
                  e.target.style.background = '#dc2626';
                }}
              >
                ← Back to Dashboard
              </button>

              {/* Settings Content */}
              <div style={{
                background: 'white',
                borderRadius: '15px',
                boxShadow: '0 20px 40px rgba(220, 38, 38, 0.15)',
                border: '1px solid #fecaca',
                padding: '2rem',
                overflow: 'hidden'
              }}>
                <h2 style={{ fontSize: '1.8rem', fontWeight: '600', color: '#333', marginBottom: '1.5rem', textAlign: 'center' }}>Settings</h2>
                <div style={{ display: 'flex', flexDirection: 'column', gap: '2rem' }}>
                  <div>
                    <h3 style={{ fontSize: '1.2rem', fontWeight: '600', color: '#333', marginBottom: '1rem' }}>Notifications</h3>
                    <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
                      <label style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', cursor: 'pointer' }}>
                        <input type="checkbox" defaultChecked style={{ accentColor: '#dc2626' }} />
                        <span style={{ color: '#333', fontSize: '0.9rem' }}>Email notifications</span>
                      </label>
                      <label style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', cursor: 'pointer' }}>
                        <input type="checkbox" defaultChecked style={{ accentColor: '#dc2626' }} />
                        <span style={{ color: '#333', fontSize: '0.9rem' }}>SMS notifications</span>
                      </label>
                      <label style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', cursor: 'pointer' }}>
                        <input type="checkbox" style={{ accentColor: '#dc2626' }} />
                        <span style={{ color: '#333', fontSize: '0.9rem' }}>Push notifications</span>
                      </label>
                    </div>
                  </div>
                  
                  <div>
                    <h3 style={{ fontSize: '1.2rem', fontWeight: '600', color: '#333', marginBottom: '1rem' }}>Privacy</h3>
                    <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
                      <label style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', cursor: 'pointer' }}>
                        <input type="checkbox" defaultChecked style={{ accentColor: '#dc2626' }} />
                        <span style={{ color: '#333', fontSize: '0.9rem' }}>Show profile to other users</span>
                      </label>
                      <label style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', cursor: 'pointer' }}>
                        <input type="checkbox" style={{ accentColor: '#dc2626' }} />
                        <span style={{ color: '#333', fontSize: '0.9rem' }}>Allow hospitals to contact me</span>
                      </label>
                    </div>
                  </div>
                  
                  <div>
                    <h3 style={{ fontSize: '1.2rem', fontWeight: '600', color: '#333', marginBottom: '1rem' }}>Account</h3>
                    <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
                      <button style={{
                        background: '#dc2626',
                        color: 'white',
                        border: 'none',
                        padding: '0.75rem 1.5rem',
                        borderRadius: '8px',
                        fontSize: '0.9rem',
                        fontWeight: '600',
                        cursor: 'pointer',
                        transition: 'all 0.3s ease',
                        alignSelf: 'flex-start'
                      }}>
                        Change Password
                      </button>
                      <button style={{
                        background: '#fee',
                        color: '#c33',
                        border: '1px solid #fcc',
                        padding: '0.75rem 1.5rem',
                        borderRadius: '8px',
                        fontSize: '0.9rem',
                        fontWeight: '600',
                        cursor: 'pointer',
                        transition: 'all 0.3s ease',
                        alignSelf: 'flex-start'
                      }}>
                        Delete Account
                      </button>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          );
      }
    }

    // Default home content
    return (
      <div style={{ display: 'flex', flexDirection: 'column', gap: '2rem' }}>
        {/* Welcome Section */}
        <div style={{
          background: 'white',
          borderRadius: '15px',
          boxShadow: '0 20px 40px rgba(220, 38, 38, 0.15)',
          border: '1px solid #fecaca',
          padding: '2rem',
          overflow: 'hidden'
        }}>
          <div style={{ textAlign: 'center', marginBottom: '2rem' }}>
            <h2 style={{ fontSize: '1.8rem', fontWeight: '600', color: '#333', marginBottom: '0.5rem' }}>Welcome back, {donorData.name}!</h2>
            <p style={{ color: '#666', fontSize: '0.9rem' }}>Access your donor dashboard</p>
          </div>
          
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(250px, 1fr))', gap: '1.5rem' }}>
            <div style={{
              background: '#f8f9fa',
              padding: '1.5rem',
              borderRadius: '8px',
              border: '1px solid #e1e5e9',
              textAlign: 'center'
            }}>
              <h3 style={{ fontWeight: '500', color: '#333', fontSize: '0.9rem', marginBottom: '0.5rem' }}>Blood Type</h3>
              <p style={{ fontSize: '2rem', fontWeight: '700', color: '#dc2626' }}>{donorData.bloodType}</p>
            </div>
            
            <div style={{
              background: '#f8f9fa',
              padding: '1.5rem',
              borderRadius: '8px',
              border: '1px solid #e1e5e9',
              textAlign: 'center'
            }}>
              <h3 style={{ fontWeight: '500', color: '#333', fontSize: '0.9rem', marginBottom: '0.5rem' }}>Total Donations</h3>
              <p style={{ fontSize: '2rem', fontWeight: '700', color: '#dc2626' }}>{donorData.totalDonations}</p>
            </div>
            
            <div style={{
              background: '#f8f9fa',
              padding: '1.5rem',
              borderRadius: '8px',
              border: '1px solid #e1e5e9',
              textAlign: 'center'
            }}>
              <h3 style={{ fontWeight: '500', color: '#333', fontSize: '0.9rem', marginBottom: '0.5rem' }}>Last Donation</h3>
              <p style={{ fontSize: '1.2rem', fontWeight: '600', color: '#dc2626' }}>{donorData.lastDonation}</p>
            </div>
          </div>
        </div>

        {/* Quick Actions */}
        <div style={{
          background: 'white',
          borderRadius: '15px',
          boxShadow: '0 20px 40px rgba(220, 38, 38, 0.15)',
          border: '1px solid #fecaca',
          padding: '2rem',
          overflow: 'hidden'
        }}>
          <h3 style={{ fontSize: '1.8rem', fontWeight: '600', color: '#333', marginBottom: '1.5rem', textAlign: 'center' }}>Quick Actions</h3>
          
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(300px, 1fr))', gap: '1.5rem' }}>
            <button style={{
              background: '#dc2626',
              color: 'white',
              border: 'none',
              padding: '1.5rem',
              borderRadius: '8px',
              fontSize: '1rem',
              fontWeight: '600',
              cursor: 'pointer',
              transition: 'all 0.3s ease',
              textTransform: 'uppercase',
              letterSpacing: '0.5px'
            }}
            onMouseEnter={(e) => {
              e.target.style.transform = 'translateY(-2px)';
              e.target.style.boxShadow = '0 5px 15px rgba(220, 38, 38, 0.4)';
              e.target.style.background = '#b91c1c';
            }}
            onMouseLeave={(e) => {
              e.target.style.transform = 'translateY(0)';
              e.target.style.boxShadow = 'none';
              e.target.style.background = '#dc2626';
            }}
            >
              <h4 style={{ fontSize: '1.1rem', fontWeight: '600', marginBottom: '0.5rem' }}>Find Blood Requests</h4>
              <p style={{ fontSize: '0.9rem', opacity: '0.9' }}>Help someone in need</p>
            </button>
            
            <button style={{
              background: '#dc2626',
              color: 'white',
              border: 'none',
              padding: '1.5rem',
              borderRadius: '8px',
              fontSize: '1rem',
              fontWeight: '600',
              cursor: 'pointer',
              transition: 'all 0.3s ease',
              textTransform: 'uppercase',
              letterSpacing: '0.5px'
            }}
            onMouseEnter={(e) => {
              e.target.style.transform = 'translateY(-2px)';
              e.target.style.boxShadow = '0 5px 15px rgba(220, 38, 38, 0.4)';
              e.target.style.background = '#b91c1c';
            }}
            onMouseLeave={(e) => {
              e.target.style.transform = 'translateY(0)';
              e.target.style.boxShadow = 'none';
              e.target.style.background = '#dc2626';
            }}
            >
              <h4 style={{ fontSize: '1.1rem', fontWeight: '600', marginBottom: '0.5rem' }}>Schedule Donation</h4>
              <p style={{ fontSize: '0.9rem', opacity: '0.9' }}>Book your next appointment</p>
            </button>
          </div>
        </div>
      </div>
    );
  };

  return (
    <div style={{ background: 'linear-gradient(135deg, #fecaca 0%, #fca5a5 100%)', fontFamily: "'Segoe UI', Tahoma, Geneva, Verdana, sans-serif", minHeight: '100%' }}>
      {/* Header */}
      <header style={{ background: 'white', boxShadow: '0 20px 40px rgba(220, 38, 38, 0.15)', borderBottom: '3px solid #dc2626' }}>
        <div className="max-w-7xl mx-auto px-6 sm:px-8 lg:px-10">
          <div className="flex justify-between items-center h-20">
            {/* Logo */}
            <div className="flex items-center space-x-3">
              <h1 style={{ fontSize: '2.5rem', fontWeight: '700', color: '#dc2626' }}>BloodLink</h1>
            </div>

            {/* Profile Dropdown */}
            <div className="relative">
              <button
                onClick={() => setIsDropdownOpen(!isDropdownOpen)}
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  gap: '0.75rem',
                  padding: '0.5rem',
                  border: 'none',
                  borderRadius: '8px',
                  background: 'transparent',
                  cursor: 'pointer',
                  transition: 'all 0.3s ease'
                }}
                onMouseEnter={(e) => {
                  e.target.style.backgroundColor = '#e9ecef';
                }}
                onMouseLeave={(e) => {
                  e.target.style.backgroundColor = 'transparent';
                }}
              >
                <img
                  style={{
                    width: '40px',
                    height: '40px',
                    borderRadius: '50%',
                    objectFit: 'cover',
                    border: '2px solid #dc2626'
                  }}
                  src={donorData.profilePicture}
                  alt="Profile"
                />
                <span className="hidden md:block" style={{ color: '#333', fontWeight: '500' }}>{donorData.name}</span>
                <svg style={{ width: '16px', height: '16px', color: '#6c757d' }} fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                </svg>
              </button>

              {/* Dropdown Menu */}
              {isDropdownOpen && (
                <div style={{
                  position: 'absolute',
                  right: '0',
                  top: '100%',
                  marginTop: '0.5rem',
                  width: '200px',
                  background: 'white',
                  borderRadius: '8px',
                  boxShadow: '0 20px 40px rgba(220, 38, 38, 0.15)',
                  border: '1px solid #fecaca',
                  zIndex: 50,
                  padding: '0.5rem 0'
                }}>
                  <button
                    onClick={() => {
                      setActiveTab('profile');
                      setIsDropdownOpen(false);
                    }}
                    style={{
                      width: '100%',
                      textAlign: 'left',
                      padding: '0.75rem 1rem',
                      border: 'none',
                      background: 'transparent',
                      cursor: 'pointer',
                      transition: 'all 0.3s ease',
                      color: '#333',
                      fontSize: '0.9rem'
                    }}
                    onMouseEnter={(e) => {
                      e.target.style.backgroundColor = '#e9ecef';
                      e.target.style.color = '#dc2626';
                    }}
                    onMouseLeave={(e) => {
                      e.target.style.backgroundColor = 'transparent';
                      e.target.style.color = '#333';
                    }}
                  >
                    Profile
                  </button>
                  <button
                    onClick={() => {
                      setActiveTab('settings');
                      setIsDropdownOpen(false);
                    }}
                    style={{
                      width: '100%',
                      textAlign: 'left',
                      padding: '0.75rem 1rem',
                      border: 'none',
                      background: 'transparent',
                      cursor: 'pointer',
                      transition: 'all 0.3s ease',
                      color: '#333',
                      fontSize: '0.9rem'
                    }}
                    onMouseEnter={(e) => {
                      e.target.style.backgroundColor = '#e9ecef';
                      e.target.style.color = '#dc2626';
                    }}
                    onMouseLeave={(e) => {
                      e.target.style.backgroundColor = 'transparent';
                      e.target.style.color = '#333';
                    }}
                  >
                    Settings
                  </button>
                  <hr style={{ margin: '0.5rem 0', border: 'none', borderTop: '1px solid #e1e5e9' }} />
                  <button
                    onClick={handleLogout}
                    style={{
                      width: '100%',
                      textAlign: 'left',
                      padding: '0.75rem 1rem',
                      border: 'none',
                      background: 'transparent',
                      cursor: 'pointer',
                      transition: 'all 0.3s ease',
                      color: '#dc2626',
                      fontSize: '0.9rem'
                    }}
                    onMouseEnter={(e) => {
                      e.target.style.backgroundColor = '#e9ecef';
                    }}
                    onMouseLeave={(e) => {
                      e.target.style.backgroundColor = 'transparent';
                    }}
                  >
                    Logout
                  </button>
                </div>
              )}
            </div>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main style={{ maxWidth: '1200px', margin: '0 auto', padding: '2rem 1rem' }}>
        {renderContent()}
      </main>
    </div>
  );
};

export default DonorHomepage;