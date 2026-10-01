import React, { useState, useEffect } from 'react';
import { Trophy, ChevronDown, ChevronUp, RefreshCw } from 'lucide-react';
import Header from '../components/Header';
import { useAuth } from '../context/AuthContext';
import { useTheme } from '../context/ThemeContext';
import tokenManager from '../utils/tokenManager';

const API_URL = process.env.REACT_APP_BACKEND_URL;

const Rank = () => {
  const { user } = useAuth();
  const { isDark, colors } = useTheme();
  const [salaryRankInfo, setSalaryRankInfo] = useState(null);
  const [loading, setLoading] = useState(true);
  const [expandedRank, setExpandedRank] = useState(null);

  useEffect(() => {
    fetchSalaryRankInfo();
  }, []);

  const fetchSalaryRankInfo = async () => {
    const authToken = tokenManager.get();
    if (!authToken) {
      setLoading(false);
      return;
    }

    try {
      const res = await fetch(`${API_URL}/api/income/salary-rank`, {
        headers: { 'Authorization': `Bearer ${authToken}` }
      });
      if (res.ok) {
        const data = await res.json();
        setSalaryRankInfo(data);
      }
    } catch (error) {
      console.error('Error fetching salary rank:', error);
    }
    setLoading(false);
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
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center',
          marginBottom: '20px',
        }}>
          <h1 style={{
            fontSize: '24px',
            fontWeight: 800,
            color: '#FFFFFF',
            display: 'flex',
            alignItems: 'center',
            gap: '10px',
          }}>
            <Trophy size={24} color="#FFD700" />
            Salary Rank
          </h1>
          <button
            onClick={fetchSalaryRankInfo}
            disabled={loading}
            style={{
              background: 'rgba(22, 224, 255, 0.15)',
              border: '1px solid rgba(22, 224, 255, 0.3)',
              borderRadius: '10px',
              padding: '10px',
              cursor: 'pointer',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
            }}
          >
            <RefreshCw size={18} color="#16E0FF" className={loading ? 'spin' : ''} />
          </button>
        </div>

        {loading ? (
          <div style={{
            textAlign: 'center',
            padding: '60px 20px',
            color: '#B8C7DC',
          }}>
            <RefreshCw size={32} color="#16E0FF" className="spin" style={{ marginBottom: '16px' }} />
            <p>Loading rank info...</p>
          </div>
        ) : salaryRankInfo ? (
          <div style={{
            background: 'linear-gradient(145deg, #0a1929 0%, #0d2847 100%)',
            borderRadius: '20px',
            padding: '20px',
            border: '2px solid rgba(22, 224, 255, 0.4)',
            boxShadow: '0 8px 32px rgba(0, 0, 0, 0.3)',
          }}>
            {/* Header with Daily Salary Badge */}
            <div style={{
              display: 'flex',
              justifyContent: 'space-between',
              alignItems: 'center',
              marginBottom: '16px',
            }}>
              <h3 style={{ fontSize: '18px', fontWeight: 700, color: '#FFFFFF', display: 'flex', alignItems: 'center', gap: '8px' }}>
                🏆 Salary Rank
              </h3>
              {salaryRankInfo.current_rank > 0 && salaryRankInfo.daily_salary > 0 && (
                <span style={{
                  background: 'linear-gradient(90deg, #00C853 0%, #00E676 100%)',
                  color: '#FFFFFF',
                  padding: '6px 14px',
                  borderRadius: '20px',
                  fontSize: '13px',
                  fontWeight: 700,
                }}>
                  ${salaryRankInfo.daily_salary}/day
                </span>
              )}
            </div>
            
            {/* Current Rank Display */}
            <div style={{
              background: 'rgba(6, 37, 68, 0.6)',
              borderRadius: '14px',
              padding: '20px',
              textAlign: 'center',
              marginBottom: '16px',
              border: '1px solid rgba(23, 77, 117, 0.5)',
            }}>
              <div style={{ marginBottom: '8px' }}>
                {salaryRankInfo.current_rank > 0 ? (
                  <span style={{ fontSize: '28px' }}>
                    {Array(salaryRankInfo.current_rank_info?.stars || 0).fill('⭐').join('')}
                  </span>
                ) : (
                  <span style={{ color: '#B8C7DC', fontSize: '16px' }}>No Rank Yet</span>
                )}
              </div>
              {salaryRankInfo.current_rank > 0 && (
                <span style={{ color: '#FFFFFF', fontSize: '18px', fontWeight: 700 }}>
                  {salaryRankInfo.current_rank_info?.name}
                </span>
              )}
            </div>

            {/* Next Rank Info */}
            {salaryRankInfo.next_rank_info && (
              <div style={{
                background: 'rgba(255, 215, 0, 0.1)',
                borderRadius: '12px',
                padding: '14px',
                marginBottom: '20px',
                border: '1px solid rgba(255, 215, 0, 0.3)',
              }}>
                <span style={{ color: '#B8C7DC', fontSize: '13px' }}>Next Rank: </span>
                <span style={{ fontSize: '14px' }}>
                  {Array(salaryRankInfo.next_rank_info.stars).fill('⭐').join('')}
                </span>
                <span style={{ color: '#FFFFFF', fontWeight: 600 }}> {salaryRankInfo.next_rank_info.name}</span>
                <span style={{ color: '#FFD700', fontWeight: 700 }}> - Reward ${salaryRankInfo.next_rank_info.reward}</span>
                {salaryRankInfo.next_rank_info.daily_salary > 0 && (
                  <span style={{ color: '#00E676', fontWeight: 600 }}> + ${salaryRankInfo.next_rank_info.daily_salary}/day</span>
                )}
              </div>
            )}

            {/* All Ranks List */}
            <div>
              <h4 style={{ color: '#FFFFFF', fontSize: '16px', fontWeight: 700, marginBottom: '12px' }}>All Salary Ranks</h4>
              <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
                {Object.entries(salaryRankInfo.all_ranks || {}).map(([rankId, rank]) => {
                  const isExpanded = expandedRank === parseInt(rankId);
                  const isAchieved = parseInt(rankId) <= salaryRankInfo.current_rank;
                  
                  // Calculate progress percentages
                  const selfProgress = Math.min((salaryRankInfo.self_investment / rank.self_investment) * 100, 100);
                  const powerProgress = Math.min((salaryRankInfo.power_leg / rank.power_leg) * 100, 100);
                  const weakerProgress = Math.min((salaryRankInfo.weaker_leg / rank.weaker_leg) * 100, 100);
                  
                  return (
                    <div key={rankId}>
                      {/* Rank Header - Clickable */}
                      <div 
                        onClick={() => setExpandedRank(isExpanded ? null : parseInt(rankId))}
                        style={{
                          background: isAchieved 
                            ? 'rgba(0, 200, 83, 0.15)'
                            : 'rgba(6, 37, 68, 0.6)',
                          borderRadius: isExpanded ? '12px 12px 0 0' : '12px',
                          padding: '14px 16px',
                          display: 'flex',
                          justifyContent: 'space-between',
                          alignItems: 'center',
                          cursor: 'pointer',
                          border: `1px solid ${isAchieved ? 'rgba(0, 200, 83, 0.5)' : 'rgba(23, 77, 117, 0.5)'}`,
                          borderBottom: isExpanded ? 'none' : undefined,
                        }}
                      >
                        <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                          <span style={{ fontSize: '14px' }}>{Array(rank.stars).fill('⭐').join('')}</span>
                          <span style={{ color: isAchieved ? '#00E676' : '#FFFFFF', fontWeight: 600 }}>{rank.name}</span>
                          {isAchieved && <span style={{ color: '#00E676', fontSize: '12px' }}>✓</span>}
                        </div>
                        <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                          <div style={{ textAlign: 'right' }}>
                            <div style={{ color: '#16E0FF', fontSize: '13px', fontWeight: 700 }}>Reward ${rank.reward}</div>
                            {rank.daily_salary > 0 && (
                              <div style={{ color: '#00E676', fontSize: '11px', fontWeight: 600 }}>+${rank.daily_salary}/day</div>
                            )}
                          </div>
                          {isExpanded ? <ChevronUp size={18} color="#B8C7DC" /> : <ChevronDown size={18} color="#B8C7DC" />}
                        </div>
                      </div>
                      
                      {/* Expanded Content */}
                      {isExpanded && (
                        <div style={{
                          background: 'rgba(6, 37, 68, 0.4)',
                          border: '1px solid rgba(23, 77, 117, 0.5)',
                          borderTop: 'none',
                          borderRadius: '0 0 12px 12px',
                          padding: '14px',
                        }}>
                          {/* Self Deposit */}
                          <div style={{
                            background: 'rgba(147, 112, 219, 0.15)',
                            border: '2px solid #9370DB',
                            borderRadius: '10px',
                            padding: '12px',
                            marginBottom: '10px',
                          }}>
                            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '8px' }}>
                              <span style={{ color: '#9370DB', fontWeight: 600, fontSize: '14px' }}>💰 Self Deposit</span>
                              <span style={{ color: '#FFFFFF', fontWeight: 700 }}>
                                ${salaryRankInfo.self_investment?.toFixed(0)} / ${rank.self_investment}
                              </span>
                            </div>
                            <div style={{
                              background: 'rgba(0, 0, 0, 0.3)',
                              borderRadius: '10px',
                              height: '10px',
                              overflow: 'hidden',
                            }}>
                              <div style={{
                                width: `${selfProgress}%`,
                                height: '100%',
                                background: 'linear-gradient(90deg, #9370DB, #BA55D3)',
                                borderRadius: '10px',
                              }} />
                            </div>
                            <div style={{ textAlign: 'right', marginTop: '4px' }}>
                              <span style={{ color: '#B8C7DC', fontSize: '11px' }}>{selfProgress.toFixed(0)}%</span>
                            </div>
                          </div>
                          
                          {/* Two Column Layout for Legs */}
                          <div style={{ display: 'flex', gap: '10px' }}>
                            {/* Strong Leg */}
                            <div style={{
                              flex: 1,
                              background: 'rgba(0, 200, 83, 0.15)',
                              border: '2px solid #00C853',
                              borderRadius: '10px',
                              padding: '10px',
                            }}>
                              <div style={{ textAlign: 'center', marginBottom: '6px' }}>
                                <span style={{ color: '#00C853', fontWeight: 600, fontSize: '12px' }}>💪 Strong Leg</span>
                              </div>
                              <div style={{ textAlign: 'center', marginBottom: '8px' }}>
                                <span style={{ color: '#FFFFFF', fontWeight: 700, fontSize: '14px' }}>
                                  ${salaryRankInfo.power_leg?.toFixed(0)}
                                </span>
                                <span style={{ color: '#B8C7DC', fontSize: '11px' }}> / ${rank.power_leg?.toLocaleString()}</span>
                              </div>
                              <div style={{
                                background: 'rgba(0, 0, 0, 0.3)',
                                borderRadius: '8px',
                                height: '8px',
                                overflow: 'hidden',
                              }}>
                                <div style={{
                                  width: `${powerProgress}%`,
                                  height: '100%',
                                  background: 'linear-gradient(90deg, #00C853, #00E676)',
                                  borderRadius: '8px',
                                }} />
                              </div>
                              <div style={{ textAlign: 'center', marginTop: '4px' }}>
                                <span style={{ color: '#B8C7DC', fontSize: '10px' }}>{powerProgress.toFixed(0)}%</span>
                              </div>
                            </div>
                            
                            {/* Weaker Leg */}
                            <div style={{
                              flex: 1,
                              background: 'rgba(255, 152, 0, 0.15)',
                              border: '2px solid #FF9800',
                              borderRadius: '10px',
                              padding: '10px',
                            }}>
                              <div style={{ textAlign: 'center', marginBottom: '6px' }}>
                                <span style={{ color: '#FF9800', fontWeight: 600, fontSize: '12px' }}>🦿 Weaker Leg</span>
                              </div>
                              <div style={{ textAlign: 'center', marginBottom: '8px' }}>
                                <span style={{ color: '#FFFFFF', fontWeight: 700, fontSize: '14px' }}>
                                  ${salaryRankInfo.weaker_leg?.toFixed(0)}
                                </span>
                                <span style={{ color: '#B8C7DC', fontSize: '11px' }}> / ${rank.weaker_leg?.toLocaleString()}</span>
                              </div>
                              <div style={{
                                background: 'rgba(0, 0, 0, 0.3)',
                                borderRadius: '8px',
                                height: '8px',
                                overflow: 'hidden',
                              }}>
                                <div style={{
                                  width: `${weakerProgress}%`,
                                  height: '100%',
                                  background: 'linear-gradient(90deg, #FF9800, #FFB74D)',
                                  borderRadius: '8px',
                                }} />
                              </div>
                              <div style={{ textAlign: 'center', marginTop: '4px' }}>
                                <span style={{ color: '#B8C7DC', fontSize: '10px' }}>{weakerProgress.toFixed(0)}%</span>
                              </div>
                            </div>
                          </div>
                        </div>
                      )}
                    </div>
                  );
                })}
              </div>
            </div>
          </div>
        ) : (
          <div style={{
            textAlign: 'center',
            padding: '60px 20px',
            color: '#B8C7DC',
          }}>
            <Trophy size={48} color="#6B8299" style={{ marginBottom: '16px' }} />
            <p>No rank information available</p>
          </div>
        )}
      </div>

      {/* CSS for spin animation */}
      <style>{`
        @keyframes spin {
          from { transform: rotate(0deg); }
          to { transform: rotate(360deg); }
        }
        .spin {
          animation: spin 1s linear infinite;
        }
      `}</style>
    </div>
  );
};

export default Rank;
