import React, { useState } from 'react';
import { Link, useNavigate, useSearchParams } from 'react-router-dom';
import { Mail, Lock, User, ArrowRight, Loader, ArrowLeft, Gift, Zap, UserPlus } from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import toast from 'react-hot-toast';

const Register = () => {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const { register } = useAuth();
  const [formData, setFormData] = useState({
    username: '',
    email: '',
    password: '',
    confirmPassword: '',
    referralCode: searchParams.get('ref') || '',
  });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    
    if (formData.password !== formData.confirmPassword) {
      setError('Passwords do not match!');
      toast.error('Passwords do not match!');
      return;
    }
    
    if (formData.password.length < 6) {
      setError('Password must be at least 6 characters');
      toast.error('Password must be at least 6 characters');
      return;
    }
    
    setLoading(true);
    const result = await register(
      formData.email,
      formData.password,
      formData.username,
      formData.referralCode || null
    );
    
    if (result.success) {
      toast.success('🎉 Account created successfully! Welcome to Trade Genius!', {
        duration: 5000,
      });
      // Use navigate instead of window.location to preserve state
      setTimeout(() => {
        navigate('/dashboard?welcome=true');
      }, 500);
    } else {
      setError(result.error);
      toast.error(result.error || 'Registration failed');
    }
    setLoading(false);
  };

  const handleChange = (e) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value,
    });
    setError('');
  };

  return (
    <div style={styles.page} className="bg-bitnest">
      {/* Floating Glow Effects */}
      <div style={styles.glowOrb1}></div>
      <div style={styles.glowOrb2}></div>

      {/* Back to Home */}
      <Link to="/" style={styles.backLink}>
        <ArrowLeft size={20} />
        <span>Back</span>
      </Link>

      <div style={styles.container}>
        <div style={styles.formCard}>
          {/* Gradient Top Border */}
          <div style={styles.gradientBorder}></div>

          {/* Logo Icon */}
          <div style={styles.logoWrapper}>
            <div style={styles.logoIcon}>
              <UserPlus size={36} color="#00FFFF" />
            </div>
          </div>

          {/* Header */}
          <h1 style={styles.title}>
            Join <span style={styles.titleAccent}>Trade Genius</span>
          </h1>
          <p style={styles.subtitle}>Create account and start earning</p>

          {/* Error Message */}
          {error && (
            <div style={styles.errorBox}>
              {error}
            </div>
          )}

          {/* Form */}
          <form onSubmit={handleSubmit} style={styles.form}>
            <div style={styles.inputGroup}>
              <label style={styles.label}>
                <User size={16} />
                Username
              </label>
              <input
                type="text"
                name="username"
                value={formData.username}
                onChange={handleChange}
                placeholder="Choose a username"
                style={styles.input}
                required
                disabled={loading}
                data-testid="register-username-input"
              />
            </div>

            <div style={styles.inputGroup}>
              <label style={styles.label}>
                <Mail size={16} />
                Email
              </label>
              <input
                type="email"
                name="email"
                value={formData.email}
                onChange={handleChange}
                placeholder="Enter your email"
                style={styles.input}
                required
                disabled={loading}
                data-testid="register-email-input"
              />
            </div>

            <div style={styles.inputGroup}>
              <label style={styles.label}>
                <Lock size={16} />
                Password
              </label>
              <input
                type="password"
                name="password"
                value={formData.password}
                onChange={handleChange}
                placeholder="Create a password"
                style={styles.input}
                required
                disabled={loading}
                data-testid="register-password-input"
              />
            </div>

            <div style={styles.inputGroup}>
              <label style={styles.label}>
                <Lock size={16} />
                Confirm Password
              </label>
              <input
                type="password"
                name="confirmPassword"
                value={formData.confirmPassword}
                onChange={handleChange}
                placeholder="Confirm your password"
                style={styles.input}
                required
                disabled={loading}
                data-testid="register-confirm-password-input"
              />
            </div>

            <div style={styles.inputGroup}>
              <label style={styles.label}>
                <Gift size={16} />
                Referral Code (Optional)
              </label>
              <input
                type="text"
                name="referralCode"
                value={formData.referralCode}
                onChange={handleChange}
                placeholder="Enter referral code"
                style={styles.input}
                disabled={loading}
                data-testid="register-referral-input"
              />
            </div>

            <button 
              type="submit" 
              style={{...styles.btnPrimary, opacity: loading ? 0.7 : 1}} 
              disabled={loading}
              data-testid="register-submit-btn"
            >
              {loading ? (
                <Loader size={20} style={{animation: 'spin 1s linear infinite'}} />
              ) : (
                <>
                  CREATE ACCOUNT
                  <ArrowRight size={18} />
                </>
              )}
            </button>
          </form>

          {/* Login Link */}
          <p style={styles.loginText}>
            Already have an account?{' '}
            <Link to="/login" style={styles.loginLink}>
              Sign in
            </Link>
          </p>

          {/* Benefits Tag */}
          <div style={styles.benefitsBox}>
            <div style={styles.benefitItem}>
              <Zap size={14} color="#00FF88" />
              <span>Up to 7% Daily ROI</span>
            </div>
            <div style={styles.benefitItem}>
              <Gift size={14} color="#00FFFF" />
              <span>5-Level Referral</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

const styles = {
  page: {
    background: 'linear-gradient(135deg, #F8FAFC 0%, #E2E8F0 100%)',
    minHeight: '100vh',
    display: 'flex',
    flexDirection: 'column',
    position: 'relative',
    overflow: 'hidden',
  },
  glowOrb1: {
    position: 'absolute',
    top: '-100px',
    left: '-100px',
    width: '300px',
    height: '300px',
    background: 'radial-gradient(circle, rgba(0, 200, 150, 0.2) 0%, transparent 70%)',
    borderRadius: '50%',
    pointerEvents: 'none',
  },
  glowOrb2: {
    position: 'absolute',
    bottom: '-150px',
    right: '-150px',
    width: '400px',
    height: '400px',
    background: 'radial-gradient(circle, rgba(0, 180, 120, 0.15) 0%, transparent 70%)',
    borderRadius: '50%',
    pointerEvents: 'none',
  },
  backLink: {
    color: '#0D9488',
    textDecoration: 'none',
    fontSize: '15px',
    display: 'flex',
    alignItems: 'center',
    gap: '8px',
    fontWeight: 500,
    padding: '20px 18px',
    position: 'relative',
    zIndex: 10,
  },
  container: {
    flex: 1,
    display: 'flex',
    justifyContent: 'center',
    alignItems: 'center',
    padding: '0 16px 40px',
    position: 'relative',
    zIndex: 1,
  },
  formCard: {
    background: '#FFFFFF',
    border: '1px solid #E2E8F0',
    borderRadius: '24px',
    padding: '32px 24px',
    boxShadow: '0 10px 40px rgba(0, 0, 0, 0.1)',
    width: '100%',
    maxWidth: '400px',
    boxSizing: 'border-box',
    textAlign: 'center',
    position: 'relative',
    overflow: 'hidden',
  },
  gradientBorder: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    height: '4px',
    background: 'linear-gradient(90deg, #10B981 0%, #0D9488 100%)',
  },
  logoWrapper: {
    marginBottom: '20px',
  },
  logoIcon: {
    width: '80px',
    height: '80px',
    background: 'rgba(16, 185, 129, 0.1)',
    borderRadius: '20px',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    margin: '0 auto',
    boxShadow: '0 0 30px rgba(16, 185, 129, 0.2)',
  },
  title: {
    fontSize: '22px',
    fontWeight: 700,
    fontFamily: "'Outfit', sans-serif",
    color: '#1E293B',
    marginBottom: '8px',
  },
  titleAccent: {
    color: '#10B981',
  },
  subtitle: {
    fontSize: '14px',
    color: '#64748B',
    marginBottom: '24px',
  },
  errorBox: {
    background: 'rgba(239, 68, 68, 0.1)',
    border: '1px solid rgba(239, 68, 68, 0.5)',
    borderRadius: '12px',
    padding: '12px',
    marginBottom: '20px',
    color: '#EF4444',
    fontSize: '13px',
    textAlign: 'center',
  },
  form: {
    display: 'flex',
    flexDirection: 'column',
    gap: '16px',
  },
  inputGroup: {
    textAlign: 'left',
  },
  label: {
    fontSize: '13px',
    color: '#475569',
    fontWeight: 500,
    marginBottom: '8px',
    display: 'flex',
    alignItems: 'center',
    gap: '6px',
    letterSpacing: '0.5px',
  },
  input: {
    width: '100%',
    background: '#F8FAFC',
    border: '2px solid #0D9488',
    borderRadius: '12px',
    padding: '14px 16px',
    fontSize: '15px',
    color: '#1E293B',
    outline: 'none',
    boxSizing: 'border-box',
    transition: 'all 0.3s ease',
  },
  btnPrimary: {
    background: 'linear-gradient(90deg, #10B981 0%, #0D9488 100%)',
    color: '#FFFFFF',
    border: 'none',
    borderRadius: '12px',
    padding: '16px',
    fontSize: '15px',
    fontWeight: 700,
    cursor: 'pointer',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    gap: '10px',
    marginTop: '8px',
    boxShadow: '0 4px 15px rgba(16, 185, 129, 0.3)',
    transition: 'all 0.3s ease',
  },
  loginText: {
    fontSize: '14px',
    color: '#64748B',
    marginTop: '20px',
    marginBottom: '0',
  },
  loginLink: {
    color: '#10B981',
    textDecoration: 'none',
    fontWeight: 600,
  },
  benefitsBox: {
    marginTop: '24px',
    padding: '14px',
    background: 'rgba(16, 185, 129, 0.08)',
    borderRadius: '12px',
    border: '1px solid rgba(16, 185, 129, 0.2)',
    display: 'flex',
    justifyContent: 'center',
    gap: '24px',
  },
  benefitItem: {
    display: 'flex',
    alignItems: 'center',
    gap: '6px',
    fontSize: '12px',
    color: '#475569',
  },
};

export default Register;
