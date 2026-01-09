import React, { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { authAPI } from '../utils/api';
import {
  Building2, ArrowLeft, Shield, Smartphone, Check, X,
  LogOut, Loader2, KeyRound, Copy, CheckCircle2
} from 'lucide-react';

const TwoFactorPage = () => {
  const navigate = useNavigate();
  const { user, logout } = useAuth();

  const [loading, setLoading] = useState(false);
  const [qrCode, setQrCode] = useState('');
  const [secret, setSecret] = useState('');
  const [showSetup, setShowSetup] = useState(false);
  const [verificationCode, setVerificationCode] = useState('');
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const [copied, setCopied] = useState(false);

  useEffect(() => {
    if (!user) {
      navigate('/');
    }
  }, [user, navigate]);

  const handleSetup2FA = async () => {
    try {
      setLoading(true);
      setError('');
      const response = await authAPI.setup2FA();
      setQrCode(response.qrCode);
      setSecret(response.manualEntryKey);
      setShowSetup(true);
    } catch (err) {
      setError(err.response?.data?.error || 'Failed to setup 2FA');
    } finally {
      setLoading(false);
    }
  };

  const handleEnable2FA = async (e) => {
    e.preventDefault();
    try {
      setLoading(true);
      setError('');
      await authAPI.enable2FA(verificationCode);
      setSuccess('2FA enabled successfully! Please log in again.');
      setTimeout(() => {
        logout();
        navigate('/');
      }, 2000);
    } catch (err) {
      setError(err.response?.data?.error || 'Invalid verification code');
    } finally {
      setLoading(false);
    }
  };

  const handleDisable2FA = async () => {
    const code = prompt('Enter your current 6-digit authentication code to disable 2FA:');
    if (!code) return;

    try {
      setLoading(true);
      setError('');
      await authAPI.disable2FA(code);
      setSuccess('2FA disabled successfully! Please log in again.');
      setTimeout(() => {
        logout();
        navigate('/');
      }, 2000);
    } catch (err) {
      setError(err.response?.data?.error || 'Failed to disable 2FA');
    } finally {
      setLoading(false);
    }
  };

  const copySecret = () => {
    navigator.clipboard.writeText(secret);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const handleLogout = () => {
    logout();
    navigate('/');
  };

  return (
    <div className="two-factor-page">
      <div className="page-bg">
        <div className="gradient-orb orb-1"></div>
        <div className="gradient-orb orb-2"></div>
      </div>

      <nav className="page-nav">
        <div className="nav-left">
          <Link to="/dashboard" className="back-btn">
            <ArrowLeft size={20} />
          </Link>
          <Link to="/" className="nav-logo">
            <Building2 size={24} strokeWidth={1.5} />
            <span>MAK Kotwal Venus</span>
          </Link>
        </div>
        <div className="nav-right">
          <div className="user-badge">
            <Shield size={16} />
            <span>{user?.name}</span>
          </div>
          <button className="logout-btn" onClick={handleLogout}>
            <LogOut size={18} />
          </button>
        </div>
      </nav>

      <main className="two-factor-content">
        <div className="two-factor-header">
          <h1>
            <Smartphone size={28} />
            <span>Two-Factor Authentication</span>
          </h1>
          <p>Add an extra layer of security to your account</p>
        </div>

        <div className="two-factor-container">
          {error && (
            <div className="alert alert-error">
              <X size={20} />
              <span>{error}</span>
            </div>
          )}

          {success && (
            <div className="alert alert-success">
              <CheckCircle2 size={20} />
              <span>{success}</span>
            </div>
          )}

          <div className="status-card">
            <div className="status-header">
              <h2>Current Status</h2>
              <div className={`status-badge ${user?.two_factor_enabled ? 'enabled' : 'disabled'}`}>
                {user?.two_factor_enabled ? (
                  <>
                    <Check size={16} />
                    <span>Enabled</span>
                  </>
                ) : (
                  <>
                    <X size={16} />
                    <span>Disabled</span>
                  </>
                )}
              </div>
            </div>

            {user?.two_factor_enabled ? (
              <div className="status-content">
                <p>Your account is protected with two-factor authentication.</p>
                <button
                  className="btn btn-danger"
                  onClick={handleDisable2FA}
                  disabled={loading}
                >
                  {loading ? <Loader2 className="spin" size={16} /> : <X size={16} />}
                  <span>Disable 2FA</span>
                </button>
              </div>
            ) : (
              <div className="status-content">
                <p>Enable two-factor authentication to secure your account with an authenticator app.</p>
                {!showSetup && (
                  <button
                    className="btn btn-primary"
                    onClick={handleSetup2FA}
                    disabled={loading}
                  >
                    {loading ? <Loader2 className="spin" size={16} /> : <Smartphone size={16} />}
                    <span>Setup 2FA</span>
                  </button>
                )}
              </div>
            )}
          </div>

          {showSetup && !user?.two_factor_enabled && (
            <div className="setup-card">
              <h2>Setup Instructions</h2>

              <div className="setup-steps">
                <div className="step">
                  <div className="step-number">1</div>
                  <div className="step-content">
                    <h3>Install an Authenticator App</h3>
                    <p>Download and install an authenticator app on your phone:</p>
                    <ul>
                      <li>Google Authenticator</li>
                      <li>Microsoft Authenticator</li>
                      <li>Authy</li>
                      <li>Any TOTP-compatible app</li>
                    </ul>
                  </div>
                </div>

                <div className="step">
                  <div className="step-number">2</div>
                  <div className="step-content">
                    <h3>Scan QR Code</h3>
                    <p>Open your authenticator app and scan this QR code:</p>
                    {qrCode && (
                      <div className="qr-code">
                        <img src={qrCode} alt="2FA QR Code" />
                      </div>
                    )}
                    <div className="manual-entry">
                      <p><strong>Can't scan?</strong> Enter this code manually:</p>
                      <div className="secret-code">
                        <code>{secret}</code>
                        <button
                          type="button"
                          onClick={copySecret}
                          className="copy-btn"
                          title="Copy secret"
                        >
                          {copied ? <Check size={16} /> : <Copy size={16} />}
                        </button>
                      </div>
                    </div>
                  </div>
                </div>

                <div className="step">
                  <div className="step-number">3</div>
                  <div className="step-content">
                    <h3>Verify Setup</h3>
                    <p>Enter the 6-digit code from your authenticator app:</p>
                    <form onSubmit={handleEnable2FA}>
                      <div className="verify-form">
                        <div className="form-group">
                          <KeyRound size={20} />
                          <input
                            type="text"
                            value={verificationCode}
                            onChange={(e) => setVerificationCode(e.target.value.replace(/\D/g, ''))}
                            placeholder="000000"
                            maxLength={6}
                            required
                          />
                        </div>
                        <button
                          type="submit"
                          className="btn btn-success"
                          disabled={loading || verificationCode.length !== 6}
                        >
                          {loading ? <Loader2 className="spin" size={16} /> : <Check size={16} />}
                          <span>Enable 2FA</span>
                        </button>
                      </div>
                    </form>
                  </div>
                </div>
              </div>
            </div>
          )}

          <div className="info-card">
            <h3>What is Two-Factor Authentication?</h3>
            <p>
              Two-factor authentication (2FA) adds an extra layer of security to your account.
              After entering your password, you'll need to provide a code from your authenticator app.
              This ensures that even if someone knows your password, they can't access your account without your phone.
            </p>
          </div>
        </div>
      </main>

      <style>{`
        .two-factor-page {
          min-height: 100vh;
          background: #0a0a0f;
          position: relative;
        }

        .page-bg {
          position: fixed;
          inset: 0;
          pointer-events: none;
          overflow: hidden;
        }

        .gradient-orb {
          position: absolute;
          border-radius: 50%;
          filter: blur(100px);
          opacity: 0.2;
        }

        .orb-1 {
          width: 500px;
          height: 500px;
          background: linear-gradient(135deg, #2d4a3e 0%, #1a2f25 100%);
          top: -100px;
          right: -100px;
        }

        .orb-2 {
          width: 400px;
          height: 400px;
          background: linear-gradient(135deg, #c9a962 0%, #8b7355 100%);
          bottom: -100px;
          left: -100px;
        }

        .page-nav {
          position: sticky;
          top: 0;
          z-index: 100;
          display: flex;
          align-items: center;
          justify-content: space-between;
          padding: 1rem 2rem;
          background: rgba(10, 10, 15, 0.9);
          border-bottom: 1px solid rgba(255, 255, 255, 0.06);
          backdrop-filter: blur(10px);
        }

        .nav-left {
          display: flex;
          align-items: center;
          gap: 1rem;
        }

        .back-btn {
          width: 40px;
          height: 40px;
          display: flex;
          align-items: center;
          justify-content: center;
          background: rgba(255, 255, 255, 0.05);
          border: 1px solid rgba(255, 255, 255, 0.1);
          border-radius: 10px;
          color: rgba(255, 255, 255, 0.7);
          transition: all 0.2s ease;
        }

        .back-btn:hover {
          background: rgba(255, 255, 255, 0.1);
          color: #fff;
        }

        .nav-logo {
          display: flex;
          align-items: center;
          gap: 0.75rem;
          color: #c9a962;
          text-decoration: none;
          font-family: 'Outfit', sans-serif;
          font-weight: 600;
        }

        .nav-right {
          display: flex;
          align-items: center;
          gap: 1rem;
        }

        .user-badge {
          display: flex;
          align-items: center;
          gap: 0.5rem;
          padding: 0.5rem 1rem;
          background: rgba(255, 255, 255, 0.05);
          border-radius: 20px;
          font-family: 'Outfit', sans-serif;
          font-size: 0.9rem;
          color: rgba(255, 255, 255, 0.7);
        }

        .user-badge svg {
          color: #c9a962;
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

        .two-factor-content {
          position: relative;
          z-index: 10;
          padding: 2rem;
          max-width: 900px;
          margin: 0 auto;
        }

        .two-factor-header {
          text-align: center;
          margin-bottom: 2rem;
        }

        .two-factor-header h1 {
          display: flex;
          align-items: center;
          justify-content: center;
          gap: 0.75rem;
          font-family: 'Cormorant Garamond', serif;
          font-size: 2rem;
          color: #fff;
          margin-bottom: 0.5rem;
        }

        .two-factor-header h1 svg {
          color: #2d4a3e;
        }

        .two-factor-header p {
          font-family: 'Outfit', sans-serif;
          color: rgba(255, 255, 255, 0.5);
        }

        .two-factor-container {
          display: flex;
          flex-direction: column;
          gap: 1.5rem;
        }

        .alert {
          display: flex;
          align-items: center;
          gap: 0.75rem;
          padding: 1rem;
          border-radius: 12px;
          font-family: 'Outfit', sans-serif;
          font-size: 0.9rem;
        }

        .alert-error {
          background: rgba(239, 68, 68, 0.1);
          border: 1px solid rgba(239, 68, 68, 0.3);
          color: #f87171;
        }

        .alert-success {
          background: rgba(34, 197, 94, 0.1);
          border: 1px solid rgba(34, 197, 94, 0.3);
          color: #4ade80;
        }

        .status-card,
        .setup-card,
        .info-card {
          background: rgba(255, 255, 255, 0.03);
          border: 1px solid rgba(255, 255, 255, 0.08);
          border-radius: 16px;
          padding: 1.5rem;
        }

        .status-header {
          display: flex;
          align-items: center;
          justify-content: space-between;
          margin-bottom: 1rem;
        }

        .status-header h2 {
          font-family: 'Cormorant Garamond', serif;
          font-size: 1.5rem;
          color: #fff;
        }

        .status-badge {
          display: flex;
          align-items: center;
          gap: 0.5rem;
          padding: 0.5rem 1rem;
          border-radius: 20px;
          font-family: 'Outfit', sans-serif;
          font-size: 0.85rem;
          font-weight: 500;
        }

        .status-badge.enabled {
          background: rgba(34, 197, 94, 0.1);
          border: 1px solid rgba(34, 197, 94, 0.3);
          color: #4ade80;
        }

        .status-badge.disabled {
          background: rgba(156, 163, 175, 0.1);
          border: 1px solid rgba(156, 163, 175, 0.3);
          color: #9ca3af;
        }

        .status-content p {
          font-family: 'Outfit', sans-serif;
          color: rgba(255, 255, 255, 0.7);
          margin-bottom: 1rem;
          line-height: 1.6;
        }

        .btn {
          display: flex;
          align-items: center;
          gap: 0.5rem;
          padding: 0.75rem 1.5rem;
          border: none;
          border-radius: 10px;
          font-family: 'Outfit', sans-serif;
          font-size: 0.9rem;
          font-weight: 500;
          cursor: pointer;
          transition: all 0.2s ease;
        }

        .btn:disabled {
          opacity: 0.5;
          cursor: not-allowed;
        }

        .btn-primary {
          background: rgba(45, 74, 62, 0.3);
          border: 1px solid rgba(45, 74, 62, 0.5);
          color: #4ade80;
        }

        .btn-primary:hover:not(:disabled) {
          background: rgba(45, 74, 62, 0.4);
        }

        .btn-success {
          background: rgba(34, 197, 94, 0.2);
          border: 1px solid rgba(34, 197, 94, 0.4);
          color: #4ade80;
        }

        .btn-success:hover:not(:disabled) {
          background: rgba(34, 197, 94, 0.3);
        }

        .btn-danger {
          background: rgba(239, 68, 68, 0.1);
          border: 1px solid rgba(239, 68, 68, 0.3);
          color: #f87171;
        }

        .btn-danger:hover:not(:disabled) {
          background: rgba(239, 68, 68, 0.2);
        }

        .spin {
          animation: spin 1s linear infinite;
        }

        @keyframes spin {
          to { transform: rotate(360deg); }
        }

        .setup-card h2 {
          font-family: 'Cormorant Garamond', serif;
          font-size: 1.5rem;
          color: #c9a962;
          margin-bottom: 1.5rem;
        }

        .setup-steps {
          display: flex;
          flex-direction: column;
          gap: 2rem;
        }

        .step {
          display: flex;
          gap: 1rem;
        }

        .step-number {
          flex-shrink: 0;
          width: 40px;
          height: 40px;
          display: flex;
          align-items: center;
          justify-content: center;
          background: rgba(201, 169, 98, 0.1);
          border: 2px solid rgba(201, 169, 98, 0.3);
          border-radius: 50%;
          color: #c9a962;
          font-family: 'Outfit', sans-serif;
          font-weight: 600;
          font-size: 1.1rem;
        }

        .step-content {
          flex: 1;
        }

        .step-content h3 {
          font-family: 'Outfit', sans-serif;
          font-size: 1.1rem;
          color: #fff;
          margin-bottom: 0.5rem;
        }

        .step-content p {
          font-family: 'Outfit', sans-serif;
          color: rgba(255, 255, 255, 0.7);
          margin-bottom: 1rem;
          line-height: 1.6;
        }

        .step-content ul {
          list-style: none;
          padding-left: 0;
          margin-bottom: 1rem;
        }

        .step-content li {
          font-family: 'Outfit', sans-serif;
          color: rgba(255, 255, 255, 0.6);
          padding-left: 1.5rem;
          position: relative;
          margin-bottom: 0.5rem;
        }

        .step-content li::before {
          content: '•';
          position: absolute;
          left: 0.5rem;
          color: #c9a962;
        }

        .qr-code {
          display: flex;
          justify-content: center;
          padding: 1.5rem;
          background: #fff;
          border-radius: 12px;
          margin: 1rem 0;
        }

        .qr-code img {
          max-width: 200px;
          height: auto;
        }

        .manual-entry {
          margin-top: 1rem;
          padding: 1rem;
          background: rgba(255, 255, 255, 0.03);
          border: 1px solid rgba(255, 255, 255, 0.08);
          border-radius: 10px;
        }

        .manual-entry p {
          margin-bottom: 0.5rem;
        }

        .secret-code {
          display: flex;
          align-items: center;
          gap: 0.5rem;
          padding: 0.75rem;
          background: rgba(0, 0, 0, 0.3);
          border-radius: 8px;
        }

        .secret-code code {
          flex: 1;
          font-family: 'Monaco', 'Courier New', monospace;
          font-size: 0.9rem;
          color: #4ade80;
          letter-spacing: 0.1em;
        }

        .copy-btn {
          padding: 0.5rem;
          background: rgba(255, 255, 255, 0.05);
          border: 1px solid rgba(255, 255, 255, 0.1);
          border-radius: 6px;
          color: rgba(255, 255, 255, 0.7);
          cursor: pointer;
          transition: all 0.2s ease;
        }

        .copy-btn:hover {
          background: rgba(255, 255, 255, 0.1);
          color: #fff;
        }

        .verify-form {
          display: flex;
          gap: 1rem;
          align-items: flex-end;
        }

        .form-group {
          flex: 1;
          position: relative;
          display: flex;
          align-items: center;
          gap: 0.75rem;
          padding: 0.75rem 1rem;
          background: rgba(255, 255, 255, 0.03);
          border: 1px solid rgba(255, 255, 255, 0.1);
          border-radius: 10px;
        }

        .form-group svg {
          color: #c9a962;
          flex-shrink: 0;
        }

        .form-group input {
          flex: 1;
          background: transparent;
          border: none;
          color: #fff;
          font-family: 'Monaco', 'Courier New', monospace;
          font-size: 1.2rem;
          letter-spacing: 0.3em;
          text-align: center;
          outline: none;
        }

        .form-group input::placeholder {
          color: rgba(255, 255, 255, 0.3);
        }

        .info-card h3 {
          font-family: 'Cormorant Garamond', serif;
          font-size: 1.3rem;
          color: #fff;
          margin-bottom: 1rem;
        }

        .info-card p {
          font-family: 'Outfit', sans-serif;
          color: rgba(255, 255, 255, 0.6);
          line-height: 1.8;
        }

        @media (max-width: 768px) {
          .two-factor-content {
            padding: 1rem;
          }

          .verify-form {
            flex-direction: column;
          }

          .step {
            flex-direction: column;
          }
        }
      `}</style>
    </div>
  );
};

export default TwoFactorPage;
