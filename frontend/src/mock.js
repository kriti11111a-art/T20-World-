// Mock data for Trade Genius platform

export const mockUser = {
  id: 'user_001',
  username: 'crypto_investor',
  email: 'investor@example.com',
  wallet: '0x742d35Cc6634C0532925a3b844Bc9e7595f0bEb',
  walletAddress: '0x35C52851a7d9B8F2c4E6f1234567D542600',
  balance: 245.50,
  totalInvested: 500,
  totalEarned: 180.50,
  activeInvestments: 2,
  referralCode: 'TG001',
  referralEarnings: 35.00,
  joinedDate: '2024-11-15',
};

export const investmentPlans = [
  {
    id: 1,
    name: 'Trading SLAB 1',
    minInvestment: 1,
    maxInvestment: 19,
    dailyROI: 5.5,
    duration: 20,
    totalReturn: 110,
    color: '#00FFD1',
  },
  {
    id: 2,
    name: 'Trading SLAB 2',
    minInvestment: 20,
    maxInvestment: 299,
    dailyROI: 6.0,
    duration: 20,
    totalReturn: 120,
    color: '#00FFD1',
  },
  {
    id: 3,
    name: 'Trading SLAB 3',
    minInvestment: 300,
    maxInvestment: 2999,
    dailyROI: 6.5,
    duration: 20,
    totalReturn: 130,
    color: '#00FFD1',
  },
  {
    id: 4,
    name: 'Trading SLAB 4',
    minInvestment: 3000,
    maxInvestment: 50000,
    dailyROI: 7.0,
    duration: 20,
    totalReturn: 140,
    color: '#00FFD1',
  },
];

export const mockInvestments = [
  {
    id: 'inv_001',
    plan: 'Trading SLAB 2',
    amount: 100,
    dailyROI: 6.0,
    startDate: '2024-12-05',
    endDate: '2024-12-25',
    daysCompleted: 10,
    totalDays: 20,
    earnedSoFar: 60,
    status: 'active',
  },
  {
    id: 'inv_002',
    plan: 'Trading SLAB 3',
    amount: 400,
    dailyROI: 6.5,
    startDate: '2024-12-01',
    endDate: '2024-12-21',
    daysCompleted: 14,
    totalDays: 20,
    earnedSoFar: 364,
    status: 'active',
  },
];

export const mockTransactions = [
  {
    id: 'txn_001',
    type: 'deposit',
    amount: 100,
    status: 'approved',
    date: '2024-12-05',
    txHash: '0x123...abc',
  },
  {
    id: 'txn_002',
    type: 'deposit',
    amount: 400,
    status: 'approved',
    date: '2024-12-01',
    txHash: '0x456...def',
  },
  {
    id: 'txn_003',
    type: 'withdrawal',
    amount: 50,
    status: 'approved',
    date: '2024-12-10',
    txHash: '0x789...ghi',
  },
  {
    id: 'txn_004',
    type: 'deposit',
    amount: 200,
    status: 'pending',
    date: '2024-12-15',
    txHash: '0xabc...jkl',
  },
];

export const mockReferrals = [
  {
    id: 'ref_001',
    name: 'User Alpha',
    username: 'user_alpha',
    level: 1,
    investmentAmount: 500,
    investment: 500,
    earning: 5,
    joinDate: '2024-11-20',
    status: 'active',
  },
  {
    id: 'ref_002',
    name: 'User Beta',
    username: 'user_beta',
    level: 1,
    investmentAmount: 200,
    investment: 200,
    earning: 2,
    joinDate: '2024-11-25',
    status: 'active',
  },
  {
    id: 'ref_003',
    name: 'User Gamma',
    username: 'user_gamma',
    level: 2,
    investmentAmount: 1000,
    investment: 1000,
    earning: 10,
    joinDate: '2024-12-01',
    status: 'active',
  },
  {
    id: 'ref_004',
    name: 'User Delta',
    username: 'user_delta',
    level: 2,
    investmentAmount: 100,
    investment: 100,
    earning: 1,
    joinDate: '2024-12-05',
    status: 'active',
  },
  {
    id: 'ref_005',
    name: 'User Epsilon',
    username: 'user_epsilon',
    level: 3,
    investmentAmount: 50,
    investment: 50,
    earning: 0.5,
    joinDate: '2024-12-10',
    status: 'active',
  },
];

export const mockAdminData = {
  totalUsers: 1247,
  totalInvestments: 156780,
  pendingDeposits: 12,
  pendingWithdrawals: 8,
  totalEarningsPaid: 45230,
  activeInvestments: 845,
};

export const mockPendingDeposits = [
  {
    id: 'dep_001',
    username: 'user_001',
    amount: 200,
    txHash: '0xabc...jkl',
    date: '2024-12-15',
    wallet: '0x742...bEb',
  },
  {
    id: 'dep_002',
    username: 'user_002',
    amount: 500,
    txHash: '0xdef...mno',
    date: '2024-12-15',
    wallet: '0x853...cFc',
  },
];

export const mockPendingWithdrawals = [
  {
    id: 'with_001',
    username: 'user_003',
    amount: 150,
    wallet: '0x964...dGd',
    date: '2024-12-15',
  },
  {
    id: 'with_002',
    username: 'user_004',
    amount: 80,
    wallet: '0xa75...eHe',
    date: '2024-12-15',
  },
];
