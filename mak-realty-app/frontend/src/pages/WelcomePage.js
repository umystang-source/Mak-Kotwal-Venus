import React from 'react';
import { useNavigate } from 'react-router-dom';
import { Building2, User, Shield, Sparkles } from 'lucide-react';

const WelcomePage = () => {
  const navigate = useNavigate();

  const handleRoleSelect = (role) => {
    navigate('/login', { state: { role } });
  };

  return (
    <div className="welcome-page">
      <div className="welcome-bg">
        <div className="gradient-orb orb-1"></div>
        <div className="gradient-orb orb-2"></div>
        <div className="gradient-orb orb-3"></div>
        <div className="grid-overlay"></div>
      </div>
      
      <div className="welcome-content">
        <div className="logo-section">
          <div className="logo-icon">
            <Building2 size={48} strokeWidth={1.5} />
          </div>
          <h1 className="logo-text">
            <span className="logo-main">MAK</span>
            <span className="logo-sub">Kotwal Realty</span>
          </h1>
        </div>

        <div className="tagline">
          <Sparkles size={16} />
          <span>Project Management System</span>
          <Sparkles size={16} />
        </div>

        <p className="welcome-description">
          Streamline your real estate portfolio management with powerful search, 
          intelligent recommendations, and seamless asset organization.
        </p>

        <div className="role-cards">
          <button 
            className="role-card user-card"
            onClick={() => handleRoleSelect('user')}
          >
            <div className="card-icon">
              <User size={32} strokeWidth={1.5} />
            </div>
            <div className="card-content">
              <h2>Login as User</h2>
              <p>Search projects, view details, and download assets</p>
            </div>
            <div className="card-arrow">→</div>
          </button>

          <button 
            className="role-card admin-card"
            onClick={() => handleRoleSelect('admin')}
          >
            <div className="card-icon">
              <Shield size={32} strokeWidth={1.5} />
            </div>
            <div className="card-content">
              <h2>Login as Admin</h2>
              <p>Full access with upload and visibility controls</p>
            </div>
            <div className="card-arrow">→</div>
          </button>
        </div>

        <div className="footer-note">
          <p>Secure access with Two-Factor Authentication</p>
        </div>
      </div>

      <style>{`
        .welcome-page {
          min-height: 100vh;
          display: flex;
          align-items: center;
          justify-content: center;
          position: relative;
          overflow: hidden;
          background: #0a0a0f;
        }

        .welcome-bg {
          position: absolute;
          inset: 0;
          overflow: hidden;
        }

        .gradient-orb {
          position: absolute;
          border-radius: 50%;
          filter: blur(80px);
          opacity: 0.4;
        }

        .orb-1 {
          width: 600px;
          height: 600px;
          background: linear-gradient(135deg, #c9a962 0%, #8b7355 100%);
          top: -200px;
          right: -100px;
          animation: float 20s ease-in-out infinite;
        }

        .orb-2 {
          width: 400px;
          height: 400px;
          background: linear-gradient(135deg, #2d4a3e 0%, #1a2f25 100%);
          bottom: -100px;
          left: -100px;
          animation: float 15s ease-in-out infinite reverse;
        }

        .orb-3 {
          width: 300px;
          height: 300px;
          background: linear-gradient(135deg, #c9a962 0%, #1a1a2e 100%);
          top: 50%;
          left: 50%;
          transform: translate(-50%, -50%);
          animation: pulse 10s ease-in-out infinite;
        }

        @keyframes float {
          0%, 100% { transform: translate(0, 0) rotate(0deg); }
          33% { transform: translate(30px, -30px) rotate(5deg); }
          66% { transform: translate(-20px, 20px) rotate(-5deg); }
        }

        @keyframes pulse {
          0%, 100% { opacity: 0.3; transform: translate(-50%, -50%) scale(1); }
          50% { opacity: 0.5; transform: translate(-50%, -50%) scale(1.1); }
        }

        .grid-overlay {
          position: absolute;
          inset: 0;
          background-image: 
            linear-gradient(rgba(201, 169, 98, 0.03) 1px, transparent 1px),
            linear-gradient(90deg, rgba(201, 169, 98, 0.03) 1px, transparent 1px);
          background-size: 60px 60px;
        }

        .welcome-content {
          position: relative;
          z-index: 10;
          text-align: center;
          padding: 3rem;
          max-width: 600px;
        }

        .logo-section {
          display: flex;
          flex-direction: column;
          align-items: center;
          gap: 1rem;
          margin-bottom: 1.5rem;
        }

        .logo-icon {
          width: 90px;
          height: 90px;
          background: linear-gradient(135deg, #c9a962 0%, #a38a4f 100%);
          border-radius: 24px;
          display: flex;
          align-items: center;
          justify-content: center;
          color: #0a0a0f;
          box-shadow: 
            0 20px 40px rgba(201, 169, 98, 0.3),
            inset 0 1px 0 rgba(255, 255, 255, 0.2);
          transform: rotate(-3deg);
        }

        .logo-text {
          display: flex;
          flex-direction: column;
        }

        .logo-main {
          font-family: 'Cormorant Garamond', serif;
          font-size: 3.5rem;
          font-weight: 600;
          color: #c9a962;
          letter-spacing: 0.3em;
          line-height: 1;
        }

        .logo-sub {
          font-family: 'Outfit', sans-serif;
          font-size: 1.1rem;
          font-weight: 300;
          color: rgba(255, 255, 255, 0.7);
          letter-spacing: 0.4em;
          text-transform: uppercase;
        }

        .tagline {
          display: flex;
          align-items: center;
          justify-content: center;
          gap: 0.75rem;
          color: rgba(201, 169, 98, 0.8);
          font-family: 'Outfit', sans-serif;
          font-size: 0.85rem;
          letter-spacing: 0.15em;
          text-transform: uppercase;
          margin-bottom: 1.5rem;
        }

        .welcome-description {
          font-family: 'Outfit', sans-serif;
          font-size: 1.1rem;
          color: rgba(255, 255, 255, 0.6);
          line-height: 1.7;
          margin-bottom: 3rem;
          max-width: 450px;
          margin-left: auto;
          margin-right: auto;
        }

        .role-cards {
          display: flex;
          flex-direction: column;
          gap: 1rem;
        }

        .role-card {
          display: flex;
          align-items: center;
          gap: 1.25rem;
          padding: 1.5rem 2rem;
          background: rgba(255, 255, 255, 0.03);
          border: 1px solid rgba(255, 255, 255, 0.08);
          border-radius: 16px;
          cursor: pointer;
          transition: all 0.3s ease;
          text-align: left;
        }

        .role-card:hover {
          background: rgba(255, 255, 255, 0.06);
          border-color: rgba(201, 169, 98, 0.3);
          transform: translateX(8px);
        }

        .user-card:hover .card-icon {
          background: linear-gradient(135deg, #3d5a4c 0%, #2d4a3e 100%);
        }

        .admin-card:hover .card-icon {
          background: linear-gradient(135deg, #c9a962 0%, #a38a4f 100%);
        }

        .card-icon {
          width: 64px;
          height: 64px;
          background: rgba(255, 255, 255, 0.05);
          border-radius: 14px;
          display: flex;
          align-items: center;
          justify-content: center;
          color: rgba(255, 255, 255, 0.7);
          transition: all 0.3s ease;
          flex-shrink: 0;
        }

        .role-card:hover .card-icon {
          color: #0a0a0f;
        }

        .card-content {
          flex: 1;
        }

        .card-content h2 {
          font-family: 'Outfit', sans-serif;
          font-size: 1.25rem;
          font-weight: 600;
          color: #fff;
          margin-bottom: 0.25rem;
        }

        .card-content p {
          font-family: 'Outfit', sans-serif;
          font-size: 0.9rem;
          color: rgba(255, 255, 255, 0.5);
        }

        .card-arrow {
          font-size: 1.5rem;
          color: rgba(255, 255, 255, 0.3);
          transition: all 0.3s ease;
        }

        .role-card:hover .card-arrow {
          color: #c9a962;
          transform: translateX(4px);
        }

        .footer-note {
          margin-top: 3rem;
          padding-top: 2rem;
          border-top: 1px solid rgba(255, 255, 255, 0.05);
        }

        .footer-note p {
          font-family: 'Outfit', sans-serif;
          font-size: 0.85rem;
          color: rgba(255, 255, 255, 0.4);
          display: flex;
          align-items: center;
          justify-content: center;
          gap: 0.5rem;
        }

        @media (max-width: 640px) {
          .welcome-content {
            padding: 2rem;
          }

          .logo-main {
            font-size: 2.5rem;
          }

          .role-card {
            padding: 1.25rem 1.5rem;
          }

          .card-icon {
            width: 54px;
            height: 54px;
          }
        }
      `}</style>
    </div>
  );
};

export default WelcomePage;
