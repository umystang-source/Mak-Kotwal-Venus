import React, { useState } from 'react';
import { useNavigate, useLocation, Link } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { Building2, Mail, Lock, Eye, EyeOff, ArrowLeft, Shield } from 'lucide-react';

const LoginPage = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const { login, verifyTOTP, loginComplete, register } = useAuth();
  
  const intendedRole = location.state?.role || 'user';
  
  const [isRegister, setIsRegister] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [requires2FA, setRequires2FA] = useState(false);
  const [pendingUserId, setPendingUserId] = useState(null);

  const [formData, setFormData] = useState({
    email: '',
    password: '',
    name: '',
    token: ''
  });

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
    setError('');
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError('');

    try {
      if (requires2FA) {
        // Verify TOTP
        await verifyTOTP(pendingUserId, formData.token);
        navigate('/dashboard');
      } else if (isRegister) {
        // Register
        await register(formData.email, formData.password, formData.name, intendedRole);
        navigate('/dashboard');
      } else {
        // Login
        const result = await login(formData.email, formData.password);

        if (result.requires2FA) {
          setRequires2FA(true);
          setPendingUserId(result.userId);
        } else {
          loginComplete(result.token, result.user);
          navigate('/dashboard');
        }
      }
    } catch (err) {
      setError(err.response?.data?.error || 'An error occurred');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="login-page">
      <div className="login-bg">
        <div className="gradient-orb orb-1"></div>
        <div className="gradient-orb orb-2"></div>
      </div>

      <div className="login-container">
        <Link to="/" className="back-link">
          <ArrowLeft size={20} />
          <span>Back</span>
        </Link>

        <div className="login-card">
          <div className="login-header">
            <div className="logo-icon">
              <Building2 size={28} strokeWidth={1.5} />
            </div>
            <h1>
              {requires2FA ? 'Verify Identity' : (isRegister ? 'Create Account' : 'Welcome Back')}
            </h1>
            <p>
              {requires2FA
                ? 'Enter the code from your authenticator app'
                : (isRegister
                    ? `Register as ${intendedRole === 'admin' ? 'Administrator' : 'User'}`
                    : `Sign in as ${intendedRole === 'admin' ? 'Administrator' : 'User'}`
                  )
              }
            </p>
          </div>

          {error && (
            <div className="error-message">
              <span>{error}</span>
            </div>
          )}

          <form onSubmit={handleSubmit}>
            {requires2FA ? (
              <div className="form-group">
                <label>
                  <Shield size={16} />
                  <span>Authentication Code</span>
                </label>
                <input
                  type="text"
                  name="token"
                  value={formData.token}
                  onChange={handleChange}
                  placeholder="Enter 6-digit code"
                  maxLength={6}
                  required
                  autoFocus
                />
              </div>
            ) : (
              <>
                {isRegister && (
                  <div className="form-group">
                    <label>
                      <span>Full Name</span>
                    </label>
                    <input
                      type="text"
                      name="name"
                      value={formData.name}
                      onChange={handleChange}
                      placeholder="Enter your full name"
                      required
                    />
                  </div>
                )}

                <div className="form-group">
                  <label>
                    <Mail size={16} />
                    <span>Email Address</span>
                  </label>
                  <input
                    type="email"
                    name="email"
                    value={formData.email}
                    onChange={handleChange}
                    placeholder="Enter your email"
                    required
                  />
                </div>

                <div className="form-group">
                  <label>
                    <Lock size={16} />
                    <span>Password</span>
                  </label>
                  <div className="password-input">
                    <input
                      type={showPassword ? 'text' : 'password'}
                      name="password"
                      value={formData.password}
                      onChange={handleChange}
                      placeholder="Enter your password"
                      required
                      minLength={6}
                    />
                    <button
                      type="button"
                      className="toggle-password"
                      onClick={() => setShowPassword(!showPassword)}
                    >
                      {showPassword ? <EyeOff size={18} /> : <Eye size={18} />}
                    </button>
                  </div>
                </div>
              </>
            )}

            <button type="submit" className="submit-btn" disabled={loading}>
              {loading ? (
                <span className="loading-spinner"></span>
              ) : (
                <span>
                  {requires2FA ? 'Verify OTP' : (isRegister ? 'Create Account' : 'Sign In')}
                </span>
              )}
            </button>
          </form>

          {!requires2FA && (
            <div className="toggle-mode">
              <span>
                {isRegister ? 'Already have an account?' : "Don't have an account?"}
              </span>
              <button onClick={() => setIsRegister(!isRegister)}>
                {isRegister ? 'Sign In' : 'Register'}
              </button>
            </div>
          )}
        </div>
      </div>

      <style>{`
        .login-page {
          min-height: 100vh;
          display: flex;
          align-items: center;
          justify-content: center;
          position: relative;
          overflow: hidden;
          background: #0a0a0f;
        }

        .login-bg {
          position: absolute;
          inset: 0;
          overflow: hidden;
        }

        .gradient-orb {
          position: absolute;
          border-radius: 50%;
          filter: blur(100px);
          opacity: 0.3;
        }

        .orb-1 {
          width: 500px;
          height: 500px;
          background: linear-gradient(135deg, #c9a962 0%, #8b7355 100%);
          top: -150px;
          right: -150px;
        }

        .orb-2 {
          width: 400px;
          height: 400px;
          background: linear-gradient(135deg, #2d4a3e 0%, #1a2f25 100%);
          bottom: -100px;
          left: -100px;
        }

        .login-container {
          position: relative;
          z-index: 10;
          width: 100%;
          max-width: 420px;
          padding: 2rem;
        }

        .back-link {
          display: inline-flex;
          align-items: center;
          gap: 0.5rem;
          color: rgba(255, 255, 255, 0.6);
          text-decoration: none;
          font-family: 'Outfit', sans-serif;
          font-size: 0.9rem;
          margin-bottom: 2rem;
          transition: color 0.2s ease;
        }

        .back-link:hover {
          color: #c9a962;
        }

        .login-card {
          background: rgba(255, 255, 255, 0.03);
          border: 1px solid rgba(255, 255, 255, 0.08);
          border-radius: 24px;
          padding: 2.5rem;
        }

        .login-header {
          text-align: center;
          margin-bottom: 2rem;
        }

        .logo-icon {
          width: 56px;
          height: 56px;
          background: linear-gradient(135deg, #c9a962 0%, #a38a4f 100%);
          border-radius: 14px;
          display: flex;
          align-items: center;
          justify-content: center;
          color: #0a0a0f;
          margin: 0 auto 1.25rem;
        }

        .login-header h1 {
          font-family: 'Outfit', sans-serif;
          font-size: 1.5rem;
          font-weight: 600;
          color: #fff;
          margin-bottom: 0.5rem;
        }

        .login-header p {
          font-family: 'Outfit', sans-serif;
          font-size: 0.95rem;
          color: rgba(255, 255, 255, 0.5);
        }

        .error-message {
          background: rgba(220, 38, 38, 0.1);
          border: 1px solid rgba(220, 38, 38, 0.3);
          border-radius: 10px;
          padding: 0.875rem 1rem;
          margin-bottom: 1.5rem;
          color: #fca5a5;
          font-family: 'Outfit', sans-serif;
          font-size: 0.9rem;
        }

        .demo-otp {
          background: rgba(201, 169, 98, 0.1);
          border: 1px solid rgba(201, 169, 98, 0.3);
          border-radius: 10px;
          padding: 0.875rem 1rem;
          margin-bottom: 1.5rem;
          color: #c9a962;
          font-family: 'Outfit', sans-serif;
          font-size: 0.9rem;
          display: flex;
          align-items: center;
          gap: 0.5rem;
        }

        .demo-otp strong {
          font-weight: 600;
          letter-spacing: 0.1em;
        }

        form {
          display: flex;
          flex-direction: column;
          gap: 1.25rem;
        }

        .form-group {
          display: flex;
          flex-direction: column;
          gap: 0.5rem;
        }

        .form-group label {
          display: flex;
          align-items: center;
          gap: 0.5rem;
          font-family: 'Outfit', sans-serif;
          font-size: 0.85rem;
          color: rgba(255, 255, 255, 0.7);
        }

        .form-group input {
          width: 100%;
          padding: 0.875rem 1rem;
          background: rgba(255, 255, 255, 0.05);
          border: 1px solid rgba(255, 255, 255, 0.1);
          border-radius: 10px;
          color: #fff;
          font-family: 'Outfit', sans-serif;
          font-size: 0.95rem;
          transition: all 0.2s ease;
        }

        .form-group input::placeholder {
          color: rgba(255, 255, 255, 0.3);
        }

        .form-group input:focus {
          outline: none;
          border-color: rgba(201, 169, 98, 0.5);
          background: rgba(255, 255, 255, 0.08);
        }

        .password-input {
          position: relative;
        }

        .password-input input {
          padding-right: 3rem;
        }

        .toggle-password {
          position: absolute;
          right: 0.75rem;
          top: 50%;
          transform: translateY(-50%);
          background: none;
          border: none;
          color: rgba(255, 255, 255, 0.4);
          cursor: pointer;
          padding: 0.25rem;
          display: flex;
          transition: color 0.2s ease;
        }

        .toggle-password:hover {
          color: rgba(255, 255, 255, 0.7);
        }

        .submit-btn {
          width: 100%;
          padding: 1rem;
          background: linear-gradient(135deg, #c9a962 0%, #a38a4f 100%);
          border: none;
          border-radius: 10px;
          color: #0a0a0f;
          font-family: 'Outfit', sans-serif;
          font-size: 1rem;
          font-weight: 600;
          cursor: pointer;
          transition: all 0.2s ease;
          margin-top: 0.5rem;
          display: flex;
          align-items: center;
          justify-content: center;
          min-height: 48px;
        }

        .submit-btn:hover:not(:disabled) {
          transform: translateY(-2px);
          box-shadow: 0 8px 20px rgba(201, 169, 98, 0.3);
        }

        .submit-btn:disabled {
          opacity: 0.7;
          cursor: not-allowed;
        }

        .loading-spinner {
          width: 20px;
          height: 20px;
          border: 2px solid rgba(10, 10, 15, 0.3);
          border-top-color: #0a0a0f;
          border-radius: 50%;
          animation: spin 0.8s linear infinite;
        }

        @keyframes spin {
          to { transform: rotate(360deg); }
        }

        .toggle-mode {
          text-align: center;
          margin-top: 1.5rem;
          padding-top: 1.5rem;
          border-top: 1px solid rgba(255, 255, 255, 0.08);
        }

        .toggle-mode span {
          font-family: 'Outfit', sans-serif;
          font-size: 0.9rem;
          color: rgba(255, 255, 255, 0.5);
        }

        .toggle-mode button {
          background: none;
          border: none;
          color: #c9a962;
          font-family: 'Outfit', sans-serif;
          font-size: 0.9rem;
          font-weight: 500;
          cursor: pointer;
          margin-left: 0.5rem;
          transition: opacity 0.2s ease;
        }

        .toggle-mode button:hover {
          opacity: 0.8;
        }

        @media (max-width: 480px) {
          .login-container {
            padding: 1rem;
          }

          .login-card {
            padding: 2rem 1.5rem;
          }
        }
      `}</style>
    </div>
  );
};

export default LoginPage;
