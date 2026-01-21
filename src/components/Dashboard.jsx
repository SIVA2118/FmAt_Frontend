import React, { useState, useEffect } from 'react';
import { Users, UserCheck, UserX, Clock, Rocket, Minus, Monitor, Smartphone, X } from 'lucide-react';
import { AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, PieChart, Pie, Cell, Legend } from 'recharts';
import Header from './Header';
import Sidebar from './Sidebar';
import StatsCard from './StatsCard';
import AttendanceStatistics from './AttendanceStatistics';
import dashboardService from '../services/dashboardService';

const Dashboard = () => {
    const [sidebarOpen, setSidebarOpen] = useState(true);
    const [stats, setStats] = useState({
        totalEmployees: 0,
        activeEmployees: 0,
        presentToday: 0,
        absentToday: 0,
        lateArrivals: 0,
        desktopCount: 0,
        mobileCount: 0,
        todayTrend: [],
        inTimeStats: [],
        recentActivity: [],
        recentCheckOuts: []
    });

    // Modal State
    const [modalConfig, setModalConfig] = useState({
        isOpen: false,
        title: '',
        users: [],
        loading: false,
        error: null
    });

    useEffect(() => {
        const fetchStats = async () => {
            try {
                const data = await dashboardService.getStats();
                setStats(data);
            } catch (error) {
                console.error("Error fetching stats:", error);
                setStats(prev => ({ ...prev, error: error.message })); // Store error
            }
        };

        fetchStats();
        // Optional: Set up an interval for live updates
        const interval = setInterval(fetchStats, 60000); // Update every minute
        return () => clearInterval(interval);
    }, []);

    const toggleSidebar = () => {
        setSidebarOpen(!sidebarOpen);
    };

    const handleCardClick = async (category, title) => {
        setModalConfig({ isOpen: true, title, users: [], loading: true, error: null });
        try {
            const users = await dashboardService.getUsersByCategory(category);
            setModalConfig(prev => ({ ...prev, users, loading: false }));
        } catch (error) {
            setModalConfig(prev => ({ ...prev, error: error.message, loading: false }));
        }
    };

    const closeModal = () => {
        setModalConfig({ isOpen: false, title: '', users: [], loading: false, error: null });
    };

    return (
        <div className="dashboard-container">
            <Header toggleSidebar={toggleSidebar} />
            <div className="dashboard-content-wrapper">
                <Sidebar isOpen={sidebarOpen} />
                <main className="main-content fade-in">
                    <div className="page-header">
                        <h2>Dashboard Overview</h2>
                        <div className="date-display">
                            {new Date().toLocaleDateString('en-IN', { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' })}
                        </div>
                    </div>
                    {stats.error && (
                        <div style={{ padding: '10px', backgroundColor: '#ef4444', color: 'white', borderRadius: '8px', marginBottom: '20px' }}>
                            Error loading stats: {stats.error}
                        </div>
                    )}

                    <div className="stats-grid">
                        <StatsCard
                            title="Active Employees"
                            value={`${stats.activeEmployees} / ${stats.totalEmployees}`}
                            icon={Users}
                            color="#8b5cf6"
                            onClick={() => handleCardClick('active_employees', 'Active Employees')}
                        />
                        <StatsCard
                            title="Web Admins"
                            value={stats.desktopCount}
                            icon={Monitor}
                            color="#3b82f6"
                            onClick={() => handleCardClick('web_admins', 'Web Admins')}
                        />
                        <StatsCard
                            title="App Users"
                            value={stats.mobileCount}
                            icon={Smartphone}
                            color="#ec4899"
                            onClick={() => handleCardClick('app_users', 'App Users')}
                        />
                        <StatsCard
                            title="Present Today"
                            value={stats.presentToday}
                            icon={UserCheck}
                            color="#22c55e"
                            trend={2.5}
                            onClick={() => handleCardClick('present_today', 'Present Employees')}
                        />
                        <StatsCard
                            title="Absent"
                            value={stats.absentToday}
                            icon={UserX}
                            color="#ef4444"
                            trend={-1.2}
                            onClick={() => handleCardClick('absent_today', 'Absent Employees')}
                        />
                        <StatsCard
                            title="Late Arrivals"
                            value={stats.lateArrivals}
                            icon={Clock}
                            color="#f59e0b"
                            onClick={() => handleCardClick('late_arrivals', 'Late Arrivals')}
                        />
                    </div>

                    <div className="charts-section">
                        <div className="chart-card">
                            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1rem' }}>
                                <h3 style={{ margin: 0, display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                                    <Rocket size={20} color="#84cc16" />
                                    Today's Trend
                                </h3>
                                <div className="minimize-btn">
                                    <Minus size={20} color="#ffffff" style={{ backgroundColor: 'rgba(132, 204, 22, 0.2)', borderRadius: '4px', padding: '2px' }} />
                                </div>
                            </div>
                            <div className="chart-container">
                                <ResponsiveContainer width="100%" height={300}>
                                    <AreaChart data={stats.todayTrend}>
                                        <defs>
                                            <linearGradient id="colorPresent" x1="0" y1="0" x2="0" y2="1">
                                                <stop offset="5%" stopColor="#84cc16" stopOpacity={0.3} />
                                                <stop offset="95%" stopColor="#84cc16" stopOpacity={0} />
                                            </linearGradient>
                                        </defs>
                                        <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="rgba(255,255,255,0.1)" />
                                        <XAxis dataKey="name" axisLine={false} tickLine={false} tick={{ fill: '#94a3b8' }} />
                                        <YAxis axisLine={false} tickLine={false} tick={{ fill: '#94a3b8' }} />
                                        <Tooltip
                                            contentStyle={{
                                                backgroundColor: 'rgba(17, 24, 39, 0.9)',
                                                borderRadius: '8px',
                                                border: '1px solid rgba(255,255,255,0.1)',
                                                boxShadow: '0 4px 6px -1px rgb(0 0 0 / 0.5)',
                                                color: '#f3f4f6'
                                            }}
                                            itemStyle={{ color: '#84cc16' }}
                                        />
                                        <Area type="monotone" dataKey="present" stroke="#84cc16" strokeWidth={2} fillOpacity={1} fill="url(#colorPresent)" dot={{ fill: '#84cc16', r: 4 }} activeDot={{ r: 6 }} />
                                    </AreaChart>
                                </ResponsiveContainer>
                            </div>
                        </div>

                        {/* New In-Time Statistics Pie Chart */}
                        <div className="chart-card">
                            <h3>Today's In-Time Statistics</h3>
                            <div className="chart-container">
                                <ResponsiveContainer width="100%" height={300}>
                                    <PieChart>
                                        <Pie
                                            data={stats.inTimeStats && stats.inTimeStats.length > 0 ? stats.inTimeStats : [{ name: 'No Data', value: 1, fill: '#1f2937' }]}
                                            cx="50%"
                                            cy="50%"
                                            innerRadius={60}
                                            outerRadius={100}
                                            paddingAngle={5}
                                            dataKey="value"
                                            label={({ name, percent }) => percent > 0 ? `${(percent * 100).toFixed(0)}%` : ''}
                                            stroke="none"
                                        >
                                            {stats.inTimeStats && stats.inTimeStats.map((entry, index) => (
                                                <Cell key={`cell-${index}`} fill={entry.fill} />
                                            ))}
                                        </Pie>
                                        <Tooltip
                                            contentStyle={{
                                                backgroundColor: 'rgba(17, 24, 39, 0.9)',
                                                borderRadius: '8px',
                                                border: '1px solid rgba(255,255,255,0.1)',
                                                color: '#f3f4f6'
                                            }}
                                        />
                                        <Legend wrapperStyle={{ color: '#94a3b8' }} />
                                    </PieChart>
                                </ResponsiveContainer>
                            </div>
                        </div>

                        {/* Detailed Attendance Statistics Card */}
                        <AttendanceStatistics />

                        <div style={{ gridColumn: '1 / -1', display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(300px, 1fr))', gap: '1.5rem' }}>
                            <div className="recent-activity-card">
                                <h3>Today's Check-ins</h3>
                                <div className="activity-list">
                                    {stats.recentActivity && stats.recentActivity.length > 0 ? (
                                        stats.recentActivity.map((item) => (
                                            <div key={item._id} className="activity-item">
                                                <div className="user-avatar-sm"></div>
                                                <div className="activity-details">
                                                    <p className="user-name-sm">{item.employeeId ? item.employeeId.name : 'Unknown Employee'}</p>
                                                    <p className="check-time">Checked in at {new Date(item.checkIn).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}</p>
                                                </div>
                                                <span className="status-badge on-time">
                                                    {item.checkInLocation ? 'Verified' : 'Pending'}
                                                </span>
                                            </div>
                                        ))
                                    ) : (
                                        <p style={{ color: '#94a3b8', textAlign: 'center' }}>No recent activity today</p>
                                    )}
                                </div>
                            </div>

                            <div className="recent-activity-card">
                                <h3>Today's Check-outs</h3>
                                <div className="activity-list">
                                    {stats.recentCheckOuts && stats.recentCheckOuts.length > 0 ? (
                                        stats.recentCheckOuts.map((item) => (
                                            <div key={item._id} className="activity-item">
                                                <div className="user-avatar-sm" style={{ backgroundColor: '#f59e0b' }}></div>
                                                <div className="activity-details">
                                                    <p className="user-name-sm">{item.employeeId ? item.employeeId.name : 'Unknown Employee'}</p>
                                                    <p className="check-time">Checked out at {new Date(item.checkOut).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}</p>
                                                </div>
                                                <span className="status-badge on-time">
                                                    Completed
                                                </span>
                                            </div>
                                        ))
                                    ) : (
                                        <p style={{ color: '#94a3b8', textAlign: 'center' }}>No recent check-outs today</p>
                                    )}
                                </div>
                            </div>
                        </div>
                    </div>
                </main>

                {/* User Details Modal */}
                {modalConfig.isOpen && (
                    <div style={{
                        position: 'fixed',
                        top: 0,
                        left: 0,
                        right: 0,
                        bottom: 0,
                        backgroundColor: 'rgba(0, 0, 0, 0.6)',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        zIndex: 1000,
                        backdropFilter: 'blur(4px)'
                    }} onClick={closeModal}>
                        <div style={{
                            backgroundColor: '#1f2937', // Fallback
                            background: 'rgba(17, 24, 39, 0.8)',
                            backdropFilter: 'blur(16px)',
                            border: '1px solid rgba(255, 255, 255, 0.1)',
                            borderRadius: '16px',
                            width: '90%',
                            maxWidth: '500px',
                            maxHeight: '80vh',
                            display: 'flex',
                            flexDirection: 'column',
                            boxShadow: '0 25px 50px -12px rgba(0, 0, 0, 0.5)'
                        }} onClick={e => e.stopPropagation()}>

                            {/* Header */}
                            <div style={{
                                padding: '1.5rem',
                                borderBottom: '1px solid rgba(255, 255, 255, 0.1)',
                                display: 'flex',
                                justifyContent: 'space-between',
                                alignItems: 'center'
                            }}>
                                <h3 style={{ margin: 0, color: '#f3f4f6', fontSize: '1.25rem' }}>{modalConfig.title}</h3>
                                <button
                                    onClick={closeModal}
                                    style={{
                                        background: 'transparent',
                                        border: 'none',
                                        color: '#94a3b8',
                                        cursor: 'pointer',
                                        padding: '4px',
                                        display: 'flex',
                                        alignItems: 'center',
                                        justifyContent: 'center'
                                    }}
                                >
                                    <X size={24} />
                                </button>
                            </div>

                            {/* Content */}
                            <div style={{ padding: '1.5rem', overflowY: 'auto' }}>
                                {modalConfig.loading ? (
                                    <div style={{ textAlign: 'center', color: '#94a3b8', padding: '2rem' }}>Loading...</div>
                                ) : modalConfig.error ? (
                                    <div style={{ color: '#ef4444', textAlign: 'center' }}>{modalConfig.error}</div>
                                ) : modalConfig.users.length === 0 ? (
                                    <div style={{ textAlign: 'center', color: '#94a3b8', padding: '1rem' }}>No users found for this category.</div>
                                ) : (
                                    <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
                                        {modalConfig.users.map((user, index) => (
                                            <div key={user._id || index} style={{
                                                display: 'flex',
                                                alignItems: 'center',
                                                gap: '12px',
                                                padding: '12px',
                                                backgroundColor: 'rgba(255, 255, 255, 0.05)',
                                                borderRadius: '8px',
                                                border: '1px solid rgba(255, 255, 255, 0.05)'
                                            }}>
                                                <div style={{
                                                    width: '40px',
                                                    height: '40px',
                                                    borderRadius: '50%',
                                                    background: 'linear-gradient(135deg, rgba(59, 130, 246, 0.5) 0%, rgba(139, 92, 246, 0.5) 100%)',
                                                    display: 'flex',
                                                    alignItems: 'center',
                                                    justifyContent: 'center',
                                                    color: 'white',
                                                    fontWeight: 'bold'
                                                }}>
                                                    {user.name ? user.name.charAt(0).toUpperCase() : '?'}
                                                </div>
                                                <div style={{ flex: 1 }}>
                                                    <div style={{ color: '#f3f4f6', fontWeight: '500' }}>{user.name}</div>
                                                    <div style={{ color: '#94a3b8', fontSize: '0.875rem' }}>{user.email}</div>
                                                    {user.checkIn && (
                                                        <div style={{ color: '#22c55e', fontSize: '0.75rem', marginTop: '2px' }}>
                                                            Checked in: {new Date(user.checkIn).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                                                        </div>
                                                    )}
                                                </div>
                                            </div>
                                        ))}
                                    </div>
                                )}
                            </div>
                        </div>
                    </div>
                )}
            </div>
        </div>
    );
};

export default Dashboard;
