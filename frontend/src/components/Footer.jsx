import React from 'react';

const Footer = () => {
  const handleContactClick = () => {
    // You can implement contact functionality here
    // For now, we'll just show an alert
    alert('Contact us at: support@bloodlink.com\nPhone: +1 (555) 123-4567\nAddress: 123 Health Street, Medical City, MC 12345');
  };

  return (
    <footer style={{
      background: 'white',
      borderTop: '3px solid #dc2626',
      boxShadow: '0 -5px 15px rgba(220, 38, 38, 0.1)',
      marginTop: 'auto',
      padding: '2rem 1rem',
      fontFamily: "'Segoe UI', Tahoma, Geneva, Verdana, sans-serif"
    }}>
      <div style={{
        maxWidth: '1200px',
        margin: '0 auto',
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        gap: '1.5rem'
      }}>
        {/* Footer Content */}
        <div style={{
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center',
          gap: '1rem',
          textAlign: 'center'
        }}>
          {/* Logo and Title */}
          <div style={{
            display: 'flex',
            alignItems: 'center',
            gap: '0.5rem'
          }}>
            <h3 style={{
              fontSize: '1.5rem',
              fontWeight: '700',
              color: '#dc2626',
              margin: 0
            }}>
              BloodLink
            </h3>
            <span style={{ fontSize: '1.2rem' }}>🩸</span>
          </div>
          
          <p style={{
            color: '#666',
            fontSize: '0.9rem',
            margin: 0,
            maxWidth: '400px'
          }}>
            Connect Lives, Save Lives. Join our community of blood donors and help make a difference.
          </p>
        </div>

        {/* Contact Button */}
        <button
          onClick={handleContactClick}
          style={{
            background: '#dc2626',
            color: 'white',
            border: 'none',
            padding: '0.75rem 2rem',
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
          Contact Us
        </button>

        {/* Footer Links */}
        <div style={{
          display: 'flex',
          gap: '2rem',
          flexWrap: 'wrap',
          justifyContent: 'center'
        }}>
          <a 
            href="#about" 
            style={{
              color: '#666',
              textDecoration: 'none',
              fontSize: '0.9rem',
              transition: 'color 0.3s ease'
            }}
            onMouseEnter={(e) => e.target.style.color = '#dc2626'}
            onMouseLeave={(e) => e.target.style.color = '#666'}
          >
            About Us
          </a>
          <a 
            href="#privacy" 
            style={{
              color: '#666',
              textDecoration: 'none',
              fontSize: '0.9rem',
              transition: 'color 0.3s ease'
            }}
            onMouseEnter={(e) => e.target.style.color = '#dc2626'}
            onMouseLeave={(e) => e.target.style.color = '#666'}
          >
            Privacy Policy
          </a>
          <a 
            href="#terms" 
            style={{
              color: '#666',
              textDecoration: 'none',
              fontSize: '0.9rem',
              transition: 'color 0.3s ease'
            }}
            onMouseEnter={(e) => e.target.style.color = '#dc2626'}
            onMouseLeave={(e) => e.target.style.color = '#666'}
          >
            Terms of Service
          </a>
          <a 
            href="#help" 
            style={{
              color: '#666',
              textDecoration: 'none',
              fontSize: '0.9rem',
              transition: 'color 0.3s ease'
            }}
            onMouseEnter={(e) => e.target.style.color = '#dc2626'}
            onMouseLeave={(e) => e.target.style.color = '#666'}
          >
            Help Center
          </a>
        </div>

        {/* Copyright */}
        <div style={{
          borderTop: '1px solid #e1e5e9',
          paddingTop: '1rem',
          textAlign: 'center',
          width: '100%'
        }}>
          <p style={{
            color: '#999',
            fontSize: '0.8rem',
            margin: 0
          }}>
            © 2024 BloodLink. All rights reserved. | Saving lives, one donation at a time.
          </p>
        </div>
      </div>
    </footer>
  );
};

export default Footer;
