import React from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import {
  Building2, Search, Upload, LogOut, User, Shield,
  Sparkles, ArrowRight, Users, Smartphone
} from 'lucide-react';

const DashboardPage = () => {
  const navigate = useNavigate();
  const { user, logout, isAdmin } = useAuth();

  const handleLogout = () => {
    logout();
    navigate('/');
  };

  return (
    <div className="dashboard-page">
      <div className="dashboard-bg">
        <div className="gradient-orb orb-1"></div>
        <div className="gradient-orb orb-2"></div>
        <div className="grid-overlay"></div>
      </div>

      <nav className="dashboard-nav">
        <Link to="/" className="nav-logo">
          <Building2 size={24} strokeWidth={1.5} />
          <span>MAK Kotwal Venus</span>
        </Link>

        <div className="nav-user">
          <div className="user-info">
            <div className="user-avatar">
              {isAdmin() ? <Shield size={18} /> : <User size={18} />}
            </div>
            <div className="user-details">
              <span className="user-name">{user?.name}</span>
              <span className="user-role">{isAdmin() ? 'Administrator' : 'User'}</span>
            </div>
          </div>
          <button className="logout-btn" onClick={handleLogout}>
            <LogOut size={18} />
          </button>
        </div>
      </nav>

      <main className="dashboard-content">
        <div className="welcome-section">
          <div className="welcome-text">
            <h1>
              <Sparkles size={24} />
              <span>Welcome, {user?.name?.split(' ')[0]}</span>
            </h1>
            <p>What would you like to do today?</p>
          </div>
        </div>

        <div className="action-cards">
          <button 
            className="action-card search-card"
            onClick={() => navigate('/search')}
          >
            <div className="card-icon-wrapper">
              <div className="card-icon">
                <Search size={36} strokeWidth={1.5} />
              </div>
            </div>
            <div className="card-body">
              <h2>Search Projects</h2>
              <p>
                Find and filter projects by name, location, budget, 
                configurations, and more.
              </p>
              <div className="card-features">
                <span>Advanced Filters</span>
                <span>Smart Recommendations</span>
                <span>Quick Downloads</span>
              </div>
            </div>
            <div className="card-action">
              <span>Start Searching</span>
              <ArrowRight size={20} />
            </div>
          </button>

          <button 
            className="action-card upload-card"
            onClick={() => navigate('/upload')}
          >
            <div className="card-icon-wrapper">
              <div className="card-icon">
                <Upload size={36} strokeWidth={1.5} />
              </div>
            </div>
            <div className="card-body">
              <h2>Upload Projects</h2>
              <p>
                Add new projects manually or bulk upload via Excel. 
                Attach floor plans and videos.
              </p>
              <div className="card-features">
                <span>Manual Entry</span>
                <span>Excel Import</span>
                <span>Media Upload</span>
              </div>
            </div>
            <div className="card-action">
              <span>Start Uploading</span>
              <ArrowRight size={20} />
            </div>
          </button>

          {isAdmin() && (
            <button
              className="action-card users-card"
              onClick={() => navigate('/users')}
            >
              <div className="card-icon-wrapper">
                <div className="card-icon">
                  <Users size={36} strokeWidth={1.5} />
                </div>
              </div>
              <div className="card-body">
                <h2>User Management</h2>
                <p>
                  Manage user accounts, roles, and visibility.
                  Control access and permissions.
                </p>
                <div className="card-features">
                  <span>Hide/Unhide Users</span>
                  <span>Role Management</span>
                  <span>Admin Only</span>
                </div>
              </div>
              <div className="card-action">
                <span>Manage Users</span>
                <ArrowRight size={20} />
              </div>
            </button>
          )}

          <button
            className="action-card security-card"
            onClick={() => navigate('/2fa')}
          >
            <div className="card-icon-wrapper">
              <div className="card-icon">
                <Smartphone size={36} strokeWidth={1.5} />
              </div>
            </div>
            <div className="card-body">
              <h2>Two-Factor Authentication</h2>
              <p>
                Secure your account with two-factor authentication.
                Use any authenticator app.
              </p>
              <div className="card-features">
                <span>Google Authenticator</span>
                <span>Microsoft Authenticator</span>
                <span>Authy</span>
              </div>
            </div>
            <div className="card-action">
              <span>Setup 2FA</span>
              <ArrowRight size={20} />
            </div>
          </button>
        </div>

        {isAdmin() && (
          <div className="admin-notice">
            <Shield size={18} />
            <span>
              As an admin, you can control visibility of projects and their details
              using the eye icon toggles in search results.
            </span>
          </div>
        )}

      </main>

      <style>{`
        .dashboard-page {
          min-height: 100vh;
          position: relative;
          overflow: hidden;
          background: #0a0a0f;
        }

        .dashboard-bg {
          position: fixed;
          inset: 0;
          overflow: hidden;
          pointer-events: none;
        }

        .gradient-orb {
          position: absolute;
          border-radius: 50%;
          filter: blur(100px);
          opacity: 0.25;
        }

        .orb-1 {
          width: 600px;
          height: 600px;
          background: linear-gradient(135deg, #c9a962 0%, #8b7355 100%);
          top: -200px;
          right: -200px;
        }

        .orb-2 {
          width: 500px;
          height: 500px;
          background: linear-gradient(135deg, #2d4a3e 0%, #1a2f25 100%);
          bottom: -150px;
          left: -150px;
        }

        .grid-overlay {
          position: absolute;
          inset: 0;
          background-image: 
            linear-gradient(rgba(201, 169, 98, 0.02) 1px, transparent 1px),
            linear-gradient(90deg, rgba(201, 169, 98, 0.02) 1px, transparent 1px);
          background-size: 80px 80px;
        }

        .dashboard-nav {
          position: relative;
          z-index: 20;
          display: flex;
          align-items: center;
          justify-content: space-between;
          padding: 1.25rem 2.5rem;
          background: rgba(10, 10, 15, 0.8);
          border-bottom: 1px solid rgba(255, 255, 255, 0.06);
          backdrop-filter: blur(10px);
        }

        .nav-logo {
          display: flex;
          align-items: center;
          gap: 0.75rem;
          color: #c9a962;
          text-decoration: none;
          font-family: 'Outfit', sans-serif;
          font-size: 1.1rem;
          font-weight: 600;
        }

        .nav-user {
          display: flex;
          align-items: center;
          gap: 1rem;
        }

        .user-info {
          display: flex;
          align-items: center;
          gap: 0.75rem;
        }

        .user-avatar {
          width: 40px;
          height: 40px;
          background: rgba(201, 169, 98, 0.15);
          border: 1px solid rgba(201, 169, 98, 0.3);
          border-radius: 10px;
          display: flex;
          align-items: center;
          justify-content: center;
          color: #c9a962;
        }

        .user-details {
          display: flex;
          flex-direction: column;
        }

        .user-name {
          font-family: 'Outfit', sans-serif;
          font-size: 0.95rem;
          font-weight: 500;
          color: #fff;
        }

        .user-role {
          font-family: 'Outfit', sans-serif;
          font-size: 0.75rem;
          color: rgba(255, 255, 255, 0.5);
        }

        .logout-btn {
          width: 40px;
          height: 40px;
          background: rgba(255, 255, 255, 0.05);
          border: 1px solid rgba(255, 255, 255, 0.1);
          border-radius: 10px;
          display: flex;
          align-items: center;
          justify-content: center;
          color: rgba(255, 255, 255, 0.6);
          cursor: pointer;
          transition: all 0.2s ease;
        }

        .logout-btn:hover {
          background: rgba(220, 38, 38, 0.1);
          border-color: rgba(220, 38, 38, 0.3);
          color: #fca5a5;
        }

        .dashboard-content {
          position: relative;
          z-index: 10;
          max-width: 900px;
          margin: 0 auto;
          padding: 3rem 2rem;
        }

        .welcome-section {
          text-align: center;
          margin-bottom: 3rem;
        }

        .welcome-text h1 {
          display: flex;
          align-items: center;
          justify-content: center;
          gap: 0.75rem;
          font-family: 'Cormorant Garamond', serif;
          font-size: 2.5rem;
          font-weight: 500;
          color: #fff;
          margin-bottom: 0.5rem;
        }

        .welcome-text h1 svg {
          color: #c9a962;
        }

        .welcome-text p {
          font-family: 'Outfit', sans-serif;
          font-size: 1.1rem;
          color: rgba(255, 255, 255, 0.5);
        }

        .action-cards {
          display: grid;
          grid-template-columns: repeat(2, 1fr);
          gap: 1.5rem;
          margin-bottom: 2rem;
        }

        .action-card {
          background: rgba(255, 255, 255, 0.03);
          border: 1px solid rgba(255, 255, 255, 0.08);
          border-radius: 20px;
          padding: 2rem;
          text-align: left;
          cursor: pointer;
          transition: all 0.3s ease;
          display: flex;
          flex-direction: column;
          gap: 1.5rem;
        }

        .action-card:hover {
          background: rgba(255, 255, 255, 0.05);
          transform: translateY(-4px);
        }

        .search-card:hover {
          border-color: rgba(45, 74, 62, 0.5);
        }

        .upload-card:hover {
          border-color: rgba(201, 169, 98, 0.5);
        }

        .card-icon-wrapper {
          display: flex;
        }

        .card-icon {
          width: 70px;
          height: 70px;
          background: rgba(255, 255, 255, 0.05);
          border-radius: 16px;
          display: flex;
          align-items: center;
          justify-content: center;
          color: rgba(255, 255, 255, 0.7);
          transition: all 0.3s ease;
        }

        .search-card:hover .card-icon {
          background: linear-gradient(135deg, #3d5a4c 0%, #2d4a3e 100%);
          color: #fff;
        }

        .upload-card:hover .card-icon {
          background: linear-gradient(135deg, #c9a962 0%, #a38a4f 100%);
          color: #0a0a0f;
        }

        .card-body h2 {
          font-family: 'Outfit', sans-serif;
          font-size: 1.4rem;
          font-weight: 600;
          color: #fff;
          margin-bottom: 0.5rem;
        }

        .card-body p {
          font-family: 'Outfit', sans-serif;
          font-size: 0.95rem;
          color: rgba(255, 255, 255, 0.5);
          line-height: 1.6;
          margin-bottom: 1rem;
        }

        .card-features {
          display: flex;
          flex-wrap: wrap;
          gap: 0.5rem;
        }

        .card-features span {
          font-family: 'Outfit', sans-serif;
          font-size: 0.75rem;
          color: rgba(255, 255, 255, 0.6);
          background: rgba(255, 255, 255, 0.05);
          padding: 0.35rem 0.75rem;
          border-radius: 20px;
        }

        .card-action {
          display: flex;
          align-items: center;
          gap: 0.5rem;
          font-family: 'Outfit', sans-serif;
          font-size: 0.95rem;
          font-weight: 500;
          color: rgba(255, 255, 255, 0.4);
          padding-top: 1rem;
          border-top: 1px solid rgba(255, 255, 255, 0.06);
          transition: all 0.3s ease;
        }

        .action-card:hover .card-action {
          color: #c9a962;
        }

        .action-card:hover .card-action svg {
          transform: translateX(4px);
        }

        .card-action svg {
          transition: transform 0.3s ease;
        }

        .admin-notice {
          display: flex;
          align-items: center;
          gap: 0.75rem;
          background: rgba(201, 169, 98, 0.08);
          border: 1px solid rgba(201, 169, 98, 0.2);
          border-radius: 12px;
          padding: 1rem 1.25rem;
          margin-bottom: 2rem;
        }

        .admin-notice svg {
          color: #c9a962;
          flex-shrink: 0;
        }

        .admin-notice span {
          font-family: 'Outfit', sans-serif;
          font-size: 0.9rem;
          color: rgba(255, 255, 255, 0.7);
        }

        .quick-stats {
          display: flex;
          gap: 1rem;
        }

        .stat-card {
          display: flex;
          align-items: center;
          gap: 1rem;
          background: rgba(255, 255, 255, 0.03);
          border: 1px solid rgba(255, 255, 255, 0.08);
          border-radius: 12px;
          padding: 1rem 1.25rem;
        }

        .stat-card svg {
          color: rgba(255, 255, 255, 0.4);
        }

        .stat-info {
          display: flex;
          flex-direction: column;
          gap: 0.25rem;
        }

        .stat-label {
          font-family: 'Outfit', sans-serif;
          font-size: 0.85rem;
          color: rgba(255, 255, 255, 0.5);
        }

        .stat-action {
          font-family: 'Outfit', sans-serif;
          font-size: 0.9rem;
          color: #c9a962;
          text-decoration: none;
        }

        .stat-action:hover {
          text-decoration: underline;
        }

        @media (max-width: 768px) {
          .dashboard-nav {
            padding: 1rem 1.5rem;
          }

          .user-details {
            display: none;
          }

          .dashboard-content {
            padding: 2rem 1.5rem;
          }

          .welcome-text h1 {
            font-size: 2rem;
          }

          .action-cards {
            grid-template-columns: 1fr;
          }
        }
      `}</style>
    </div>
  );
};

export default DashboardPage;
