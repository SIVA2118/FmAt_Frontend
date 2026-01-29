import React, { useState, useEffect } from 'react';
import Header from '../components/Header';
import Sidebar from '../components/Sidebar';
import dashboardService from '../services/dashboardService';
import { Clock, CheckCircle, X, MapPin, Monitor, Smartphone, User, Search, Calendar } from 'lucide-react';

const AttendanceLog = () => {
    const [sidebarOpen, setSidebarOpen] = useState(true);
    const [logs, setLogs] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);
    const [selectedLog, setSelectedLog] = useState(null);

    const [selectedDate, setSelectedDate] = useState(() => {
        const now = new Date();
        const offset = now.getTimezoneOffset();
        const localDate = new Date(now.getTime() - (offset * 60 * 1000));
        return localDate.toISOString().split('T')[0];
    });
    const [searchTerm, setSearchTerm] = useState('');

    useEffect(() => {
        const fetchLogs = async () => {
            try {
                const data = await dashboardService.getDailyLogs(selectedDate);
                setLogs(data);
                setLoading(false);
            } catch (err) {
                setError(err.message);
                setLoading(false);
            }
        };

        fetchLogs();
        const interval = setInterval(fetchLogs, 30000); // Live update every 30s
        return () => clearInterval(interval);
    }, [selectedDate]);

    // Derived states based on logs and filters
    const filteredLogs = logs.filter(log => {
        const term = searchTerm.toLowerCase();
        const empName = log.employeeId?.name?.toLowerCase() || '';
        const empId = log.employeeId?._id?.toLowerCase() || '';
        return empName.includes(term) || empId.includes(term);
    });

    const toggleSidebar = () => {
        setSidebarOpen(!sidebarOpen);
    };

    const checkIns = filteredLogs;
    const checkOuts = filteredLogs.filter(log => log.checkOut);

    const getImageUrl = (path) => {
        if (!path) return '';
        if (path.startsWith('data:') || path.startsWith('http')) return path;
        return `https://fmat-backend.onrender.com/${path.replace(/\\/g, '/')}`;
    };

    return (
        <div className="dashboard-container">
            <Header toggleSidebar={toggleSidebar} />
            <div className="dashboard-content-wrapper">
                <Sidebar isOpen={sidebarOpen} />
                <main className="main-content fade-in">
                    <div className="page-header" style={{ marginBottom: '2rem', display: 'flex', flexDirection: 'column', gap: '1rem', alignItems: 'flex-start' }}>
                        <div style={{ width: '100%', display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '1rem' }}>
                            <div>
                                <h2 style={{ fontSize: '1.5rem', fontWeight: '600', color: '#f3f4f6', margin: 0 }}>Daily Attendance Log</h2>
                                <p className="page-subtitle" style={{ color: '#94a3b8', margin: 0 }}>Monitor Check-ins and Check-outs</p>
                            </div>

                            <div style={{ display: 'flex', gap: '10px', alignItems: 'center' }}>
                                {/* Date Switcher */}
                                <div className="glass-panel" style={{ padding: '0.5rem', borderRadius: '8px', display: 'flex', alignItems: 'center', gap: '8px' }}>
                                    <Calendar size={18} color="#94a3b8" />
                                    <input
                                        type="date"
                                        value={selectedDate}
                                        onChange={(e) => setSelectedDate(e.target.value)}
                                        style={{
                                            background: 'transparent',
                                            border: 'none',
                                            color: 'var(--text-primary)',
                                            fontWeight: '600',
                                            outline: 'none',
                                            cursor: 'pointer',
                                            fontFamily: 'inherit'
                                        }}
                                    />
                                </div>
                            </div>
                        </div>

                        {/* Search Filter */}
                        <div style={{ width: '100%', display: 'flex', alignItems: 'center' }}>
                            <div className="glass-input-container" style={{ flex: 1, maxWidth: '400px', display: 'flex', alignItems: 'center', padding: '0.6rem 1rem', background: 'rgba(255, 255, 255, 0.05)', borderRadius: '8px', border: '1px solid rgba(255, 255, 255, 0.1)' }}>
                                <Search size={18} style={{ color: 'var(--text-secondary)', marginRight: '0.5rem' }} />
                                <input
                                    type="text"
                                    placeholder="Search by Name or ID..."
                                    value={searchTerm}
                                    onChange={(e) => setSearchTerm(e.target.value)}
                                    style={{
                                        background: 'transparent',
                                        border: 'none',
                                        color: '#f3f4f6',
                                        width: '100%',
                                        outline: 'none'
                                    }}
                                />
                            </div>
                        </div>
                    </div>

                    {loading ? (
                        <div style={{ textAlign: 'center', color: '#94a3b8' }}>Loading...</div>
                    ) : error ? (
                        <div style={{ color: '#ef4444' }}>Error: {error}</div>
                    ) : (
                        <div style={{
                            display: 'grid',
                            gridTemplateColumns: 'repeat(auto-fit, minmax(300px, 1fr))',
                            gap: '1.5rem'
                        }}>
                            {/* Check-ins Column */}
                            <div className="recent-activity-card">
                                <div style={{ display: 'flex', alignItems: 'center', gap: '10px', marginBottom: '1.5rem' }}>
                                    <div style={{ padding: '8px', borderRadius: '8px', backgroundColor: 'rgba(34, 197, 94, 0.2)', color: '#22c55e' }}>
                                        <Clock size={24} />
                                    </div>
                                    <h3 style={{ margin: 0 }}>On-Time Check-ins ({checkIns.length})</h3>
                                </div>

                                <div className="activity-list" style={{ maxHeight: 'calc(100vh - 250px)', overflowY: 'auto' }}>
                                    {checkIns.length > 0 ? (
                                        checkIns.map((log) => (
                                            <div
                                                key={log._id}
                                                className="activity-item"
                                                onClick={() => setSelectedLog(log)}
                                                style={{ cursor: 'pointer', transition: 'background-color 0.2s' }}
                                                onMouseEnter={(e) => e.currentTarget.style.backgroundColor = 'rgba(255,255,255,0.05)'}
                                                onMouseLeave={(e) => e.currentTarget.style.backgroundColor = 'transparent'}
                                            >
                                                <div className="user-avatar-sm" style={{
                                                    backgroundImage: log.employeeId && log.employeeId.profileImage ? `url(${log.employeeId.profileImage})` : 'none',
                                                    backgroundSize: 'cover'
                                                }}>
                                                    {!log.employeeId?.profileImage && (log.employeeId?.name?.charAt(0) || '?')}
                                                </div>
                                                <div className="activity-details">
                                                    <p className="user-name-sm">{log.employeeId ? log.employeeId.name : 'Unknown'}</p>
                                                    <p className="check-time" style={{ color: '#94a3b8' }}>
                                                        {log.employeeId?.department} • {log.employeeId?.designation}
                                                    </p>
                                                </div>
                                                <div style={{ textAlign: 'right' }}>
                                                    <div style={{ fontWeight: 'bold', color: '#f3f4f6' }}>
                                                        {new Date(log.checkIn).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                                                    </div>
                                                    <span className="status-badge on-time">
                                                        In
                                                    </span>
                                                </div>
                                            </div>
                                        ))
                                    ) : (
                                        <p style={{ textAlign: 'center', color: '#64748b' }}>No check-ins today yet.</p>
                                    )}
                                </div>
                            </div>

                            {/* Check-outs Column */}
                            <div className="recent-activity-card">
                                <div style={{ display: 'flex', alignItems: 'center', gap: '10px', marginBottom: '1.5rem' }}>
                                    <div style={{ padding: '8px', borderRadius: '8px', backgroundColor: 'rgba(234, 179, 8, 0.2)', color: '#eab308' }}>
                                        <CheckCircle size={24} />
                                    </div>
                                    <h3 style={{ margin: 0 }}>Completed Check-outs ({checkOuts.length})</h3>
                                </div>

                                <div className="activity-list" style={{ maxHeight: 'calc(100vh - 250px)', overflowY: 'auto' }}>
                                    {checkOuts.length > 0 ? (
                                        checkOuts.map((log) => (
                                            <div
                                                key={log._id + '_out'}
                                                className="activity-item"
                                                onClick={() => setSelectedLog(log)}
                                                style={{ cursor: 'pointer', transition: 'background-color 0.2s' }}
                                                onMouseEnter={(e) => e.currentTarget.style.backgroundColor = 'rgba(255,255,255,0.05)'}
                                                onMouseLeave={(e) => e.currentTarget.style.backgroundColor = 'transparent'}
                                            >
                                                <div className="user-avatar-sm" style={{
                                                    backgroundImage: log.employeeId && log.employeeId.profileImage ? `url(${log.employeeId.profileImage})` : 'none',
                                                    backgroundSize: 'cover',
                                                    backgroundColor: '#f59e0b'
                                                }}>
                                                    {!log.employeeId?.profileImage && (log.employeeId?.name?.charAt(0) || '?')}
                                                </div>
                                                <div className="activity-details">
                                                    <p className="user-name-sm">{log.employeeId ? log.employeeId.name : 'Unknown'}</p>
                                                    <p className="check-time" style={{ color: '#94a3b8' }}>
                                                        {log.employeeId?.department}
                                                    </p>
                                                </div>
                                                <div style={{ textAlign: 'right' }}>
                                                    <div style={{ fontWeight: 'bold', color: '#f3f4f6' }}>
                                                        {new Date(log.checkOut).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                                                    </div>
                                                    <span className="status-badge" style={{ backgroundColor: 'rgba(234, 179, 8, 0.2)', color: '#eab308', border: '1px solid rgba(234,179,8,0.3)' }}>
                                                        Out
                                                    </span>
                                                </div>
                                            </div>
                                        ))
                                    ) : (
                                        <p style={{ textAlign: 'center', color: '#64748b' }}>No check-outs today yet.</p>
                                    )}
                                </div>
                            </div>
                        </div>
                    )}
                </main>

                {/* Details Modal */}
                {selectedLog && (
                    <div className="modal-overlay" style={{
                        position: 'fixed', top: 0, left: 0, right: 0, bottom: 0,
                        backgroundColor: 'rgba(0, 0, 0, 0.7)', backdropFilter: 'blur(4px)',
                        display: 'flex', justifyContent: 'center', alignItems: 'center', zIndex: 1000
                    }}>
                        <div className="modal-content glass-panel" style={{
                            width: '90%', maxWidth: '700px', maxHeight: '90vh', overflowY: 'auto',
                            padding: '0', borderRadius: '16px', position: 'relative'
                        }}>
                            <div className="modal-header" style={{
                                padding: '1.5rem', borderBottom: '1px solid rgba(255,255,255,0.1)',
                                display: 'flex', justifyContent: 'space-between', alignItems: 'center'
                            }}>
                                <div style={{ display: 'flex', alignItems: 'center', gap: '1rem' }}>
                                    <div style={{
                                        width: '48px', height: '48px', borderRadius: '50%',
                                        backgroundImage: selectedLog.employeeId?.profileImage ? `url(${selectedLog.employeeId.profileImage})` : 'none',
                                        backgroundSize: 'cover', backgroundPosition: 'center',
                                        backgroundColor: '#3b82f6', display: 'flex', alignItems: 'center', justifyContent: 'center',
                                        fontSize: '1.2rem', fontWeight: 'bold'
                                    }}>
                                        {!selectedLog.employeeId?.profileImage && (selectedLog.employeeId?.name?.charAt(0) || '?')}
                                    </div>
                                    <div>
                                        <h3 style={{ margin: 0, fontSize: '1.25rem' }}>{selectedLog.employeeId?.name || 'Unknown User'}</h3>
                                        <p style={{ margin: 0, color: '#94a3b8', fontSize: '0.875rem' }}>
                                            {selectedLog.employeeId?.designation} • {selectedLog.employeeId?.department}
                                        </p>
                                        <p style={{ margin: '0.25rem 0 0 0', color: '#64748b', fontSize: '0.75rem', fontFamily: 'monospace' }}>
                                            ID: {selectedLog.employeeId?._id}
                                        </p>
                                    </div>
                                </div>
                                <button onClick={() => setSelectedLog(null)} style={{ background: 'none', border: 'none', color: '#94a3b8', cursor: 'pointer' }}>
                                    <X size={24} />
                                </button>
                            </div>

                            <div className="modal-body" style={{ padding: '2rem', display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '2rem' }}>
                                {/* Check-in Details */}
                                <div style={{ padding: '1.5rem', backgroundColor: 'rgba(34, 197, 94, 0.05)', borderRadius: '12px', border: '1px solid rgba(34, 197, 94, 0.1)' }}>
                                    <h4 style={{ margin: '0 0 1rem 0', color: '#22c55e', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                                        <Clock size={18} /> Check-In
                                    </h4>
                                    <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
                                        <div>
                                            <span style={{ display: 'block', fontSize: '0.75rem', color: '#94a3b8', marginBottom: '0.25rem' }}>Time</span>
                                            <span style={{ fontSize: '1.1rem', fontWeight: 'bold' }}>
                                                {new Date(selectedLog.checkIn).toLocaleTimeString()}
                                            </span>
                                        </div>
                                        <div>
                                            <span style={{ display: 'block', fontSize: '0.75rem', color: '#94a3b8', marginBottom: '0.25rem' }}>Device</span>
                                            <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                                                {selectedLog.checkInDevice === 'Desktop' ? <Monitor size={16} /> : <Smartphone size={16} />}
                                                {selectedLog.checkInDevice || 'Unknown'}
                                            </div>
                                        </div>
                                        <div>
                                            <span style={{ display: 'block', fontSize: '0.75rem', color: '#94a3b8', marginBottom: '0.25rem' }}>Location</span>
                                            <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', fontSize: '0.9rem' }}>
                                                <MapPin size={16} color="#94a3b8" />
                                                {selectedLog.checkInLocation ?
                                                    `${selectedLog.checkInLocation.latitude?.toFixed(4)}, ${selectedLog.checkInLocation.longitude?.toFixed(4)}`
                                                    : 'No location data'}
                                            </div>
                                        </div>
                                        {selectedLog.checkInPhoto && (
                                            <div>
                                                <span style={{ display: 'block', fontSize: '0.75rem', color: '#94a3b8', marginBottom: '0.5rem' }}>Photo Verification</span>
                                                <div style={{
                                                    width: '100%', height: '150px', borderRadius: '8px',
                                                    backgroundImage: `url(${getImageUrl(selectedLog.checkInPhoto)})`,
                                                    backgroundSize: 'cover', backgroundPosition: 'center',
                                                    border: '1px solid rgba(255,255,255,0.1)'
                                                }} />
                                            </div>
                                        )}
                                    </div>
                                </div>

                                {/* Check-out Details */}
                                <div style={{ padding: '1.5rem', backgroundColor: 'rgba(234, 179, 8, 0.05)', borderRadius: '12px', border: '1px solid rgba(234, 179, 8, 0.1)' }}>
                                    <h4 style={{ margin: '0 0 1rem 0', color: '#eab308', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                                        <CheckCircle size={18} /> Check-Out
                                    </h4>
                                    {selectedLog.checkOut ? (
                                        <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
                                            <div>
                                                <span style={{ display: 'block', fontSize: '0.75rem', color: '#94a3b8', marginBottom: '0.25rem' }}>Time</span>
                                                <span style={{ fontSize: '1.1rem', fontWeight: 'bold' }}>
                                                    {new Date(selectedLog.checkOut).toLocaleTimeString()}
                                                </span>
                                            </div>
                                            <div>
                                                <span style={{ display: 'block', fontSize: '0.75rem', color: '#94a3b8', marginBottom: '0.25rem' }}>Device</span>
                                                <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                                                    {selectedLog.checkOutDevice === 'Desktop' ? <Monitor size={16} /> : <Smartphone size={16} />}
                                                    {selectedLog.checkOutDevice || 'Unknown'}
                                                </div>
                                            </div>
                                            <div>
                                                <span style={{ display: 'block', fontSize: '0.75rem', color: '#94a3b8', marginBottom: '0.25rem' }}>Location</span>
                                                <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', fontSize: '0.9rem' }}>
                                                    <MapPin size={16} color="#94a3b8" />
                                                    {selectedLog.checkOutLocation ?
                                                        `${selectedLog.checkOutLocation.latitude?.toFixed(4)}, ${selectedLog.checkOutLocation.longitude?.toFixed(4)}`
                                                        : 'No location data'}
                                                </div>
                                            </div>
                                            {selectedLog.checkOutPhoto && (
                                                <div>
                                                    <span style={{ display: 'block', fontSize: '0.75rem', color: '#94a3b8', marginBottom: '0.5rem' }}>Photo Verification</span>
                                                    <div style={{
                                                        width: '100%', height: '150px', borderRadius: '8px',
                                                        backgroundImage: `url(${getImageUrl(selectedLog.checkOutPhoto)})`,
                                                        backgroundSize: 'cover', backgroundPosition: 'center',
                                                        border: '1px solid rgba(255,255,255,0.1)'
                                                    }} />
                                                </div>
                                            )}
                                        </div>
                                    ) : (
                                        <div style={{ height: '100%', display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#64748b', fontStyle: 'italic' }}>
                                            Not checked out yet
                                        </div>
                                    )}
                                </div>
                            </div>
                        </div>
                    </div>
                )}
            </div>
        </div>
    );
};

export default AttendanceLog;
