import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { ArrowLeft, Eye, EyeOff, Loader, Wallet, Zap } from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import { useTheme } from '../context/ThemeContext';
import toast from 'react-hot-toast';

const Login = () => {
  const navigate = useNavigate();
  const { login } = useAuth();
  const { isDark, colors } = useTheme();
  const [formData, setFormData] = useState({
    email: '',
    password: '',
  });
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError('');
    
    const result = await login(formData.email, formData.password);
    
    if (result.success) {
      toast.success('Welcome back! 🎉');
      // Use navigate instead of window.location to preserve state
      setTimeout(() => {
        navigate('/dashboard');
      }, 500);
    } else {
      setError(result.error);
      toast.error(result.error || 'Login failed');
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
    <div style={{...styles.page, background: colors.background}}>
      {/* Floating Glow Effect */}
      <div style={{...styles.glowOrb1, background: `radial-gradient(circle, ${colors.accent}20 0%, transparent 70%)`}}></div>
      <div style={{...styles.glowOrb2, background: `radial-gradient(circle, ${colors.accentSecondary}15 0%, transparent 70%)`}}></div>

      {/* Back to Home */}
      <Link to="/" style={{...styles.backLink, color: colors.accent}}>
        <ArrowLeft size={20} />
        <span>Back</span>
      </Link>

      <div style={styles.container}>
        <div style={{...styles.formCard, background: colors.cardBg, border: `1px solid ${colors.cardBorder}`}}>
          {/* Gradient Top Border */}
          <div style={{...styles.gradientBorder, background: colors.gradient}}></div>

          {/* Logo Icon - TG Coin with Animation */}
          <div style={styles.logoWrapper}>
            <div style={{
              ...styles.logoIcon, 
              background: 'transparent', 
              boxShadow: 'none', 
              padding: 0,
              position: 'relative'
            }}>
              {/* Animated Glow Ring */}
              <div style={{
                position: 'absolute',
                top: '50%',
                left: '50%',
                transform: 'translate(-50%, -50%)',
                width: '100px',
                height: '100px',
                borderRadius: '50%',
                border: '2px solid rgba(16, 185, 129, 0.5)',
                animation: 'pulseRing 2s ease-out infinite',
                boxShadow: '0 0 20px rgba(16, 185, 129, 0.3), inset 0 0 20px rgba(16, 185, 129, 0.1)'
              }}></div>
              {/* Second Ring */}
              <div style={{
                position: 'absolute',
                top: '50%',
                left: '50%',
                transform: 'translate(-50%, -50%)',
                width: '120px',
                height: '120px',
                borderRadius: '50%',
                border: '1px solid rgba(22, 224, 255, 0.3)',
                animation: 'pulseRing 2s ease-out infinite 0.5s'
              }}></div>
              {/* App Logo - Properly Rounded Container */}
              <div style={{
                width: '90px',
                height: '90px',
                borderRadius: '50%',
                overflow: 'hidden',
                position: 'relative',
                zIndex: 1,
                boxShadow: '0 0 25px rgba(22, 224, 255, 0.6), 0 0 50px rgba(8, 123, 255, 0.3)',
                border: '2px solid rgba(22, 224, 255, 0.5)',
                animation: 'floatCoin 3s ease-in-out infinite'
              }}>
                <img 
                  src="/app-logo.png" 
                  alt="TradeGo" 
                  style={{
                    width: '100%',
                    height: '100%',
                    objectFit: 'cover',
                    display: 'block'
                  }}
                />
              </div>
            </div>
          </div>
          
          {/* CSS Animations */}
          <style>{`
            @keyframes spinOnce {
              0% {
                transform: rotateY(0deg) scale(0.5);
                opacity: 0;
              }
              50% {
                opacity: 1;
              }
              100% {
                transform: rotateY(360deg) scale(1);
                opacity: 1;
              }
            }
            @keyframes pulseRing {
              0% {
                transform: translate(-50%, -50%) scale(0.8);
                opacity: 1;
              }
              100% {
                transform: translate(-50%, -50%) scale(1.5);
                opacity: 0;
              }
            }
            @keyframes floatCoin {
              0%, 100% {
                transform: translateY(0) rotateY(360deg);
              }
              50% {
                transform: translateY(-8px) rotateY(360deg);
              }
            }
          `}</style>

          {/* Welcome Text */}
          <h1 style={{...styles.title, color: colors.text}}>
            Welcome to <span style={{color: colors.accent}}>TradeGo</span>
          </h1>
          <p style={{...styles.subtitle, color: colors.textSecondary}}>Connect to your account</p>

          {/* Error Message */}
          {error && (
            <div style={styles.errorBox}>
              {error}
            </div>
          )}

          {/* Form */}
          <form onSubmit={handleSubmit} style={styles.form}>
            <div style={styles.inputGroup}>
              <label style={{...styles.label, color: colors.textSecondary}}>Email</label>
              <input
                type="email"
                name="email"
                value={formData.email}
                onChange={handleChange}
                placeholder="Enter your email"
                style={{...styles.input, background: colors.inputBg, border: `1px solid ${colors.inputBorder}`, color: colors.text}}
                required
                disabled={loading}
                data-testid="login-email-input"
              />
            </div>

            <div style={styles.inputGroup}>
              <label style={{...styles.label, color: colors.textSecondary}}>Password</label>
              <div style={styles.passwordWrapper}>
                <input
                  type={showPassword ? 'text' : 'password'}
                  name="password"
                  value={formData.password}
                  onChange={handleChange}
                  placeholder="Enter your password"
                  style={{...styles.input, background: colors.inputBg, border: `1px solid ${colors.inputBorder}`, color: colors.text}}
                  required
                  disabled={loading}
                  data-testid="login-password-input"
                />
                <button
                  type="button"
                  style={styles.eyeButton}
                  onClick={() => setShowPassword(!showPassword)}
                  data-testid="toggle-password-btn"
                >
                  {showPassword ? <EyeOff size={22} color={colors.textSecondary} /> : <Eye size={22} color={colors.textSecondary} />}
                </button>
              </div>
            </div>

            <button 
              type="submit" 
              style={{...styles.btnPrimary, background: colors.gradient, boxShadow: colors.glowGreen, opacity: loading ? 0.7 : 1}} 
              disabled={loading}
              data-testid="login-submit-btn"
            >
              {loading ? (
                <Loader size={20} style={{animation: 'spin 1s linear infinite'}} />
              ) : (
                <>
                  <Wallet size={20} />
                  CONNECT
                </>
              )}
            </button>
          </form>

          {/* Sign Up Link */}
          <p style={{...styles.signupText, color: colors.textSecondary}}>
            Don't have an account?{' '}
            <Link to="/register" style={{...styles.signupLink, color: colors.accent}}>
              Sign up
            </Link>
          </p>

          {/* Info Tag */}
          <div style={{...styles.infoTag, background: `${colors.accent}08`, border: `1px solid ${colors.accent}15`}}>
            <span style={{...styles.infoText, color: colors.textMuted}}>Powered by TradeGo</span>
          </div>
        </div>
      </div>
    </div>
  );
};

const styles = {
  page: {
    background: '#050505',
    minHeight: '100vh',
    display: 'flex',
    flexDirection: 'column',
    position: 'relative',
    overflow: 'hidden',
  },
  glowOrb1: {
    position: 'absolute',
    top: '-100px',
    right: '-100px',
    width: '300px',
    height: '300px',
    background: 'radial-gradient(circle, rgba(0, 255, 136, 0.15) 0%, transparent 70%)',
    borderRadius: '50%',
    pointerEvents: 'none',
  },
  glowOrb2: {
    position: 'absolute',
    bottom: '-150px',
    left: '-150px',
    width: '400px',
    height: '400px',
    background: 'radial-gradient(circle, rgba(0, 255, 255, 0.1) 0%, transparent 70%)',
    borderRadius: '50%',
    pointerEvents: 'none',
  },
  backLink: {
    color: '#00FF88',
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
    padding: '20px 16px 40px',
    position: 'relative',
    zIndex: 1,
  },
  formCard: {
    background: '#111111',
    border: '1px solid #222222',
    borderRadius: '24px',
    padding: '32px 24px',
    width: '100%',
    maxWidth: '380px',
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
    background: 'linear-gradient(90deg, #00FFFF 0%, #00FF88 100%)',
  },
  logoWrapper: {
    marginBottom: '20px',
  },
  logoIcon: {
    width: '80px',
    height: '80px',
    background: 'rgba(0, 255, 136, 0.1)',
    borderRadius: '20px',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    margin: '0 auto',
    boxShadow: '0 0 30px rgba(0, 255, 136, 0.3)',
  },
  title: {
    fontSize: '22px',
    fontWeight: 700,
    fontFamily: "'Outfit', sans-serif",
    color: '#FFFFFF',
    marginBottom: '8px',
  },
  titleAccent: {
    color: '#00FF88',
  },
  subtitle: {
    fontSize: '14px',
    color: 'rgba(255, 255, 255, 0.5)',
    marginBottom: '28px',
  },
  errorBox: {
    background: 'rgba(255, 59, 48, 0.1)',
    border: '1px solid rgba(255, 59, 48, 0.5)',
    borderRadius: '12px',
    padding: '12px',
    marginBottom: '20px',
    color: '#FF3B30',
    fontSize: '13px',
    textAlign: 'center',
  },
  form: {
    display: 'flex',
    flexDirection: 'column',
    gap: '20px',
  },
  inputGroup: {
    textAlign: 'left',
  },
  label: {
    fontSize: '13px',
    color: 'rgba(255, 255, 255, 0.6)',
    fontWeight: 500,
    marginBottom: '8px',
    display: 'block',
    letterSpacing: '0.5px',
  },
  input: {
    width: '100%',
    background: 'rgba(0, 0, 0, 0.5)',
    border: '1px solid #333333',
    borderRadius: '12px',
    padding: '14px 16px',
    fontSize: '15px',
    color: '#FFFFFF',
    outline: 'none',
    boxSizing: 'border-box',
    transition: 'all 0.3s ease',
  },
  passwordWrapper: {
    position: 'relative',
  },
  eyeButton: {
    position: 'absolute',
    right: '14px',
    top: '50%',
    transform: 'translateY(-50%)',
    background: 'none',
    border: 'none',
    cursor: 'pointer',
    padding: '4px',
  },
  btnPrimary: {
    background: 'linear-gradient(90deg, #00FFFF 0%, #00FF88 100%)',
    color: '#000000',
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
    boxShadow: '0 0 20px rgba(0, 255, 136, 0.4)',
    transition: 'all 0.3s ease',
  },
  signupText: {
    fontSize: '14px',
    color: 'rgba(255, 255, 255, 0.5)',
    marginTop: '24px',
    marginBottom: '0',
  },
  signupLink: {
    color: '#00FF88',
    textDecoration: 'none',
    fontWeight: 600,
  },
  infoTag: {
    marginTop: '24px',
    padding: '10px',
    background: 'rgba(0, 255, 136, 0.05)',
    borderRadius: '8px',
    border: '1px solid rgba(0, 255, 136, 0.1)',
  },
  infoText: {
    fontSize: '12px',
    color: 'rgba(255, 255, 255, 0.4)',
  },
};

export default Login;
