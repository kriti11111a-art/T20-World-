import React, { useState, useEffect } from 'react';
import { Bot, TrendingUp, Zap, Shield, Clock, DollarSign, ArrowRight, CheckCircle } from 'lucide-react';
import Header from '../components/Header';
import { useTheme } from '../context/ThemeContext';
import { useAuth } from '../context/AuthContext';
import { useNavigate } from 'react-router-dom';
import toast from 'react-hot-toast';

const API_URL = process.env.REACT_APP_BACKEND_URL;

const Invest = () => {
  const { colors } = useTheme();
  const { user, token, refreshUser } = useAuth();
  const navigate = useNavigate();
  const [plans, setPlans] = useState([]);
  const [loading, setLoading] = useState(true);
  const [investing, setInvesting] = useState(false);
  const [selectedPlan, setSelectedPlan] = useState(null);

  useEffect(() => {
    fetchPlans();
  }, []);

  const fetchPlans = async () => {
    try {
      const res = await fetch(`${API_URL}/api/plans`);
      if (res.ok) {
        const data = await res.json();
        setPlans(data);
      }
    } catch (error) {
      console.error('Error fetching plans:', error);
    }
    setLoading(false);
  };

  const handleInvest = async (plan) => {
    if (!token) {
      toast.error('Please login first');
      navigate('/login');
      return;
    }

    if (user?.wallet_balance < plan.min_amount) {
      toast.error(`Insufficient balance. Need $${plan.min_amount}`);
      navigate('/deposit');
      return;
    }

    setInvesting(true);
    setSelectedPlan(plan.id);

    try {
      const res = await fetch(`${API_URL}/api/invest`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify({
          plan_id: plan.id,
          amount: plan.min_amount
        })
      });

      const data = await res.json();
      
      if (res.ok) {
        toast.success(`Successfully invested $${plan.min_amount} in ${plan.name}!`);
        refreshUser();
        navigate('/my-investments');
      } else {
        toast.error(data.detail || 'Investment failed');
      }
    } catch (error) {
      toast.error('Network error. Please try again.');
    }
    setInvesting(false);
    setSelectedPlan(null);
  };

  return (
    <div style={{
      minHeight: '100vh',
      background: '#031A33',
      paddingTop: '80px',
      paddingBottom: '100px',
    }}>
      <Header />
      
      <div style={{ padding: '20px', maxWidth: '500px', margin: '0 auto' }}>
        {/* Page Header */}
        <div style={{
          textAlign: 'center',
          marginBottom: '30px',
        }}>
          <div style={{
            width: '80px',
            height: '80px',
            borderRadius: '50%',
            background: 'linear-gradient(135deg, #087BFF 0%, #16E0FF 100%)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            margin: '0 auto 16px',
            boxShadow: '0 0 30px rgba(22, 224, 255, 0.5)',
          }}>
            <Bot size={40} color="#FFFFFF" />
          </div>
          <h1 style={{
            fontSize: '28px',
            fontWeight: 800,
            color: '#FFFFFF',
            marginBottom: '8px',
          }}>
            Trading <span style={{ color: '#16E0FF' }}>Bot</span>
          </h1>
          <p style={{
            fontSize: '14px',
            color: '#B8C7DC',
          }}>
            Choose a trading slab and start earning daily ROI
          </p>
        </div>

        {/* Features */}
        <div style={{
          display: 'grid',
          gridTemplateColumns: 'repeat(3, 1fr)',
          gap: '12px',
          marginBottom: '30px',
        }}>
          {[
            { icon: Zap, label: 'Auto Trading', color: '#16E0FF' },
            { icon: Shield, label: '100% Secure', color: '#0ECB81' },
            { icon: TrendingUp, label: 'Daily ROI', color: '#FFD700' },
          ].map((item, i) => (
            <div key={i} style={{
              background: 'rgba(6, 37, 68, 0.6)',
              borderRadius: '12px',
              padding: '16px 10px',
              textAlign: 'center',
              border: '1px solid rgba(23, 77, 117, 0.5)',
            }}>
              <item.icon size={24} color={item.color} style={{ marginBottom: '8px' }} />
              <div style={{ fontSize: '11px', color: '#B8C7DC', fontWeight: 600 }}>{item.label}</div>
            </div>
          ))}
        </div>

        {/* Investment Plans */}
        <h2 style={{
          fontSize: '18px',
          fontWeight: 700,
          color: '#FFFFFF',
          marginBottom: '16px',
          display: 'flex',
          alignItems: 'center',
          gap: '8px',
        }}>
          <DollarSign size={20} color="#16E0FF" />
          Trading Slabs
        </h2>

        {loading ? (
          <div style={{ textAlign: 'center', padding: '40px', color: '#B8C7DC' }}>
            Loading plans...
          </div>
        ) : (
          <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
            {plans.map((plan) => (
              <div
                key={plan.id}
                style={{
                  background: 'linear-gradient(145deg, #0a1929 0%, #0d2847 100%)',
                  borderRadius: '16px',
                  padding: '20px',
                  border: '1px solid rgba(22, 224, 255, 0.3)',
                  boxShadow: '0 4px 20px rgba(0, 0, 0, 0.3)',
                }}
              >
                <div style={{
                  display: 'flex',
                  justifyContent: 'space-between',
                  alignItems: 'center',
                  marginBottom: '16px',
                }}>
                  <div>
                    <div style={{
                      fontSize: '12px',
                      color: '#B8C7DC',
                      letterSpacing: '2px',
                      marginBottom: '4px',
                    }}>
                      {plan.name?.toUpperCase() || `SLAB ${plan.id}`}
                    </div>
                    <div style={{
                      fontSize: '28px',
                      fontWeight: 800,
                      color: '#FFFFFF',
                    }}>
                      <span style={{ color: '#16E0FF' }}>${plan.min_amount}</span>
                      {plan.max_amount && plan.max_amount !== plan.min_amount && (
                        <span style={{ fontSize: '14px', color: '#B8C7DC' }}> - ${plan.max_amount}</span>
                      )}
                    </div>
                  </div>
                  <div style={{
                    background: 'rgba(14, 203, 129, 0.15)',
                    padding: '8px 16px',
                    borderRadius: '20px',
                    border: '1px solid rgba(14, 203, 129, 0.3)',
                  }}>
                    <span style={{ color: '#0ECB81', fontWeight: 800, fontSize: '18px' }}>
                      {plan.daily_roi}%
                    </span>
                    <span style={{ color: '#B8C7DC', fontSize: '11px', display: 'block' }}>Daily</span>
                  </div>
                </div>

                <div style={{
                  display: 'flex',
                  gap: '12px',
                  marginBottom: '16px',
                }}>
                  <div style={{
                    flex: 1,
                    background: 'rgba(6, 37, 68, 0.6)',
                    borderRadius: '10px',
                    padding: '12px',
                    textAlign: 'center',
                  }}>
                    <Clock size={16} color="#16E0FF" style={{ marginBottom: '4px' }} />
                    <div style={{ fontSize: '14px', fontWeight: 700, color: '#FFFFFF' }}>{plan.duration_days} Days</div>
                    <div style={{ fontSize: '10px', color: '#B8C7DC' }}>Duration</div>
                  </div>
                  <div style={{
                    flex: 1,
                    background: 'rgba(6, 37, 68, 0.6)',
                    borderRadius: '10px',
                    padding: '12px',
                    textAlign: 'center',
                  }}>
                    <TrendingUp size={16} color="#FFD700" style={{ marginBottom: '4px' }} />
                    <div style={{ fontSize: '14px', fontWeight: 700, color: '#FFD700' }}>
                      {(plan.daily_roi * plan.duration_days).toFixed(0)}%
                    </div>
                    <div style={{ fontSize: '10px', color: '#B8C7DC' }}>Total ROI</div>
                  </div>
                </div>

                <button
                  onClick={() => handleInvest(plan)}
                  disabled={investing}
                  style={{
                    width: '100%',
                    padding: '14px',
                    background: investing && selectedPlan === plan.id
                      ? 'rgba(22, 224, 255, 0.3)'
                      : 'linear-gradient(90deg, #087BFF 0%, #16E0FF 100%)',
                    border: 'none',
                    borderRadius: '12px',
                    color: '#FFFFFF',
                    fontSize: '15px',
                    fontWeight: 700,
                    cursor: investing ? 'not-allowed' : 'pointer',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    gap: '8px',
                    boxShadow: '0 4px 15px rgba(22, 224, 255, 0.3)',
                    transition: 'all 0.3s ease',
                  }}
                >
                  {investing && selectedPlan === plan.id ? (
                    'Processing...'
                  ) : (
                    <>
                      Invest Now
                      <ArrowRight size={18} />
                    </>
                  )}
                </button>
              </div>
            ))}
          </div>
        )}

        {/* Info Box */}
        <div style={{
          marginTop: '30px',
          background: 'rgba(22, 224, 255, 0.1)',
          borderRadius: '12px',
          padding: '16px',
          border: '1px solid rgba(22, 224, 255, 0.3)',
        }}>
          <h3 style={{
            fontSize: '14px',
            fontWeight: 700,
            color: '#16E0FF',
            marginBottom: '12px',
            display: 'flex',
            alignItems: 'center',
            gap: '8px',
          }}>
            <CheckCircle size={18} />
            How it works
          </h3>
          <ul style={{
            margin: 0,
            padding: '0 0 0 20px',
            color: '#B8C7DC',
            fontSize: '13px',
            lineHeight: '1.8',
          }}>
            <li>Choose a trading slab and invest</li>
            <li>Our AI bot trades automatically</li>
            <li>Earn daily ROI for the duration</li>
            <li>Withdraw or re-compound anytime</li>
          </ul>
        </div>
      </div>
    </div>
  );
};

export default Invest;
