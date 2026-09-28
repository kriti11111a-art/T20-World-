import React, { useState, useEffect } from 'react';
import { Bell, CheckCircle, ArrowLeft } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import Header from '../components/Header';
import Footer from '../components/Footer';
import { useAuth } from '../context/AuthContext';
import { useTheme } from '../context/ThemeContext';

const API_URL = process.env.REACT_APP_BACKEND_URL;

const Notifications = () => {
  const { token } = useAuth();
  const { isDark, colors } = useTheme();
  const navigate = useNavigate();
  
  const [notifications, setNotifications] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchNotifications();
  }, [token]);

  const fetchNotifications = async () => {
    if (!token) return;
    setLoading(true);
    try {
      const res = await fetch(`${API_URL}/api/notifications`, {
        headers: { 'Authorization': `Bearer ${token || localStorage.getItem('token')}` }
      });
      if (res.ok) {
        const data = await res.json();
        setNotifications(data);
      }
    } catch (error) {
      console.error('Error:', error);
    }
    setLoading(false);
  };

  const markAsRead = async (notificationId) => {
    try {
      await fetch(`${API_URL}/api/notifications/${notificationId}/read`, {
        method: 'POST',
        headers: { 'Authorization': `Bearer ${token || localStorage.getItem('token')}` }
      });
      setNotifications(prev => prev.map(n => 
        n.id === notificationId ? { ...n, is_read: true } : n
      ));
    } catch (error) {
      console.error('Error:', error);
    }
  };

  const markAllAsRead = async () => {
    try {
      await fetch(`${API_URL}/api/notifications/read-all`, {
        method: 'POST',
        headers: { 'Authorization': `Bearer ${token || localStorage.getItem('token')}` }
      });
      setNotifications(prev => prev.map(n => ({ ...n, is_read: true })));
    } catch (error) {
      console.error('Error:', error);
    }
  };

  const unreadCount = notifications.filter(n => !n.is_read).length;

  return (
    <div style={{ minHeight: '100vh', background: colors.background }}>
      <Header />
      
      <div style={{
        padding: '100px 16px 100px',
        maxWidth: '500px',
        margin: '0 auto',
      }}>
        {/* Back Button */}
        <button
          onClick={() => navigate(-1)}
          style={{
            display: 'flex',
            alignItems: 'center',
            gap: '8px',
            background: 'none',
            border: 'none',
            color: colors.accent,
            fontSize: '14px',
            fontWeight: 600,
            cursor: 'pointer',
            marginBottom: '20px',
            padding: 0,
          }}
        >
          <ArrowLeft size={18} />
          Back
        </button>

        {/* Header */}
        <div style={{
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center',
          marginBottom: '24px',
        }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
            <div style={{
              width: '48px',
              height: '48px',
              borderRadius: '14px',
              background: `${colors.accent}20`,
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
            }}>
              <Bell size={24} color={colors.accent} />
            </div>
            <div>
              <h1 style={{ fontSize: '22px', fontWeight: 700, color: colors.text, margin: 0 }}>
                Notifications
              </h1>
              {unreadCount > 0 && (
                <span style={{ fontSize: '13px', color: colors.accent }}>
                  {unreadCount} unread
                </span>
              )}
            </div>
          </div>
          
          {unreadCount > 0 && (
            <button
              onClick={markAllAsRead}
              style={{
                background: `${colors.accent}15`,
                border: `1px solid ${colors.accent}`,
                borderRadius: '8px',
                padding: '8px 12px',
                color: colors.accent,
                fontSize: '12px',
                fontWeight: 600,
                cursor: 'pointer',
              }}
            >
              Mark all read
            </button>
          )}
        </div>

        {/* Notifications List */}
        {loading ? (
          <div style={{
            textAlign: 'center',
            padding: '60px 20px',
            color: colors.textSecondary,
          }}>
            Loading...
          </div>
        ) : notifications.length === 0 ? (
          <div style={{
            textAlign: 'center',
            padding: '60px 20px',
            background: colors.cardBg,
            borderRadius: '16px',
            border: `1px solid ${colors.cardBorder}`,
          }}>
            <Bell size={48} color={colors.textSecondary} style={{ marginBottom: '16px' }} />
            <p style={{ color: colors.textSecondary, fontSize: '16px' }}>No notifications yet</p>
          </div>
        ) : (
          <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
            {notifications.map((notif) => (
              <div
                key={notif.id}
                onClick={() => !notif.is_read && markAsRead(notif.id)}
                style={{
                  padding: '18px',
                  background: notif.is_read ? colors.cardBg : `${colors.accent}10`,
                  borderRadius: '16px',
                  border: notif.is_read 
                    ? `1px solid ${colors.cardBorder}` 
                    : `2px solid ${colors.accent}`,
                  cursor: notif.is_read ? 'default' : 'pointer',
                }}
              >
                <div style={{ display: 'flex', gap: '14px' }}>
                  {/* Icon */}
                  <div style={{
                    width: '44px',
                    height: '44px',
                    borderRadius: '12px',
                    background: notif.type === 'promo' ? 'rgba(255, 105, 180, 0.15)' 
                      : notif.type === 'warning' ? 'rgba(245, 158, 11, 0.15)'
                      : notif.type === 'success' ? 'rgba(14, 203, 129, 0.15)'
                      : `${colors.accent}15`,
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    fontSize: '22px',
                    flexShrink: 0,
                  }}>
                    {notif.type === 'promo' ? '🎁' : notif.type === 'warning' ? '⚠️' : notif.type === 'success' ? '✅' : '📢'}
                  </div>
                  
                  {/* Content */}
                  <div style={{ flex: 1 }}>
                    <div style={{
                      display: 'flex',
                      justifyContent: 'space-between',
                      alignItems: 'flex-start',
                      marginBottom: '6px',
                    }}>
                      <span style={{
                        fontSize: '15px',
                        fontWeight: notif.is_read ? 500 : 700,
                        color: colors.text,
                      }}>
                        {notif.title}
                      </span>
                      {!notif.is_read && (
                        <span style={{
                          width: '10px',
                          height: '10px',
                          borderRadius: '50%',
                          background: colors.accent,
                          flexShrink: 0,
                          marginLeft: '8px',
                          marginTop: '4px',
                        }} />
                      )}
                    </div>
                    
                    <p style={{
                      fontSize: '14px',
                      color: colors.textSecondary,
                      lineHeight: '1.5',
                      margin: '0 0 10px 0',
                    }}>
                      {notif.message}
                    </p>
                    
                    <span style={{
                      fontSize: '12px',
                      color: colors.textMuted || colors.textSecondary,
                    }}>
                      {new Date(notif.created_at).toLocaleDateString('en-IN', {
                        day: '2-digit',
                        month: 'short',
                        year: 'numeric',
                        hour: '2-digit',
                        minute: '2-digit'
                      })}
                    </span>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
      
      <Footer />
    </div>
  );
};

export default Notifications;
