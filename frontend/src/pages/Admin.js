import React, { useState, useEffect, useRef } from 'react';
import { useAuth } from '../context/AuthContext';
import { useNavigate } from 'react-router-dom';
import { 
  LayoutDashboard, Users, DollarSign, Download, Upload, 
  TrendingUp, Gift, Key, Wallet, Settings, Menu, X,
  RefreshCw, Search, ChevronRight, LogIn, ArrowLeft,
  Edit, Check, AlertCircle, Plus, Minus, History, Bell, Send, Trash2
} from 'lucide-react';
import toast from 'react-hot-toast';
import tokenManager from '../utils/tokenManager';

const API_URL = process.env.REACT_APP_BACKEND_URL;

const Admin = () => {
  const { user, token, isAuthenticated } = useAuth();
  const navigate = useNavigate();
  const [activeTab, setActiveTab] = useState('dashboard');
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [loading, setLoading] = useState(true);
  const [stats, setStats] = useState({
    totalUsers: 0, totalInvested: 0, totalWithdrawals: 0,
    totalDeposits: 0, pendingWithdrawals: 0, activeInvestments: 0
  });
  const [users, setUsers] = useState([]);
  const [deposits, setDeposits] = useState([]);
  const [withdrawals, setWithdrawals] = useState([]);
  const [investments, setInvestments] = useState([]);
  const [fundAdjustments, setFundAdjustments] = useState([]);
  const [bonusHistory, setBonusHistory] = useState([]);
  const [searchTerm, setSearchTerm] = useState('');
  
  // Helper to get valid token - uses tokenManager
  const getAuthToken = () => {
    const currentToken = tokenManager.get();
    if (!currentToken) {
      toast.error('Session expired. Please login again.');
      navigate('/login');
      return null;
    }
    return currentToken;
  };
  
  // Cache ref to prevent unnecessary re-fetches
  const lastFetchTime = useRef(0);
  const isFetching = useRef(false);
  
  // User Details State
  const [selectedUser, setSelectedUser] = useState(null);
  const [userDetails, setUserDetails] = useState(null);
  const [showUserModal, setShowUserModal] = useState(false);
  
  // Form States
  const [newWalletAddress, setNewWalletAddress] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [adjustAmount, setAdjustAmount] = useState('');
  const [adjustReason, setAdjustReason] = useState('');
  const [adjustAction, setAdjustAction] = useState('add');
  const [adjustType, setAdjustType] = useState('balance');
  const [bonusAmount, setBonusAmount] = useState('');
  const [bonusReason, setBonusReason] = useState('');
  const [selectedUserId, setSelectedUserId] = useState('');
  const [createInvUserId, setCreateInvUserId] = useState('');
  const [createInvAmount, setCreateInvAmount] = useState('');
  const [createInvPlanId, setCreateInvPlanId] = useState('1');
  
  // Announcement State
  const [announcements, setAnnouncements] = useState([]);
  const [announcementTitle, setAnnouncementTitle] = useState('');
  const [announcementMessage, setAnnouncementMessage] = useState('');
  const [announcementType, setAnnouncementType] = useState('info');
  const [sendingAnnouncement, setSendingAnnouncement] = useState(false);
  
  // Platform Settings State
  const [platformSettings, setPlatformSettings] = useState({
    deposit_wallet_address: '',
    withdrawal_wallet_address: '',
    deposit_wallet_network: 'TRC20',
    withdrawal_wallet_network: 'TRC20',
    min_deposit: 1,
    min_withdrawal: 10,
    withdrawal_fee_percent: 5
  });
  const [settingsLoading, setSettingsLoading] = useState(false);
  
  // Admin's own wallet state
  const [adminWallet, setAdminWallet] = useState('');
  const [adminWalletLoading, setAdminWalletLoading] = useState(false);

  const menuItems = [
    { id: 'dashboard', label: 'Dashboard', icon: LayoutDashboard },
    { id: 'announcements', label: 'Announcements', icon: Bell },
    { id: 'dailyroi', label: 'Daily ROI', icon: RefreshCw },
    { id: 'users', label: 'Users', icon: Users },
    { id: 'adjustfunds', label: 'Adjust Funds', icon: DollarSign },
    { id: 'createinvestment', label: 'Create Investment', icon: TrendingUp },
    { id: 'deposits', label: 'Deposits', icon: Download },
    { id: 'withdrawals', label: 'Withdrawals', icon: Upload },
    { id: 'investments', label: 'Investments', icon: TrendingUp },
    { id: 'givebonus', label: 'Give Bonus', icon: Gift },
    { id: 'resetpassword', label: 'Reset Password', icon: Key },
    { id: 'updatewallet', label: 'Update Wallet', icon: Wallet },
    { id: 'settings', label: 'Settings', icon: Settings },
  ];

  // Fetch announcements
  const fetchAnnouncements = async () => {
    const authToken = tokenManager.get();
    if (!authToken) return;
    
    try {
      const res = await fetch(`${API_URL}/api/admin/announcements`, {
        headers: { 'Authorization': `Bearer ${authToken}` }
      });
      if (res.ok) {
        const data = await res.json();
        setAnnouncements(data);
      }
    } catch (error) {
      console.error('Error fetching announcements:', error);
    }
  };

  // Send announcement
  const handleSendAnnouncement = async () => {
    if (!announcementTitle.trim() || !announcementMessage.trim()) {
      toast.error('Please fill title and message');
      return;
    }
    
    const authToken = tokenManager.get();
    if (!authToken) return;
    
    setSendingAnnouncement(true);
    try {
      const res = await fetch(`${API_URL}/api/admin/announcements`, {
        method: 'POST',
        headers: { 
          'Authorization': `Bearer ${authToken}`,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          title: announcementTitle,
          message: announcementMessage,
          type: announcementType
        })
      });
      
      if (res.ok) {
        const data = await res.json();
        toast.success(`✅ Announcement sent to ${data.users_notified} users!`);
        setAnnouncementTitle('');
        setAnnouncementMessage('');
        fetchAnnouncements();
      } else {
        toast.error('Failed to send announcement');
      }
    } catch (error) {
      toast.error('Error sending announcement');
    }
    setSendingAnnouncement(false);
  };

  // Delete announcement
  const handleDeleteAnnouncement = async (announcementId) => {
    const authToken = tokenManager.get();
    if (!authToken) return;
    
    try {
      const res = await fetch(`${API_URL}/api/admin/announcements/${announcementId}`, {
        method: 'DELETE',
        headers: { 'Authorization': `Bearer ${authToken}` }
      });
      if (res.ok) {
        toast.success('Announcement deleted');
        fetchAnnouncements();
      }
    } catch (error) {
      toast.error('Error deleting announcement');
    }
  };

  // INSTANT LOAD on mount - no waiting for token state
  useEffect(() => {
    const authToken = tokenManager.get();
    if (authToken) {
      fetchAdminData();
      fetchAnnouncements();
    }
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  // Fetch settings when settings tab is selected
  useEffect(() => {
    if (activeTab === 'settings') {
      const authToken = tokenManager.get();
      if (authToken) {
        fetchPlatformSettings();
      }
    }
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [activeTab]);

  const fetchAdminData = async () => {
    const authToken = tokenManager.get();
    if (!authToken) return;
    
    // Prevent concurrent fetches
    if (isFetching.current) return;
    isFetching.current = true;
    
    // Show loading only on first load
    if (users.length === 0 && stats.totalUsers === 0) {
      setLoading(true);
    }
    
    try {
      const fetchOptions = { 
        headers: { 'Authorization': `Bearer ${authToken}` }
      };
      
      // Fetch ALL data in parallel - no timeout, instant response
      const [statsRes, usersRes, depositsRes, withdrawalsRes, investmentsRes, adjustmentsRes, bonusRes] = 
        await Promise.allSettled([
          fetch(`${API_URL}/api/admin/stats`, fetchOptions),
          fetch(`${API_URL}/api/admin/users`, fetchOptions),
          fetch(`${API_URL}/api/admin/deposits`, fetchOptions),
          fetch(`${API_URL}/api/admin/withdrawals`, fetchOptions),
          fetch(`${API_URL}/api/admin/investments`, fetchOptions),
          fetch(`${API_URL}/api/admin/fund-adjustments`, fetchOptions),
          fetch(`${API_URL}/api/admin/bonus-history`, fetchOptions)
        ]);
      
      // Process results immediately as they arrive
      if (statsRes.status === 'fulfilled' && statsRes.value.ok) {
        setStats(await statsRes.value.json());
      }
      if (usersRes.status === 'fulfilled' && usersRes.value.ok) {
        setUsers(await usersRes.value.json());
      }
      if (depositsRes.status === 'fulfilled' && depositsRes.value.ok) {
        setDeposits(await depositsRes.value.json());
      }
      if (withdrawalsRes.status === 'fulfilled' && withdrawalsRes.value.ok) {
        setWithdrawals(await withdrawalsRes.value.json());
      }
      if (investmentsRes.status === 'fulfilled' && investmentsRes.value.ok) {
        setInvestments(await investmentsRes.value.json());
      }
      if (adjustmentsRes.status === 'fulfilled' && adjustmentsRes.value.ok) {
        setFundAdjustments(await adjustmentsRes.value.json());
      }
      if (bonusRes.status === 'fulfilled' && bonusRes.value.ok) {
        setBonusHistory(await bonusRes.value.json());
      }
      
      lastFetchTime.current = Date.now();
    } catch (error) {
      console.error('Fetch error:', error);
    } finally {
      setLoading(false);
      isFetching.current = false;
    }
  };

  const fetchUserDetails = async (userId) => {
    const authToken = tokenManager.get();
    if (!authToken) return;
    
    try {
      const res = await fetch(`${API_URL}/api/admin/user/${userId}`, {
        headers: { 'Authorization': `Bearer ${authToken}` }
      });
      if (res.ok) {
        const data = await res.json();
        setUserDetails(data);
        setShowUserModal(true);
      }
    } catch (error) {
      toast.error('Error fetching user details');
    }
  };

  const handleUpdateWalletOld = async () => {
    if (!selectedUserId || !newWalletAddress) {
      toast.error('Please select user and enter wallet address');
      return;
    }
    
    const authToken = tokenManager.get();
    if (!authToken) return;
    
    try {
      const res = await fetch(`${API_URL}/api/admin/update-wallet`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json', 'Authorization': `Bearer ${authToken}` },
        body: JSON.stringify({ user_id: selectedUserId, wallet_address: newWalletAddress })
      });
      if (res.ok) {
        toast.success('Wallet address updated!');
        setNewWalletAddress('');
        fetchAdminData();
      } else {
        const err = await res.json();
        toast.error(err.detail || 'Failed to update');
      }
    } catch (error) {
      toast.error('Error updating wallet');
    }
  };

  const handleResetPasswordOld = async () => {
    if (!selectedUserId || !newPassword) {
      toast.error('Please select user and enter new password');
      return;
    }
    if (newPassword.length < 6) {
      toast.error('Password must be at least 6 characters');
      return;
    }
    try {
      const res = await fetch(`${API_URL}/api/admin/reset-password`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json', 'Authorization': `Bearer ${tokenManager.get()}` },
        body: JSON.stringify({ user_id: selectedUserId, new_password: newPassword })
      });
      if (res.ok) {
        toast.success('Password reset successfully!');
        setNewPassword('');
        setSelectedUserId('');
      } else {
        const err = await res.json();
        toast.error(err.detail || 'Failed to reset');
      }
    } catch (error) {
      toast.error('Error resetting password');
    }
  };

  // Handle Update Wallet Address (inline)
  const handleUpdateWallet = async (userId, walletAddress) => {
    if (!walletAddress) {
      toast.error('Please enter wallet address');
      return;
    }
    try {
      const res = await fetch(`${API_URL}/api/admin/users/${userId}/update-wallet`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json', 'Authorization': `Bearer ${tokenManager.get()}` },
        body: JSON.stringify({ wallet_address: walletAddress })
      });
      if (res.ok) {
        toast.success('Wallet address updated!');
        fetchAdminData();
      } else {
        const err = await res.json();
        toast.error(err.detail || 'Failed to update wallet');
      }
    } catch (error) {
      toast.error('Error updating wallet');
    }
  };

  // Handle Change Password (inline)
  const handleChangePassword = async (userId, password) => {
    if (!password || password.length < 6) {
      toast.error('Password must be at least 6 characters');
      return;
    }
    try {
      const res = await fetch(`${API_URL}/api/admin/users/${userId}/reset-password`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json', 'Authorization': `Bearer ${tokenManager.get()}` },
        body: JSON.stringify({ new_password: password })
      });
      if (res.ok) {
        toast.success('Password changed successfully!');
        setEditPassword('');
      } else {
        const err = await res.json();
        toast.error(err.detail || 'Failed to change password');
      }
    } catch (error) {
      toast.error('Error changing password');
    }
  };

  const handleAdjustFunds = async (action) => {
    if (!selectedUserId || !adjustAmount) {
      toast.error('Please select user and enter amount');
      return;
    }
    
    const loadingToast = toast.loading(`${action === 'add' ? 'Adding' : 'Deducting'} funds...`);
    
    // Get token from context or localStorage
    const currentToken = getAuthToken();
    if (!currentToken) {
      toast.dismiss(loadingToast);
      return;
    }
    
    try {
      // Use new API endpoints: add-funds or deduct-funds
      const endpoint = action === 'add' 
        ? `${API_URL}/api/admin/users/${selectedUserId}/add-funds`
        : `${API_URL}/api/admin/users/${selectedUserId}/deduct-funds`;
      
      const res = await fetch(endpoint, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json', 'Authorization': `Bearer ${currentToken}` },
        body: JSON.stringify({
          amount: parseFloat(adjustAmount),
          reason: adjustReason || 'Admin adjustment'
        })
      });
      const data = await res.json();
      
      toast.dismiss(loadingToast);
      
      if (res.ok) {
        // Big styled success toast
        toast.success(
          `✅ SUCCESS! ${action === 'add' ? 'Added' : 'Deducted'} $${adjustAmount}`, 
          {
            duration: 4000,
            style: {
              background: action === 'add' ? '#0ECB81' : '#E74C3C',
              color: '#fff',
              fontWeight: 'bold',
              padding: '16px 24px',
              borderRadius: '12px',
              fontSize: '16px',
            },
          }
        );
        setAdjustAmount('');
        setAdjustReason('');
        fetchAdminData();
      } else {
        toast.error(data.detail || 'Failed');
      }
    } catch (error) {
      toast.dismiss(loadingToast);
      toast.error('Error adjusting funds');
    }
  };

  // Handle Create Investment for User
  const handleCreateInvestment = async () => {
    if (!createInvUserId || !createInvAmount) {
      toast.error('Please select user and enter amount');
      return;
    }
    
    const loadingToast = toast.loading('Creating investment...');
    
    try {
      const res = await fetch(`${API_URL}/api/admin/create-investment`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json', 'Authorization': `Bearer ${tokenManager.get()}` },
        body: JSON.stringify({
          user_id: createInvUserId,
          plan_id: parseInt(createInvPlanId),
          amount: parseFloat(createInvAmount)
        })
      });
      
      toast.dismiss(loadingToast);
      
      if (res.ok) {
        // Big styled success toast
        toast.success(
          `✅ SUCCESS! Investment of $${createInvAmount} created!`, 
          {
            duration: 4000,
            style: {
              background: '#FFD700',
              color: '#000',
              fontWeight: 'bold',
              padding: '16px 24px',
              borderRadius: '12px',
              fontSize: '16px',
            },
          }
        );
        setCreateInvAmount('');
        setCreateInvUserId('');
        fetchAdminData();
      } else {
        const err = await res.json();
        toast.error(err.detail || 'Failed to create investment');
      }
    } catch (error) {
      toast.dismiss(loadingToast);
      toast.error('Error creating investment');
    }
  };

  const handleGiveBonus = async () => {
    if (!selectedUserId || !bonusAmount) {
      toast.error('Please select user and enter bonus amount');
      return;
    }
    
    const loadingToast = toast.loading('Giving bonus...');
    
    try {
      const res = await fetch(`${API_URL}/api/admin/give-bonus`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json', 'Authorization': `Bearer ${tokenManager.get()}` },
        body: JSON.stringify({
          user_id: selectedUserId,
          amount: parseFloat(bonusAmount),
          action: 'add',
          reason: bonusReason || 'Admin Bonus'
        })
      });
      
      toast.dismiss(loadingToast);
      
      if (res.ok) {
        // Big styled success toast
        toast.success(
          `🎁 SUCCESS! Bonus of $${bonusAmount} given!`, 
          {
            duration: 4000,
            style: {
              background: '#9B59B6',
              color: '#fff',
              fontWeight: 'bold',
              padding: '16px 24px',
              borderRadius: '12px',
              fontSize: '16px',
            },
          }
        );
        setBonusAmount('');
        setBonusReason('');
        fetchAdminData();
      } else {
        const err = await res.json();
        toast.error(err.detail || 'Failed');
      }
    } catch (error) {
      toast.dismiss(loadingToast);
      toast.error('Error giving bonus');
    }
  };

  const triggerDailyROI = async () => {
    const loadingToast = toast.loading('Triggering Daily ROI...');
    const res = await fetch(`${API_URL}/api/admin/trigger-roi-distribution`, {
      method: 'POST', headers: { 'Authorization': `Bearer ${tokenManager.get()}` }
    });
    toast.dismiss(loadingToast);
    if (res.ok) {
      toast.success('✅ Daily ROI triggered successfully!', {
        duration: 4000,
        style: {
          background: '#0ECB81',
          color: '#fff',
          fontWeight: 'bold',
          padding: '16px 24px',
          borderRadius: '12px',
        },
      });
    } else {
      toast.error('Failed to trigger ROI distribution');
    }
  };

  const triggerDailySalary = async () => {
    const res = await fetch(`${API_URL}/api/admin/trigger-salary`, {
      method: 'POST', headers: { 'Authorization': `Bearer ${tokenManager.get()}` }
    });
    if (res.ok) toast.success('Daily Salary triggered!');
  };

  const formatDate = (dateStr) => {
    if (!dateStr) return 'N/A';
    return new Date(dateStr).toLocaleDateString('en-IN', { day: '2-digit', month: 'short', year: 'numeric' });
  };

  // Fetch Platform Settings
  const fetchPlatformSettings = async () => {
    try {
      const res = await fetch(`${API_URL}/api/admin/settings`, {
        headers: { 'Authorization': `Bearer ${tokenManager.get()}` }
      });
      if (res.ok) {
        const data = await res.json();
        setPlatformSettings({
          deposit_wallet_address: data.deposit_wallet_address || '',
          withdrawal_wallet_address: data.withdrawal_wallet_address || '',
          deposit_wallet_network: data.deposit_wallet_network || 'TRC20',
          withdrawal_wallet_network: data.withdrawal_wallet_network || 'TRC20',
          min_deposit: data.min_deposit || 1,
          min_withdrawal: data.min_withdrawal || 10,
          withdrawal_fee_percent: data.withdrawal_fee_percent || 5
        });
      }
    } catch (error) {
      console.error('Error fetching settings:', error);
    }
  };

  // Save Platform Settings
  const savePlatformSettings = async () => {
    setSettingsLoading(true);
    try {
      const res = await fetch(`${API_URL}/api/admin/settings`, {
        method: 'POST',
        headers: { 
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${tokenManager.get()}` 
        },
        body: JSON.stringify(platformSettings)
      });
      
      if (res.ok) {
        toast.success('✅ Settings saved successfully!', {
          duration: 4000,
          style: {
            background: '#0ECB81',
            color: '#fff',
            fontWeight: 'bold',
            padding: '16px 24px',
            borderRadius: '12px',
          },
        });
      } else {
        const err = await res.json();
        toast.error(err.detail || 'Failed to save settings');
      }
    } catch (error) {
      toast.error('Error saving settings');
    } finally {
      setSettingsLoading(false);
    }
  };

  // Update Admin's own wallet address
  const updateAdminWallet = async () => {
    if (!adminWallet || adminWallet.trim() === '') {
      toast.error('Please enter wallet address');
      return;
    }
    
    setAdminWalletLoading(true);
    try {
      const res = await fetch(`${API_URL}/api/user/wallet`, {
        method: 'PUT',
        headers: { 
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${tokenManager.get()}` 
        },
        body: JSON.stringify({ wallet_address: adminWallet })
      });
      
      if (res.ok) {
        toast.success('✅ Admin wallet address updated!', {
          duration: 4000,
          style: {
            background: '#9B59B6',
            color: '#fff',
            fontWeight: 'bold',
            padding: '16px 24px',
            borderRadius: '12px',
          },
        });
      } else {
        const err = await res.json();
        toast.error(err.detail || 'Failed to update wallet');
      }
    } catch (error) {
      toast.error('Error updating admin wallet');
    } finally {
      setAdminWalletLoading(false);
    }
  };

  // User Search State for dropdown
  const [userSearchTerm, setUserSearchTerm] = useState('');
  
  // Filter users based on search (used for both user list and dropdown)
  const filteredUsers = users.filter(u => {
    const generalSearch = searchTerm.toLowerCase();
    const dropdownSearch = userSearchTerm.toLowerCase();
    
    // If general search is active, use it
    if (generalSearch) {
      return (
        (u.username && u.username.toLowerCase().includes(generalSearch)) ||
        (u.email && u.email.toLowerCase().includes(generalSearch))
      );
    }
    // If dropdown search is active, use it
    if (dropdownSearch) {
      return (
        (u.username && u.username.toLowerCase().includes(dropdownSearch)) ||
        (u.email && u.email.toLowerCase().includes(dropdownSearch))
      );
    }
    return true;
  });

  const UserSelect = ({ value, onChange }) => (
    <div style={{display: 'flex', flexDirection: 'column', gap: '8px'}}>
      <input 
        type="text"
        placeholder="🔍 Search user by name or email..."
        value={userSearchTerm}
        onChange={(e) => setUserSearchTerm(e.target.value)}
        style={{
          ...styles.input,
          marginBottom: '4px',
          background: 'rgba(255,215,0,0.1)',
          border: '1px solid rgba(255,215,0,0.3)'
        }}
      />
      <select style={styles.select} value={value} onChange={(e) => onChange(e.target.value)}>
        <option value="">-- Select User ({filteredUsers.length} found) --</option>
        {filteredUsers.map(u => (
          <option key={u.id} value={u.id}>{u.username || u.email} ({u.email})</option>
        ))}
      </select>
    </div>
  );

  const renderDashboard = () => (
    <div style={styles.content}>
      <h2 style={styles.title}>Dashboard Overview</h2>
      {loading ? (
        <div style={{
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center',
          justifyContent: 'center',
          padding: '60px 20px',
          background: 'rgba(14, 203, 129, 0.05)',
          borderRadius: '16px',
          border: '2px solid rgba(14, 203, 129, 0.2)',
        }}>
          <div style={{
            width: '50px',
            height: '50px',
            border: '4px solid rgba(14, 203, 129, 0.2)',
            borderTop: '4px solid #0ECB81',
            borderRadius: '50%',
            animation: 'spin 1s linear infinite',
          }} />
          <span style={{color: '#0ECB81', marginTop: '20px', fontSize: '16px', fontWeight: 600}}>
            Loading Admin Data...
          </span>
          <span style={{color: '#888', marginTop: '8px', fontSize: '13px'}}>
            Please wait, fetching all data
          </span>
        </div>
      ) : (
        <div style={styles.statsGrid}>
          {[
            { icon: Users, value: stats.totalUsers, label: 'Total Users', color: '#9B59B6' },
            { icon: DollarSign, value: `$${stats.totalInvested?.toLocaleString() || 0}`, label: 'Total Invested', color: '#F1C40F' },
            { icon: Upload, value: `$${stats.totalWithdrawals?.toLocaleString() || 0}`, label: 'Total Withdrawal', color: '#E74C3C' },
            { icon: Download, value: stats.totalDeposits || 0, label: 'Deposits', color: '#3498DB' },
            { icon: Upload, value: stats.pendingWithdrawals || 0, label: 'Pending Withdrawals', color: '#E67E22' },
            { icon: TrendingUp, value: stats.activeInvestments || 0, label: 'Active Investments', color: '#0ECB81' },
          ].map((stat, i) => (
            <div key={i} style={{...styles.statCard, borderColor: stat.color}}>
              <stat.icon size={24} color={stat.color} />
              <span style={styles.statValue}>{stat.value}</span>
              <span style={styles.statLabel}>{stat.label}</span>
            </div>
          ))}
        </div>
      )}
    </div>
  );

  const renderDailyROI = () => (
    <div style={styles.content}>
      <h2 style={styles.title}>Daily ROI & Salary</h2>
      <div style={styles.actionCards}>
        <div style={styles.actionCard}>
          <RefreshCw size={40} color="#0ECB81" />
          <h3>Trigger Daily ROI</h3>
          <p>Distribute ROI to all active investments</p>
          <button style={styles.actionBtn} onClick={triggerDailyROI}>Run Daily ROI</button>
        </div>
        <div style={styles.actionCard}>
          <Gift size={40} color="#9B59B6" />
          <h3>Trigger Daily Salary</h3>
          <p>Distribute salary to eligible users</p>
          <button style={{...styles.actionBtn, background: '#9B59B6'}} onClick={triggerDailySalary}>Run Daily Salary</button>
        </div>
      </div>
    </div>
  );

  // State for editing user
  const [editingUser, setEditingUser] = useState(null);
  const [editWallet, setEditWallet] = useState('');
  const [editPassword, setEditPassword] = useState('');
  const [editUsername, setEditUsername] = useState('');
  const [editEmail, setEditEmail] = useState('');

  const renderUsers = () => (
    <div style={styles.content}>
      <h2 style={styles.title}>Users ({users.length})</h2>
      <div style={styles.searchBox}>
        <Search size={20} color="rgba(255,255,255,0.5)" />
        <input type="text" placeholder="Search..." value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)} style={styles.searchInput} />
      </div>
      <div style={styles.list}>
        {filteredUsers.map((u, i) => (
          <div key={i} style={{
            ...styles.userCard,
            flexDirection: 'column',
            alignItems: 'stretch',
            cursor: 'pointer'
          }}>
            {/* User Header - Click to expand */}
            <div 
              style={{display: 'flex', justifyContent: 'space-between', alignItems: 'center'}}
              onClick={() => {
                if (editingUser?.id === u.id) {
                  setEditingUser(null);
                } else {
                  setEditingUser(u);
                  setEditWallet(u.wallet_address || '');
                  setEditPassword('');
                  setEditUsername(u.username || '');
                  setEditEmail(u.email || '');
                }
              }}
            >
              <div style={styles.userInfo}>
                <span style={styles.userName}>{u.username || 'N/A'}</span>
                <span style={styles.userEmail}>{u.email}</span>
              </div>
              <div style={styles.userStats}>
                <span style={{color: '#0ECB81'}}>Balance: ${u.balance?.toFixed(2) || 0}</span>
                <span>Invested: ${u.total_invested?.toFixed(2) || 0}</span>
              </div>
              <ChevronRight size={20} color="rgba(255,255,255,0.3)" 
                style={{transform: editingUser?.id === u.id ? 'rotate(90deg)' : 'rotate(0deg)', transition: '0.3s'}} />
            </div>

            {/* Expanded Edit Section */}
            {editingUser?.id === u.id && (
              <div style={{
                marginTop: '16px',
                padding: '16px',
                background: 'rgba(0,0,0,0.3)',
                borderRadius: '12px',
                display: 'flex',
                flexDirection: 'column',
                gap: '12px'
              }}>
                {/* Wallet Address */}
                <div>
                  <label style={{color: '#888', fontSize: '12px', display: 'block', marginBottom: '6px'}}>
                    Wallet Address
                  </label>
                  <div style={{display: 'flex', gap: '8px'}}>
                    <input 
                      type="text" 
                      value={editWallet}
                      onChange={(e) => setEditWallet(e.target.value)}
                      placeholder="Enter wallet address"
                      style={{
                        flex: 1,
                        background: 'rgba(0,0,0,0.5)',
                        border: '1px solid rgba(255,215,0,0.3)',
                        borderRadius: '8px',
                        padding: '10px 12px',
                        color: '#fff',
                        fontSize: '13px'
                      }}
                    />
                    <button 
                      onClick={() => handleUpdateWallet(u.id, editWallet)}
                      style={{
                        background: '#FFD700',
                        color: '#000',
                        border: 'none',
                        borderRadius: '8px',
                        padding: '10px 16px',
                        fontWeight: 600,
                        cursor: 'pointer',
                        fontSize: '12px'
                      }}
                    >
                      Update
                    </button>
                  </div>
                </div>

                {/* Password */}
                <div>
                  <label style={{color: '#888', fontSize: '12px', display: 'block', marginBottom: '6px'}}>
                    Change Password
                  </label>
                  <div style={{display: 'flex', gap: '8px'}}>
                    <input 
                      type="text" 
                      value={editPassword}
                      onChange={(e) => setEditPassword(e.target.value)}
                      placeholder="Enter new password"
                      style={{
                        flex: 1,
                        background: 'rgba(0,0,0,0.5)',
                        border: '1px solid rgba(255,215,0,0.3)',
                        borderRadius: '8px',
                        padding: '10px 12px',
                        color: '#fff',
                        fontSize: '13px'
                      }}
                    />
                    <button 
                      onClick={() => handleChangePassword(u.id, editPassword)}
                      style={{
                        background: '#E67E22',
                        color: '#fff',
                        border: 'none',
                        borderRadius: '8px',
                        padding: '10px 16px',
                        fontWeight: 600,
                        cursor: 'pointer',
                        fontSize: '12px'
                      }}
                    >
                      Change
                    </button>
                  </div>
                </div>

                {/* Quick Actions */}
                <div style={{display: 'flex', gap: '8px', marginTop: '8px', flexWrap: 'wrap'}}>
                  <button 
                    onClick={() => {
                      setSelectedUserId(u.id);
                      setActiveTab('adjustfunds');
                    }}
                    style={{
                      flex: 1,
                      minWidth: '100px',
                      background: 'linear-gradient(135deg, #0ECB81 0%, #0A9F65 100%)',
                      color: '#fff',
                      border: 'none',
                      borderRadius: '8px',
                      padding: '10px',
                      fontWeight: 600,
                      cursor: 'pointer',
                      fontSize: '11px'
                    }}
                  >
                    💰 Adjust Funds
                  </button>
                  <button 
                    onClick={() => {
                      setSelectedUserId(u.id);
                      setActiveTab('givebonus');
                    }}
                    style={{
                      flex: 1,
                      minWidth: '100px',
                      background: 'linear-gradient(135deg, #9B59B6 0%, #8E44AD 100%)',
                      color: '#fff',
                      border: 'none',
                      borderRadius: '8px',
                      padding: '10px',
                      fontWeight: 600,
                      cursor: 'pointer',
                      fontSize: '11px'
                    }}
                  >
                    🎁 Give Bonus
                  </button>
                </div>
                
                {/* Login As & Block Actions */}
                <div style={{display: 'flex', gap: '8px', marginTop: '8px'}}>
                  <button 
                    onClick={async () => {
                      if (window.confirm(`Login as ${u.email}? You will be redirected to their dashboard.`)) {
                        try {
                          const token = localStorage.getItem('token');
                          const response = await fetch(`${API_URL}/api/admin/users/${u.id}/login-as`, {
                            method: 'POST',
                            headers: {
                              'Authorization': `Bearer ${tokenManager.get()}`,
                              'Content-Type': 'application/json'
                            }
                          });
                          const data = await response.json();
                          if (response.ok) {
                            // Save admin token to return later
                            localStorage.setItem('admin_token_backup', token);
                            // Set user token
                            localStorage.setItem('token', data.access_token);
                            localStorage.setItem('user', JSON.stringify(data.user));
                            window.location.href = '/dashboard';
                          } else {
                            alert(data.detail || 'Failed to login as user');
                          }
                        } catch (error) {
                          alert('Error: ' + error.message);
                        }
                      }
                    }}
                    style={{
                      flex: 1,
                      background: 'linear-gradient(135deg, #3498DB 0%, #2980B9 100%)',
                      color: '#fff',
                      border: 'none',
                      borderRadius: '8px',
                      padding: '10px',
                      fontWeight: 600,
                      cursor: 'pointer',
                      fontSize: '11px'
                    }}
                  >
                    🔑 Login as User
                  </button>
                  <button 
                    onClick={async () => {
                      const action = u.is_active !== false ? 'block' : 'unblock';
                      if (window.confirm(`${action === 'block' ? 'Block' : 'Unblock'} ${u.email}?`)) {
                        try {
                          const token = localStorage.getItem('token');
                          const response = await fetch(`${API_URL}/api/admin/users/${u.id}/${action}`, {
                            method: 'POST',
                            headers: {
                              'Authorization': `Bearer ${tokenManager.get()}`,
                              'Content-Type': 'application/json'
                            }
                          });
                          const data = await response.json();
                          if (response.ok) {
                            alert(data.message);
                            // Refresh users list
                            window.location.reload();
                          } else {
                            alert(data.detail || `Failed to ${action} user`);
                          }
                        } catch (error) {
                          alert('Error: ' + error.message);
                        }
                      }
                    }}
                    style={{
                      flex: 1,
                      background: u.is_active !== false 
                        ? 'linear-gradient(135deg, #E74C3C 0%, #C0392B 100%)' 
                        : 'linear-gradient(135deg, #27AE60 0%, #1E8449 100%)',
                      color: '#fff',
                      border: 'none',
                      borderRadius: '8px',
                      padding: '10px',
                      fontWeight: 600,
                      cursor: 'pointer',
                      fontSize: '11px'
                    }}
                  >
                    {u.is_active !== false ? '🚫 Block User' : '✅ Unblock User'}
                  </button>
                </div>
                
                {/* User Status Badge */}
                {u.is_active === false && (
                  <div style={{
                    marginTop: '8px',
                    padding: '8px 12px',
                    background: 'rgba(231, 76, 60, 0.2)',
                    border: '1px solid rgba(231, 76, 60, 0.5)',
                    borderRadius: '8px',
                    textAlign: 'center',
                    color: '#E74C3C',
                    fontSize: '12px',
                    fontWeight: 600
                  }}>
                    🚫 USER BLOCKED
                  </div>
                )}

                {/* User Stats */}
                <div style={{
                  marginTop: '8px',
                  padding: '12px',
                  background: 'rgba(255,215,0,0.1)',
                  borderRadius: '8px',
                  display: 'grid',
                  gridTemplateColumns: '1fr 1fr',
                  gap: '8px',
                  fontSize: '12px'
                }}>
                  <div><span style={{color: '#888'}}>Balance:</span> <span style={{color: '#0ECB81'}}>${u.balance?.toFixed(2) || 0}</span></div>
                  <div><span style={{color: '#888'}}>Invested:</span> <span style={{color: '#FFD700'}}>${u.total_invested?.toFixed(2) || 0}</span></div>
                  <div><span style={{color: '#888'}}>Earned:</span> <span style={{color: '#0ECB81'}}>${u.total_earned?.toFixed(2) || 0}</span></div>
                  <div><span style={{color: '#888'}}>Referrals:</span> <span style={{color: '#FFD700'}}>${u.referral_earnings?.toFixed(2) || 0}</span></div>
                </div>
              </div>
            )}
          </div>
        ))}
      </div>
    </div>
  );

  const renderAdjustFunds = () => (
    <div style={styles.content}>
      <h2 style={styles.title}>Adjust User Funds</h2>
      <div style={styles.formCard}>
        <h3 style={{color: '#FFD700', margin: '0 0 15px 0', fontSize: '16px', display: 'flex', alignItems: 'center', gap: '8px'}}>
          <DollarSign size={18} /> Fund Adjustment
        </h3>
        <label style={styles.label}>Search User</label>
        <input 
          type="text" 
          placeholder="Search by email or name..." 
          style={{...styles.input, marginBottom: '10px'}}
          onChange={(e) => {
            const term = e.target.value.toLowerCase();
            if (term.length > 0) {
              const filtered = users.filter(u => 
                u.email?.toLowerCase().includes(term) || 
                u.username?.toLowerCase().includes(term)
              );
              if (filtered.length > 0) {
                setSelectedUserId(filtered[0].id);
              }
            }
          }}
        />
        
        <label style={styles.label}>Select User</label>
        <UserSelect value={selectedUserId} onChange={setSelectedUserId} />
        
        <div style={{display: 'flex', gap: '10px', marginTop: '15px'}}>
          <div style={{flex: 1}}>
            <label style={styles.label}>Action</label>
            <div style={{display: 'flex', gap: '10px'}}>
              <button 
                id="addBtn"
                style={{...styles.btn, background: adjustAction === 'add' ? '#0ECB81' : '#333', flex: 1}} 
                onClick={() => setAdjustAction('add')}
              >
                <Plus size={16} /> Add (+)
              </button>
              <button 
                id="deductBtn"
                style={{...styles.btn, background: adjustAction === 'deduct' ? '#E74C3C' : '#333', flex: 1}} 
                onClick={() => setAdjustAction('deduct')}
              >
                <Minus size={16} /> Deduct (-)
              </button>
            </div>
          </div>
        </div>
        
        <div style={{display: 'flex', gap: '10px', marginTop: '15px'}}>
          <div style={{flex: 1}}>
            <label style={styles.label}>Adjust Type</label>
            <div style={{display: 'flex', gap: '10px'}}>
              <button 
                style={{...styles.btn, background: adjustType === 'balance' ? '#3498DB' : '#333', flex: 1}} 
                onClick={() => setAdjustType('balance')}
              >
                <Wallet size={16} /> Balance
              </button>
              <button 
                style={{...styles.btn, background: adjustType === 'deposit' ? '#9B59B6' : '#333', flex: 1}} 
                onClick={() => setAdjustType('deposit')}
              >
                <Download size={16} /> Deposit
              </button>
            </div>
          </div>
        </div>
        
        <label style={styles.label}>Amount ($)</label>
        <input type="number" placeholder="Enter amount" value={adjustAmount}
          onChange={(e) => setAdjustAmount(e.target.value)} style={styles.input} />
        
        <label style={styles.label}>Reason (Optional)</label>
        <input type="text" placeholder="Enter reason for adjustment..." value={adjustReason}
          onChange={(e) => setAdjustReason(e.target.value)} style={styles.input} />
        
        <button 
          style={{...styles.btn, background: adjustAction === 'add' ? '#0ECB81' : '#E74C3C', width: '100%', marginTop: '10px'}} 
          onClick={() => handleAdjustFunds(adjustAction)}
        >
          {adjustAction === 'add' ? <Plus size={18} /> : <Minus size={18} />}
          {adjustAction === 'add' ? `Add $${adjustAmount || '0.00'} to ${adjustType}` : `Deduct $${adjustAmount || '0.00'} from ${adjustType}`}
        </button>
      </div>
      
      {/* Adjustment History Section - FULL SCROLLABLE LIST */}
      <div style={{...styles.formCard, marginTop: '20px'}}>
        <h3 style={{color: '#0ECB81', margin: '0 0 15px 0', fontSize: '18px', display: 'flex', alignItems: 'center', gap: '8px'}}>
          <History size={20} /> 📜 Fund Adjustment History ({fundAdjustments.length} Total Records)
        </h3>
        <p style={{color: '#888', fontSize: '12px', marginBottom: '15px'}}>
          Showing all records from 24 Feb 2026 onwards • Scroll to see complete history
        </p>
        
        {fundAdjustments.length === 0 ? (
          <div style={{textAlign: 'center', padding: '40px', color: '#666', background: 'rgba(0,0,0,0.2)', borderRadius: '12px'}}>
            <DollarSign size={50} color="#444" style={{marginBottom: '15px'}} />
            <p style={{margin: 0, fontSize: '16px'}}>No adjustments yet</p>
            <p style={{margin: '8px 0 0 0', fontSize: '13px', color: '#555'}}>Make an adjustment to see history here</p>
          </div>
        ) : (
          <div style={{
            maxHeight: '600px', 
            overflowY: 'auto', 
            border: '1px solid rgba(14, 203, 129, 0.3)',
            borderRadius: '12px',
            padding: '10px'
          }}>
            {fundAdjustments.map((adj, i) => {
              const isAdd = adj.type === 'add_funds' || adj.action === 'add';
              return (
                <div key={adj.id || i} style={{
                  background: isAdd ? 'rgba(14, 203, 129, 0.08)' : 'rgba(231, 76, 60, 0.08)',
                  borderRadius: '10px',
                  padding: '14px',
                  marginBottom: '10px',
                  borderLeft: `4px solid ${isAdd ? '#0ECB81' : '#E74C3C'}`,
                  transition: 'transform 0.2s',
                }}>
                  {/* Header Row - Serial, User, Amount */}
                  <div style={{display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '10px'}}>
                    <div style={{display: 'flex', alignItems: 'center', gap: '10px', flex: 1}}>
                      <span style={{
                        background: isAdd ? '#0ECB81' : '#E74C3C',
                        color: '#fff',
                        padding: '4px 10px',
                        borderRadius: '20px',
                        fontSize: '11px',
                        fontWeight: 'bold'
                      }}>#{i + 1}</span>
                      <div style={{display: 'flex', flexDirection: 'column', gap: '2px'}}>
                        <span style={{color: '#FFD700', fontWeight: 'bold', fontSize: '14px'}}>
                          {adj.user_name || 'Unknown'}
                        </span>
                        <span style={{color: '#888', fontSize: '11px'}}>
                          {adj.user_email || 'No email'}
                        </span>
                      </div>
                    </div>
                    <span style={{
                      color: isAdd ? '#0ECB81' : '#E74C3C',
                      fontWeight: 'bold',
                      fontSize: '18px',
                      textShadow: isAdd ? '0 0 10px rgba(14,203,129,0.5)' : '0 0 10px rgba(231,76,60,0.5)'
                    }}>
                      {isAdd ? '+' : '-'}${adj.amount?.toFixed(2) || '0.00'}
                    </span>
                  </div>
                  
                  {/* Details Row */}
                  <div style={{fontSize: '12px', color: '#aaa', display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '8px'}}>
                    <div>
                      <span style={{color: '#666'}}>Balance Change:</span>
                      <span style={{color: '#fff', marginLeft: '5px'}}>
                        ${adj.old_balance?.toFixed(2) || '0.00'} → ${adj.new_balance?.toFixed(2) || '0.00'}
                      </span>
                    </div>
                    <div style={{textAlign: 'right'}}>
                      <span style={{color: '#666'}}>Date:</span>
                      <span style={{color: '#FFD700', marginLeft: '5px'}}>
                        {adj.created_at ? new Date(adj.created_at).toLocaleString('en-IN', {
                          day: '2-digit', month: 'short', year: 'numeric',
                          hour: '2-digit', minute: '2-digit'
                        }) : 'N/A'}
                      </span>
                    </div>
                  </div>
                  
                  {/* Reason & Admin */}
                  <div style={{marginTop: '8px', fontSize: '11px', color: '#888'}}>
                    {adj.reason && <div>📝 Reason: <span style={{color: '#bbb'}}>{adj.reason}</span></div>}
                    {adj.admin_email && <div>👤 By: <span style={{color: '#9B59B6'}}>{adj.admin_email}</span></div>}
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );

  const renderGiveBonus = () => (
    <div style={styles.content}>
      <h2 style={styles.title}>Give Bonus</h2>
      <div style={styles.formCard}>
        <label style={styles.label}>Select User</label>
        <UserSelect value={selectedUserId} onChange={setSelectedUserId} />
        
        <label style={styles.label}>Bonus Amount ($)</label>
        <input type="number" placeholder="Enter bonus amount" value={bonusAmount}
          onChange={(e) => setBonusAmount(e.target.value)} style={styles.input} />
        
        <label style={styles.label}>Reason</label>
        <input type="text" placeholder="Bonus reason" value={bonusReason}
          onChange={(e) => setBonusReason(e.target.value)} style={styles.input} />
        
        <button style={{...styles.btn, background: '#9B59B6', width: '100%'}} onClick={handleGiveBonus}>
          <Gift size={18} /> Give Bonus
        </button>
      </div>
    </div>
  );

  const renderResetPassword = () => (
    <div style={styles.content}>
      <h2 style={styles.title}>Reset Password</h2>
      <div style={styles.formCard}>
        <label style={styles.label}>Select User</label>
        <UserSelect value={selectedUserId} onChange={setSelectedUserId} />
        
        <label style={styles.label}>New Password</label>
        <input type="text" placeholder="Enter new password" value={newPassword}
          onChange={(e) => setNewPassword(e.target.value)} style={styles.input} />
        
        <button style={{...styles.btn, background: '#E67E22', width: '100%'}} onClick={handleResetPasswordOld}>
          <Key size={18} /> Reset Password
        </button>
      </div>
    </div>
  );

  const renderCreateInvestment = () => (
    <div style={styles.content}>
      <h2 style={styles.title}>Create Investment for User</h2>
      <div style={styles.formCard}>
        <label style={styles.label}>Select User</label>
        <UserSelect value={createInvUserId} onChange={setCreateInvUserId} />
        
        <label style={styles.label}>Select Trading SLAB</label>
        <select 
          value={createInvPlanId} 
          onChange={(e) => setCreateInvPlanId(e.target.value)}
          style={{...styles.input, cursor: 'pointer'}}
        >
          <option value="1">SLAB 1 - 5.5% Daily (Min $1)</option>
          <option value="2">SLAB 2 - 6% Daily (Min $20)</option>
          <option value="3">SLAB 3 - 6.5% Daily (Min $300)</option>
          <option value="4">SLAB 4 - 7% Daily (Min $1000)</option>
        </select>
        
        <label style={styles.label}>Investment Amount ($)</label>
        <input 
          type="number" 
          placeholder="Enter amount" 
          value={createInvAmount}
          onChange={(e) => setCreateInvAmount(e.target.value)} 
          style={styles.input} 
        />
        
        <button 
          style={{...styles.btn, background: 'linear-gradient(135deg, #0ECB81 0%, #0A9F65 100%)', width: '100%'}} 
          onClick={handleCreateInvestment}
        >
          <TrendingUp size={18} /> Create Investment
        </button>

        <p style={{color: '#888', fontSize: '12px', marginTop: '12px', textAlign: 'center'}}>
          ⚠️ This will create an active investment for the selected user without deducting from their balance.
        </p>
      </div>
    </div>
  );

  const renderUpdateWallet = () => (
    <div style={styles.content}>
      <h2 style={styles.title}>Update Wallet Address</h2>
      <div style={styles.formCard}>
        <label style={styles.label}>Select User</label>
        <UserSelect value={selectedUserId} onChange={setSelectedUserId} />
        
        <label style={styles.label}>New Wallet Address</label>
        <input type="text" placeholder="0x..." value={newWalletAddress}
          onChange={(e) => setNewWalletAddress(e.target.value)} style={styles.input} />
        
        <button style={{...styles.btn, background: '#3498DB', width: '100%'}} onClick={handleUpdateWalletOld}>
          <Wallet size={18} /> Update Wallet
        </button>
      </div>
    </div>
  );

  const renderDeposits = () => (
    <div style={styles.content}>
      <h2 style={styles.title}>Deposits ({deposits.length})</h2>
      <div style={styles.list}>
        {deposits.map((d, i) => (
          <div key={i} style={styles.txCard}>
            <div>
              <span style={styles.txUser}>{d.username || d.user_email}</span>
              <span style={styles.txDate}>{formatDate(d.created_at)}</span>
            </div>
            <span style={{...styles.txAmount, color: '#0ECB81'}}>+${d.amount?.toFixed(2)}</span>
          </div>
        ))}
      </div>
    </div>
  );

  // Handle withdrawal approval
  const handleApproveWithdrawal = async (withdrawalId) => {
    const loadingToast = toast.loading('Approving withdrawal...');
    try {
      const response = await fetch(`${API_URL}/api/admin/withdrawals/${withdrawalId}/approve`, {
        method: 'POST',
        headers: { 'Authorization': `Bearer ${tokenManager.get()}` }
      });
      toast.dismiss(loadingToast);
      if (response.ok) {
        toast.success('✅ Withdrawal APPROVED!', {
          duration: 4000,
          style: {
            background: '#0ECB81',
            color: '#fff',
            fontWeight: 'bold',
            padding: '16px 24px',
            borderRadius: '12px',
            fontSize: '16px',
          },
        });
        fetchAdminData();
      } else {
        const data = await response.json();
        toast.error(data.detail || 'Failed to approve');
      }
    } catch (error) {
      toast.dismiss(loadingToast);
      toast.error('Error approving withdrawal');
    }
  };

  // Handle withdrawal rejection
  const handleRejectWithdrawal = async (withdrawalId) => {
    const loadingToast = toast.loading('Rejecting withdrawal...');
    try {
      const response = await fetch(`${API_URL}/api/admin/withdrawals/${withdrawalId}/reject`, {
        method: 'POST',
        headers: { 'Authorization': `Bearer ${tokenManager.get()}` }
      });
      toast.dismiss(loadingToast);
      if (response.ok) {
        toast.success('❌ Withdrawal REJECTED & Amount Refunded!', {
          duration: 4000,
          style: {
            background: '#E74C3C',
            color: '#fff',
            fontWeight: 'bold',
            padding: '16px 24px',
            borderRadius: '12px',
            fontSize: '16px',
          },
        });
        fetchAdminData();
      } else {
        const data = await response.json();
        toast.error(data.detail || 'Failed to reject');
      }
    } catch (error) {
      toast.dismiss(loadingToast);
      toast.error('Error rejecting withdrawal');
    }
  };

  // Copy wallet address
  const copyWalletAddress = (address) => {
    navigator.clipboard.writeText(address);
    toast.success('Wallet address copied!');
  };

  // Calculate time elapsed since withdrawal request
  const getTimeElapsed = (createdAt) => {
    if (!createdAt) return 'N/A';
    const created = new Date(createdAt);
    const now = new Date();
    const diffMs = now - created;
    const diffMins = Math.floor(diffMs / 60000);
    const diffHours = Math.floor(diffMins / 60);
    const diffDays = Math.floor(diffHours / 24);
    
    if (diffDays > 0) {
      return `${diffDays}d ${diffHours % 24}h ago`;
    } else if (diffHours > 0) {
      return `${diffHours}h ${diffMins % 60}m ago`;
    } else {
      return `${diffMins}m ago`;
    }
  };

  // Get card styling based on user's fund history
  const getWithdrawalCardStyle = (w) => {
    // Simple logic: If ANY fund adjustment exists - RED (ALERT), otherwise GREEN (OK)
    const hasAdjustment = w.has_fund_adjustment;
    
    if (hasAdjustment) {
      // RED - User received fund adjustment (be careful)
      return {
        border: '3px solid #E74C3C',
        borderRadius: '16px',
        background: 'linear-gradient(145deg, rgba(231, 76, 60, 0.15) 0%, rgba(20,20,30,0.95) 100%)',
        boxShadow: '0 8px 30px rgba(231, 76, 60, 0.4), inset 0 1px 0 rgba(255,255,255,0.1)',
      };
    }
    
    // GREEN - Fresh deposit only (safe to approve)
    return {
      border: '3px solid #0ECB81',
      borderRadius: '16px',
      background: 'linear-gradient(145deg, rgba(14, 203, 129, 0.12) 0%, rgba(20,20,30,0.95) 100%)',
      boxShadow: '0 8px 30px rgba(14, 203, 129, 0.4), inset 0 1px 0 rgba(255,255,255,0.1)',
    };
  };

  // Get card type label
  const getCardTypeLabel = (w) => {
    // If user has ANY fund adjustment - show ALERT (even if they also have deposits)
    // If user has ONLY fresh deposits - show VERIFIED
    if (w.has_fund_adjustment) {
      return { text: 'ALERT', color: '#E74C3C', bg: 'rgba(231, 76, 60, 0.25)' };
    }
    return { text: 'VERIFIED', color: '#0ECB81', bg: 'rgba(14, 203, 129, 0.25)' };
  };

  const renderWithdrawals = () => (
    <div style={styles.content}>
      <h2 style={styles.title}>Withdrawals ({withdrawals.length})</h2>
      <div style={styles.list}>
        {withdrawals.length === 0 ? (
          <div style={{textAlign: 'center', color: '#888', padding: '20px'}}>No withdrawals found</div>
        ) : (
          withdrawals.map((w, i) => {
            const cardStyle = getWithdrawalCardStyle(w);
            const cardLabel = getCardTypeLabel(w);
            
            return (
            <div key={i} style={{
              ...styles.txCard,
              flexDirection: 'column',
              gap: '12px',
              padding: '20px',
              paddingTop: '25px',
              position: 'relative',
              ...cardStyle,
              marginBottom: '20px',
            }}>
              {/* Card Type Badge - Fund History Indicator */}
              <div style={{
                position: 'absolute',
                top: '8px',
                right: '10px',
                background: cardLabel.bg,
                border: `2px solid ${cardLabel.color}`,
                color: cardLabel.color,
                padding: '4px 12px',
                borderRadius: '6px',
                fontSize: '11px',
                fontWeight: 800,
                letterSpacing: '1px',
                boxShadow: '0 2px 8px rgba(0,0,0,0.3)',
                zIndex: 10,
              }}>
                {cardLabel.text}
              </div>

              {/* Timer Badge - Time Elapsed */}
              {w.status === 'pending' && (
                <div style={{
                  display: 'flex',
                  justifyContent: 'space-between',
                  alignItems: 'center',
                  background: 'rgba(241, 196, 15, 0.2)',
                  padding: '8px 12px',
                  borderRadius: '8px',
                  marginBottom: '4px',
                }}>
                  <span style={{color: '#F1C40F', fontSize: '12px', fontWeight: 600, display: 'flex', alignItems: 'center', gap: '6px'}}>
                    ⏱️ Waiting Time:
                  </span>
                  <span style={{
                    color: '#FF6B6B',
                    fontSize: '14px',
                    fontWeight: 700,
                    background: 'rgba(255, 107, 107, 0.2)',
                    padding: '4px 10px',
                    borderRadius: '6px',
                  }}>
                    {getTimeElapsed(w.created_at)}
                  </span>
                </div>
              )}

              {/* Serial Number Badge - Latest has highest number */}
              <div style={{
                position: 'absolute',
                top: '-10px',
                left: '15px',
                background: w.has_fund_adjustment 
                  ? 'linear-gradient(135deg, #E74C3C 0%, #C0392B 100%)' 
                  : 'linear-gradient(135deg, #0ECB81 0%, #00E5A0 100%)',
                color: '#000',
                padding: '6px 14px',
                borderRadius: '20px',
                fontSize: '12px',
                fontWeight: 800,
                boxShadow: '0 4px 12px rgba(0,0,0,0.3)',
              }}>
                #{withdrawals.length - i}
              </div>

              {/* Row 1: User Info & Amount */}
              <div style={{display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginTop: '10px'}}>
                <div style={{display: 'flex', flexDirection: 'column', gap: '4px'}}>
                  <span style={{color: '#FFD700', fontWeight: 700, fontSize: '16px'}}>
                    {w.username || 'Unknown User'}
                  </span>
                  <span style={{color: '#888', fontSize: '12px'}}>
                    {w.user_email || 'No email'}
                  </span>
                  <span style={{color: '#0ECB81', fontSize: '12px', marginTop: '4px', display: 'flex', alignItems: 'center', gap: '6px'}}>
                    📅 {w.created_at ? new Date(w.created_at).toLocaleDateString('en-IN', {
                      day: '2-digit', month: 'short', year: 'numeric'
                    }) : 'N/A'}
                    <span style={{color: '#F1C40F', fontWeight: 600}}>
                      ⏰ {w.created_at ? new Date(w.created_at).toLocaleTimeString('en-IN', {
                        hour: '2-digit', minute: '2-digit', hour12: true
                      }) : 'N/A'}
                    </span>
                  </span>
                </div>
                <div style={{textAlign: 'right'}}>
                  <span style={{
                    color: '#E74C3C', 
                    fontSize: '24px', 
                    fontWeight: 800,
                    textShadow: '0 0 15px rgba(231, 76, 60, 0.5)',
                    display: 'block'
                  }}>-${w.amount?.toFixed(2)}</span>
                  {/* Show 5% deducted amount for easy payment */}
                  <span style={{
                    display: 'inline-block', 
                    fontSize: '14px', 
                    color: '#0ECB81',
                    fontWeight: 'bold',
                    marginTop: '6px',
                    background: 'linear-gradient(135deg, rgba(14, 203, 129, 0.2) 0%, rgba(14, 203, 129, 0.1) 100%)',
                    padding: '6px 12px',
                    borderRadius: '8px',
                    border: '1px solid rgba(14, 203, 129, 0.3)',
                  }}>
                    💰 Pay: ${(w.amount * 0.95).toFixed(2)}
                  </span>
                  <span style={{
                    display: 'block', fontSize: '12px', padding: '6px 14px', borderRadius: '8px', marginTop: '8px',
                    background: w.status === 'completed' ? 'linear-gradient(135deg, rgba(14,203,129,0.3) 0%, rgba(14,203,129,0.15) 100%)' 
                      : w.status === 'rejected' ? 'linear-gradient(135deg, rgba(231,76,60,0.3) 0%, rgba(231,76,60,0.15) 100%)' 
                      : 'linear-gradient(135deg, rgba(241,196,15,0.3) 0%, rgba(241,196,15,0.15) 100%)',
                    color: w.status === 'completed' ? '#0ECB81' : w.status === 'rejected' ? '#E74C3C' : '#F1C40F',
                    textTransform: 'uppercase', fontWeight: 700,
                    border: `1px solid ${w.status === 'completed' ? 'rgba(14,203,129,0.5)' : w.status === 'rejected' ? 'rgba(231,76,60,0.5)' : 'rgba(241,196,15,0.5)'}`,
                  }}>{w.status}</span>
                </div>
              </div>

              {/* Row 2: Wallet Address */}
              <div style={{
                background: 'rgba(0,0,0,0.3)',
                borderRadius: '8px',
                padding: '10px 12px',
                display: 'flex',
                alignItems: 'center',
                gap: '10px'
              }}>
                <span style={{color: '#888', fontSize: '12px', whiteSpace: 'nowrap'}}>Wallet:</span>
                <span style={{
                  color: '#FFD700',
                  fontSize: '12px',
                  fontFamily: 'monospace',
                  flex: 1,
                  overflow: 'hidden',
                  textOverflow: 'ellipsis',
                  wordBreak: 'break-all'
                }}>
                  {w.wallet_address || 'No wallet address'}
                </span>
                {w.wallet_address && (
                  <button
                    onClick={() => copyWalletAddress(w.wallet_address)}
                    style={{
                      background: '#FFD700',
                      color: '#000',
                      border: 'none',
                      borderRadius: '6px',
                      padding: '6px 12px',
                      fontSize: '11px',
                      fontWeight: 600,
                      cursor: 'pointer',
                      whiteSpace: 'nowrap'
                    }}
                  >
                    📋 Copy
                  </button>
                )}
              </div>

              {/* Row 3: Action Buttons (only for pending) */}
              {w.status === 'pending' && (
                <div style={{display: 'flex', gap: '10px', marginTop: '4px'}}>
                  <button
                    onClick={() => handleApproveWithdrawal(w.id)}
                    style={{
                      flex: 1,
                      background: 'linear-gradient(135deg, #0ECB81 0%, #0A9F65 100%)',
                      color: '#fff',
                      border: 'none',
                      borderRadius: '8px',
                      padding: '10px 16px',
                      fontSize: '13px',
                      fontWeight: 600,
                      cursor: 'pointer',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      gap: '6px'
                    }}
                  >
                    ✓ Approve
                  </button>
                  <button
                    onClick={() => handleRejectWithdrawal(w.id)}
                    style={{
                      flex: 1,
                      background: 'linear-gradient(135deg, #E74C3C 0%, #C0392B 100%)',
                      color: '#fff',
                      border: 'none',
                      borderRadius: '8px',
                      padding: '10px 16px',
                      fontSize: '13px',
                      fontWeight: 600,
                      cursor: 'pointer',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      gap: '6px'
                    }}
                  >
                    ✕ Reject
                  </button>
                </div>
              )}
            </div>
          );
          })
        )}
      </div>
    </div>
  );

  const renderInvestments = () => (
    <div style={styles.content}>
      <h2 style={styles.title}>Investments ({investments.length})</h2>
      <div style={styles.list}>
        {investments.map((inv, i) => (
          <div key={i} style={styles.txCard}>
            <div>
              <span style={{...styles.txUser, color: '#FFD700'}}>{inv.plan_name}</span>
              <span style={styles.txDate}>{inv.user_email}</span>
            </div>
            <div style={{textAlign: 'right'}}>
              <span style={{...styles.txAmount, color: '#0ECB81'}}>${inv.amount?.toFixed(2)}</span>
              <span style={{display: 'block', fontSize: '11px', color: inv.status === 'active' ? '#0ECB81' : '#888'}}>
                {inv.status}
              </span>
            </div>
          </div>
        ))}
      </div>
    </div>
  );

  const renderSettings = () => (
    <div style={styles.content}>
      <h2 style={styles.title}>⚙️ Platform Settings</h2>
      
      {/* Deposit Wallet Section */}
      <div style={styles.formCard}>
        <h3 style={{color: '#0ECB81', margin: '0 0 15px 0', fontSize: '16px', display: 'flex', alignItems: 'center', gap: '8px'}}>
          <Download size={18} /> Deposit Wallet Address
        </h3>
        <p style={{color: '#888', fontSize: '12px', marginBottom: '12px'}}>
          यह wallet address users को deposit करते time दिखाई देगा।
        </p>
        
        <label style={styles.label}>Wallet Address (USDT)</label>
        <input 
          type="text" 
          placeholder="Enter deposit wallet address (e.g., TRC20 address)" 
          value={platformSettings.deposit_wallet_address}
          onChange={(e) => setPlatformSettings({...platformSettings, deposit_wallet_address: e.target.value})}
          style={styles.input} 
        />
        
        <label style={styles.label}>Network</label>
        <select 
          value={platformSettings.deposit_wallet_network}
          onChange={(e) => setPlatformSettings({...platformSettings, deposit_wallet_network: e.target.value})}
          style={styles.select}
        >
          <option value="TRC20">TRC20 (TRON)</option>
          <option value="ERC20">ERC20 (Ethereum)</option>
          <option value="BEP20">BEP20 (BSC)</option>
        </select>
        
        <label style={styles.label}>Minimum Deposit ($)</label>
        <input 
          type="number" 
          placeholder="Minimum deposit amount" 
          value={platformSettings.min_deposit}
          onChange={(e) => setPlatformSettings({...platformSettings, min_deposit: parseFloat(e.target.value) || 1})}
          style={styles.input} 
        />
      </div>

      {/* Withdrawal Wallet Section */}
      <div style={{...styles.formCard, marginTop: '16px'}}>
        <h3 style={{color: '#E74C3C', margin: '0 0 15px 0', fontSize: '16px', display: 'flex', alignItems: 'center', gap: '8px'}}>
          <Upload size={18} /> Withdrawal Wallet Address
        </h3>
        <p style={{color: '#888', fontSize: '12px', marginBottom: '12px'}}>
          Admin का wallet जहां से withdrawals process होंगे।
        </p>
        
        <label style={styles.label}>Wallet Address (USDT)</label>
        <input 
          type="text" 
          placeholder="Enter withdrawal wallet address" 
          value={platformSettings.withdrawal_wallet_address}
          onChange={(e) => setPlatformSettings({...platformSettings, withdrawal_wallet_address: e.target.value})}
          style={styles.input} 
        />
        
        <label style={styles.label}>Network</label>
        <select 
          value={platformSettings.withdrawal_wallet_network}
          onChange={(e) => setPlatformSettings({...platformSettings, withdrawal_wallet_network: e.target.value})}
          style={styles.select}
        >
          <option value="TRC20">TRC20 (TRON)</option>
          <option value="ERC20">ERC20 (Ethereum)</option>
          <option value="BEP20">BEP20 (BSC)</option>
        </select>
        
        <label style={styles.label}>Minimum Withdrawal ($)</label>
        <input 
          type="number" 
          placeholder="Minimum withdrawal amount" 
          value={platformSettings.min_withdrawal}
          onChange={(e) => setPlatformSettings({...platformSettings, min_withdrawal: parseFloat(e.target.value) || 10})}
          style={styles.input} 
        />
      </div>

      {/* Fee Settings */}
      <div style={{...styles.formCard, marginTop: '16px'}}>
        <h3 style={{color: '#FFD700', margin: '0 0 15px 0', fontSize: '16px', display: 'flex', alignItems: 'center', gap: '8px'}}>
          <DollarSign size={18} /> Fee Settings
        </h3>
        
        <label style={styles.label}>Withdrawal Fee (%)</label>
        <input 
          type="number" 
          placeholder="Withdrawal fee percentage" 
          value={platformSettings.withdrawal_fee_percent}
          onChange={(e) => setPlatformSettings({...platformSettings, withdrawal_fee_percent: parseFloat(e.target.value) || 5})}
          style={styles.input} 
        />
        <p style={{color: '#888', fontSize: '11px', marginTop: '8px'}}>
          Current: {platformSettings.withdrawal_fee_percent}% fee on withdrawals
        </p>
      </div>

      {/* Admin Personal Wallet Section */}
      <div style={{...styles.formCard, marginTop: '16px', border: '1px solid rgba(155, 89, 182, 0.3)'}}>
        <h3 style={{color: '#9B59B6', margin: '0 0 15px 0', fontSize: '16px', display: 'flex', alignItems: 'center', gap: '8px'}}>
          <Wallet size={18} /> Admin Personal Wallet
        </h3>
        <p style={{color: '#888', fontSize: '12px', marginBottom: '12px'}}>
          आपका (Admin का) personal wallet address जहां withdrawals receive होंगे।
        </p>
        
        <label style={styles.label}>Current Wallet</label>
        <div style={{
          background: 'rgba(155, 89, 182, 0.1)',
          padding: '12px',
          borderRadius: '8px',
          marginBottom: '12px',
          fontSize: '13px',
          color: '#9B59B6',
          wordBreak: 'break-all'
        }}>
          {user?.wallet_address || user?.locked_wallet_address || 'Not Set'}
        </div>
        
        <label style={styles.label}>New Wallet Address</label>
        <input 
          type="text" 
          placeholder="Enter your new wallet address" 
          value={adminWallet}
          onChange={(e) => setAdminWallet(e.target.value)}
          style={styles.input} 
        />
        
        <button 
          onClick={updateAdminWallet}
          disabled={adminWalletLoading}
          style={{
            width: '100%',
            marginTop: '12px',
            padding: '12px',
            background: adminWalletLoading ? '#444' : 'linear-gradient(135deg, #9B59B6 0%, #8E44AD 100%)',
            color: '#fff',
            border: 'none',
            borderRadius: '10px',
            fontSize: '14px',
            fontWeight: 600,
            cursor: adminWalletLoading ? 'not-allowed' : 'pointer',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            gap: '8px'
          }}
        >
          {adminWalletLoading ? (
            <>
              <RefreshCw size={16} style={{animation: 'spin 1s linear infinite'}} />
              Updating...
            </>
          ) : (
            <>
              <Wallet size={16} />
              Update My Wallet
            </>
          )}
        </button>
      </div>

      {/* Save Button */}
      <button 
        onClick={savePlatformSettings}
        disabled={settingsLoading}
        style={{
          width: '100%',
          marginTop: '20px',
          padding: '16px',
          background: settingsLoading ? '#444' : 'linear-gradient(135deg, #FFD700 0%, #FFA500 100%)',
          color: '#000',
          border: 'none',
          borderRadius: '12px',
          fontSize: '16px',
          fontWeight: 700,
          cursor: settingsLoading ? 'not-allowed' : 'pointer',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          gap: '10px'
        }}
      >
        {settingsLoading ? (
          <>
            <RefreshCw size={20} style={{animation: 'spin 1s linear infinite'}} />
            Saving...
          </>
        ) : (
          <>
            <Settings size={20} />
            Save All Settings
          </>
        )}
      </button>

      {/* Info Box */}
      <div style={{
        marginTop: '16px',
        padding: '16px',
        background: 'rgba(255,215,0,0.1)',
        borderRadius: '12px',
        border: '1px solid rgba(255,215,0,0.2)'
      }}>
        <p style={{color: '#FFD700', fontSize: '13px', margin: 0, fontWeight: 600}}>
          💡 Important Notes:
        </p>
        <ul style={{color: '#888', fontSize: '12px', margin: '10px 0 0 0', paddingLeft: '20px'}}>
          <li>Deposit wallet address users को deposit page पर दिखाई देगा</li>
          <li>Withdrawal fee automatically calculate होगा withdrawals में</li>
          <li>Settings save करने के बाद तुरंत apply हो जाएंगी</li>
        </ul>
      </div>
    </div>
  );

  const renderContent = () => {
    switch(activeTab) {
      case 'dashboard': return renderDashboard();
      case 'announcements': return renderAnnouncements();
      case 'dailyroi': return renderDailyROI();
      case 'users': return renderUsers();
      case 'adjustfunds': return renderAdjustFunds();
      case 'createinvestment': return renderCreateInvestment();
      case 'deposits': return renderDeposits();
      case 'withdrawals': return renderWithdrawals();
      case 'investments': return renderInvestments();
      case 'givebonus': return renderGiveBonus();
      case 'resetpassword': return renderResetPassword();
      case 'updatewallet': return renderUpdateWallet();
      case 'settings': return renderSettings();
      default: return renderDashboard();
    }
  };

  // Render Announcements Tab
  const renderAnnouncements = () => (
    <div>
      <h2 style={styles.title}>📢 Send Announcement</h2>
      <p style={{color: '#888', marginBottom: '20px'}}>Send notifications to all users</p>
      
      {/* Create Announcement Form */}
      <div style={{...styles.card, marginBottom: '24px'}}>
        <h3 style={{color: '#fff', marginBottom: '16px'}}>New Announcement</h3>
        
        <div style={{marginBottom: '16px'}}>
          <label style={styles.label}>Title</label>
          <input
            type="text"
            value={announcementTitle}
            onChange={(e) => setAnnouncementTitle(e.target.value)}
            placeholder="Enter announcement title..."
            style={styles.input}
          />
        </div>
        
        <div style={{marginBottom: '16px'}}>
          <label style={styles.label}>Message</label>
          <textarea
            value={announcementMessage}
            onChange={(e) => setAnnouncementMessage(e.target.value)}
            placeholder="Enter announcement message..."
            rows={4}
            style={{...styles.input, resize: 'vertical', minHeight: '100px'}}
          />
        </div>
        
        <div style={{marginBottom: '20px'}}>
          <label style={styles.label}>Type</label>
          <div style={{display: 'flex', gap: '10px', flexWrap: 'wrap'}}>
            {[
              { value: 'info', label: '📢 Info', color: '#3B82F6' },
              { value: 'success', label: '✅ Success', color: '#0ECB81' },
              { value: 'warning', label: '⚠️ Warning', color: '#F59E0B' },
              { value: 'promo', label: '🎁 Promo', color: '#FF69B4' },
            ].map(type => (
              <button
                key={type.value}
                onClick={() => setAnnouncementType(type.value)}
                style={{
                  padding: '10px 16px',
                  borderRadius: '8px',
                  border: `2px solid ${announcementType === type.value ? type.color : '#333'}`,
                  background: announcementType === type.value ? `${type.color}20` : '#1a1a2e',
                  color: announcementType === type.value ? type.color : '#888',
                  cursor: 'pointer',
                  fontWeight: 600,
                }}
              >
                {type.label}
              </button>
            ))}
          </div>
        </div>
        
        <button
          onClick={handleSendAnnouncement}
          disabled={sendingAnnouncement}
          style={{
            ...styles.primaryBtn,
            opacity: sendingAnnouncement ? 0.7 : 1,
            display: 'flex',
            alignItems: 'center',
            gap: '8px',
          }}
        >
          <Send size={18} />
          {sendingAnnouncement ? 'Sending...' : 'Send to All Users'}
        </button>
      </div>
      
      {/* Previous Announcements */}
      <div style={styles.card}>
        <h3 style={{color: '#fff', marginBottom: '16px'}}>Previous Announcements</h3>
        
        {announcements.length === 0 ? (
          <p style={{color: '#666', textAlign: 'center', padding: '20px'}}>No announcements yet</p>
        ) : (
          <div style={{display: 'flex', flexDirection: 'column', gap: '12px'}}>
            {announcements.map((ann) => (
              <div key={ann.id} style={{
                padding: '16px',
                background: '#0d0d1a',
                borderRadius: '12px',
                border: '1px solid #333',
              }}>
                <div style={{display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start'}}>
                  <div style={{flex: 1}}>
                    <div style={{display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '8px'}}>
                      <span style={{fontSize: '18px'}}>
                        {ann.type === 'promo' ? '🎁' : ann.type === 'warning' ? '⚠️' : ann.type === 'success' ? '✅' : '📢'}
                      </span>
                      <span style={{color: '#fff', fontWeight: 600}}>{ann.title}</span>
                    </div>
                    <p style={{color: '#888', fontSize: '14px', marginBottom: '8px'}}>{ann.message}</p>
                    <span style={{color: '#666', fontSize: '12px'}}>
                      {new Date(ann.created_at).toLocaleString('en-IN')}
                    </span>
                  </div>
                  <button
                    onClick={() => handleDeleteAnnouncement(ann.id)}
                    style={{
                      background: 'rgba(255,68,68,0.1)',
                      border: '1px solid #FF4444',
                      borderRadius: '8px',
                      padding: '8px',
                      cursor: 'pointer',
                    }}
                  >
                    <Trash2 size={16} color="#FF4444" />
                  </button>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );

  // User Details Modal
  const UserDetailsModal = () => {
    if (!showUserModal || !userDetails) return null;
    const u = userDetails.user;
    return (
      <div style={styles.modalOverlay} onClick={() => setShowUserModal(false)}>
        <div style={styles.modal} onClick={(e) => e.stopPropagation()}>
          <div style={styles.modalHeader}>
            <h3>User Details</h3>
            <button style={styles.closeBtn} onClick={() => setShowUserModal(false)}><X size={24} /></button>
          </div>
          <div style={styles.modalBody}>
            <div style={styles.detailRow}><span>Username:</span><span>{u.username || 'N/A'}</span></div>
            <div style={styles.detailRow}><span>Email:</span><span>{u.email}</span></div>
            <div style={styles.detailRow}><span>Balance:</span><span style={{color:'#0ECB81'}}>${u.balance?.toFixed(2)}</span></div>
            <div style={styles.detailRow}><span>Total Invested:</span><span>${u.total_invested?.toFixed(2)}</span></div>
            <div style={styles.detailRow}><span>Referral Code:</span><span>{u.referral_code}</span></div>
            <div style={styles.detailRow}><span>Wallet:</span><span style={{fontSize:'11px'}}>{u.wallet_address || u.locked_wallet_address || 'Not set'}</span></div>
            <div style={styles.detailRow}><span>Team Size:</span><span>{userDetails.team_count}</span></div>
            <div style={styles.detailRow}><span>Investments:</span><span>{userDetails.investments?.length || 0}</span></div>
            <div style={styles.detailRow}><span>Deposits:</span><span>{userDetails.deposits?.length || 0}</span></div>
            <div style={styles.detailRow}><span>Withdrawals:</span><span>{userDetails.withdrawals?.length || 0}</span></div>
            <div style={styles.detailRow}><span>Joined:</span><span>{formatDate(u.created_at)}</span></div>
          </div>
        </div>
      </div>
    );
  };

  if (!isAuthenticated) {
    return (
      <div style={styles.page}>
        <div style={styles.authMessage}>
          <Key size={48} color="#FFD700" />
          <h2 style={{color: '#FFD700'}}>Admin Access Required</h2>
          <p>Please login to access admin panel</p>
          <button onClick={() => navigate('/login')} style={styles.loginBtn}>
            <LogIn size={20} /> Login Now
          </button>
        </div>
      </div>
    );
  }

  return (
    <div style={styles.page}>
      {/* CSS Animation */}
      <style>{`
        @keyframes spin {
          0% { transform: rotate(0deg); }
          100% { transform: rotate(360deg); }
        }
      `}</style>
      
      <UserDetailsModal />
      
      <div style={styles.header}>
        <button style={styles.menuBtn} onClick={() => setSidebarOpen(true)}><Menu size={24} color="#FFD700" /></button>
        <span style={styles.headerTitle}>Admin Panel</span>
        {/* Refresh Button */}
        <button 
          style={{
            background: 'linear-gradient(135deg, #0ECB81 0%, #00E5A0 100%)',
            border: 'none',
            borderRadius: '10px',
            padding: '8px 16px',
            display: 'flex',
            alignItems: 'center',
            gap: '6px',
            cursor: 'pointer',
            marginLeft: 'auto',
            boxShadow: '0 4px 15px rgba(14, 203, 129, 0.4)',
          }}
          onClick={() => {
            toast.loading('Refreshing data...', {id: 'refresh'});
            fetchAdminData().then(() => {
              toast.success('✅ All data refreshed!', {id: 'refresh', duration: 2000});
            });
          }}
        >
          <RefreshCw size={18} color="#000" />
          <span style={{color: '#000', fontWeight: 700, fontSize: '13px'}}>Refresh</span>
        </button>
      </div>

      {sidebarOpen && <div style={styles.overlay} onClick={() => setSidebarOpen(false)} />}

      <div style={{...styles.sidebar, transform: sidebarOpen ? 'translateX(0)' : 'translateX(-100%)'}}>
        <div style={styles.sidebarHeader}>
          <span style={styles.sidebarTitle}>Admin Panel</span>
          <button style={styles.closeBtn} onClick={() => setSidebarOpen(false)}><X size={24} color="#FFD700" /></button>
        </div>
        <div style={styles.sidebarMenu}>
          {menuItems.map((item) => {
            const Icon = item.icon;
            return (
              <button key={item.id}
                style={{...styles.menuItem, ...(activeTab === item.id ? styles.menuItemActive : {})}}
                onClick={() => { setActiveTab(item.id); setSidebarOpen(false); }}>
                <Icon size={20} /><span>{item.label}</span>
              </button>
            );
          })}
        </div>
      </div>

      <div style={styles.mainContent}>
        {loading ? <div style={styles.loading}>Loading...</div> : renderContent()}
      </div>
    </div>
  );
};

const styles = {
  page: { minHeight: '100vh', background: '#000', color: '#FFF' },
  header: { display: 'flex', alignItems: 'center', gap: '16px', padding: '16px', background: '#0a0a0a', borderBottom: '1px solid rgba(255,215,0,0.2)', position: 'sticky', top: 0, zIndex: 100 },
  menuBtn: { background: 'none', border: 'none', cursor: 'pointer' },
  headerTitle: { fontSize: '18px', fontWeight: 700, color: '#FFD700' },
  overlay: { position: 'fixed', top: 0, left: 0, right: 0, bottom: 0, background: 'rgba(0,0,0,0.7)', zIndex: 200 },
  sidebar: { position: 'fixed', top: 0, left: 0, width: '280px', height: '100vh', background: '#0a0a0a', borderRight: '1px solid rgba(255,215,0,0.2)', zIndex: 300, transition: 'transform 0.3s ease', display: 'flex', flexDirection: 'column' },
  sidebarHeader: { display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '20px', borderBottom: '1px solid rgba(255,215,0,0.2)' },
  sidebarTitle: { fontSize: '18px', fontWeight: 700, color: '#0ECB81' },
  closeBtn: { background: 'none', border: 'none', cursor: 'pointer', color: '#FFD700' },
  sidebarMenu: { flex: 1, padding: '16px 12px', overflowY: 'auto', display: 'flex', flexDirection: 'column', gap: '4px' },
  menuItem: { display: 'flex', alignItems: 'center', gap: '12px', padding: '14px 16px', background: 'transparent', border: 'none', borderRadius: '10px', color: 'rgba(255,255,255,0.7)', fontSize: '15px', cursor: 'pointer', textAlign: 'left', width: '100%' },
  menuItemActive: { background: 'rgba(14,203,129,0.15)', color: '#0ECB81' },
  mainContent: { padding: '16px', maxWidth: '500px', margin: '0 auto' },
  content: { display: 'flex', flexDirection: 'column', gap: '16px' },
  title: { fontSize: '20px', fontWeight: 700, color: '#FFF', margin: 0 },
  statsGrid: { display: 'grid', gridTemplateColumns: 'repeat(2, 1fr)', gap: '12px' },
  statCard: { background: 'rgba(255,255,255,0.03)', border: '2px solid', borderRadius: '14px', padding: '16px', display: 'flex', flexDirection: 'column', gap: '8px' },
  statValue: { fontSize: '22px', fontWeight: 700, color: '#FFF' },
  statLabel: { fontSize: '12px', color: 'rgba(255,255,255,0.5)' },
  actionCards: { display: 'flex', flexDirection: 'column', gap: '16px' },
  actionCard: { background: 'rgba(255,255,255,0.03)', border: '1px solid rgba(255,255,255,0.1)', borderRadius: '14px', padding: '24px', textAlign: 'center', display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '12px' },
  actionBtn: { background: '#0ECB81', color: '#000', border: 'none', padding: '12px 24px', borderRadius: '10px', fontSize: '14px', fontWeight: 600, cursor: 'pointer' },
  searchBox: { display: 'flex', alignItems: 'center', gap: '10px', background: 'rgba(255,255,255,0.05)', border: '1px solid rgba(255,255,255,0.1)', borderRadius: '10px', padding: '12px 16px' },
  searchInput: { flex: 1, background: 'none', border: 'none', color: '#FFF', fontSize: '14px', outline: 'none' },
  list: { display: 'flex', flexDirection: 'column', gap: '8px' },
  userCard: { display: 'flex', alignItems: 'center', justifyContent: 'space-between', background: 'rgba(255,255,255,0.03)', border: '1px solid rgba(255,255,255,0.1)', borderRadius: '12px', padding: '14px', cursor: 'pointer' },
  userInfo: { display: 'flex', flexDirection: 'column', gap: '2px' },
  userName: { fontSize: '14px', fontWeight: 600, color: '#FFF' },
  userEmail: { fontSize: '12px', color: 'rgba(255,255,255,0.5)' },
  userStats: { display: 'flex', flexDirection: 'column', alignItems: 'flex-end', gap: '2px', fontSize: '11px', color: 'rgba(255,255,255,0.6)' },
  txCard: { display: 'flex', alignItems: 'center', justifyContent: 'space-between', background: 'rgba(255,255,255,0.03)', border: '1px solid rgba(255,255,255,0.1)', borderRadius: '12px', padding: '14px' },
  txUser: { display: 'block', fontSize: '14px', fontWeight: 500, color: '#FFF' },
  txDate: { display: 'block', fontSize: '11px', color: 'rgba(255,255,255,0.4)' },
  txAmount: { fontSize: '15px', fontWeight: 600 },
  formCard: { background: 'rgba(255,255,255,0.03)', border: '1px solid rgba(255,255,255,0.1)', borderRadius: '14px', padding: '20px', display: 'flex', flexDirection: 'column', gap: '16px' },
  label: { fontSize: '13px', color: 'rgba(255,255,255,0.6)', marginBottom: '-8px' },
  input: { background: 'rgba(255,255,255,0.05)', border: '1px solid rgba(255,255,255,0.15)', borderRadius: '10px', padding: '14px', color: '#FFF', fontSize: '14px', outline: 'none' },
  select: { background: '#111', border: '1px solid rgba(255,255,255,0.15)', borderRadius: '10px', padding: '14px', color: '#FFF', fontSize: '14px', outline: 'none', width: '100%' },
  btn: { display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '8px', padding: '14px 20px', borderRadius: '10px', border: 'none', fontSize: '14px', fontWeight: 600, cursor: 'pointer', color: '#FFF' },
  btnRow: { display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '10px' },
  loading: { textAlign: 'center', padding: '60px 20px', color: 'rgba(255,255,255,0.5)' },
  authMessage: { display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', gap: '16px', padding: '100px 20px', textAlign: 'center' },
  loginBtn: { display: 'flex', alignItems: 'center', gap: '10px', background: '#FFD700', color: '#000', border: 'none', padding: '14px 32px', borderRadius: '12px', fontSize: '16px', fontWeight: 600, cursor: 'pointer' },
  modalOverlay: { position: 'fixed', top: 0, left: 0, right: 0, bottom: 0, background: 'rgba(0,0,0,0.8)', zIndex: 400, display: 'flex', alignItems: 'center', justifyContent: 'center', padding: '20px' },
  modal: { background: '#111', border: '1px solid rgba(255,215,0,0.3)', borderRadius: '16px', width: '100%', maxWidth: '400px', maxHeight: '80vh', overflow: 'auto' },
  modalHeader: { display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '16px 20px', borderBottom: '1px solid rgba(255,255,255,0.1)' },
  modalBody: { padding: '20px', display: 'flex', flexDirection: 'column', gap: '12px' },
  detailRow: { display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '8px 0', borderBottom: '1px solid rgba(255,255,255,0.05)', fontSize: '14px' },
  historyContainer: { background: 'rgba(255,255,255,0.03)', border: '1px solid rgba(255,255,255,0.1)', borderRadius: '14px', padding: '16px', marginTop: '16px' },
  historyList: { display: 'flex', flexDirection: 'column', gap: '10px', maxHeight: '400px', overflowY: 'auto' },
  historyItem: { background: 'rgba(255,255,255,0.05)', borderRadius: '10px', padding: '12px', transition: 'background 0.2s' },
};

export default Admin;
