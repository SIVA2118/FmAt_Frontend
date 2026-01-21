import React, { useState, useEffect } from 'react';
import Header from '../components/Header';
import Sidebar from '../components/Sidebar';
import authService from '../services/authService';
import { User, Mail, Shield, Building } from 'lucide-react';

const Profile = () => {
    const [sidebarOpen, setSidebarOpen] = useState(true);
    const [user, setUser] = useState(null);

    useEffect(() => {
        const currentUser = authService.getCurrentUser();
        setUser(currentUser);
    }, []);

    const toggleSidebar = () => {
        setSidebarOpen(!sidebarOpen);
    };

    if (!user) {
        return (
            <div className="dashboard-container">
                <Header toggleSidebar={toggleSidebar} />
                <div className="dashboard-content-wrapper">
                    <Sidebar isOpen={sidebarOpen} />
                    <main className="main-content fade-in" style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', height: '100%' }}>
                        <div style={{ color: 'var(--text-secondary)' }}>Loading profile...</div>
                    </main>
                </div>
            </div>
        );
    }

    return (
        <div className="dashboard-container">
            <Header toggleSidebar={toggleSidebar} />
            <div className="dashboard-content-wrapper">
                <Sidebar isOpen={sidebarOpen} />
                <main className="main-content fade-in">
                    <div className="page-header">
                        <div>
                            <h2>My Profile</h2>
                            <p className="sub-header" style={{ margin: '0.25rem 0 0 0', textTransform: 'none', color: 'var(--text-secondary)' }}>
                                Manage your account settings and preferences.
                            </p>
                        </div>
                        <div className="date-display">
                            {new Date().toLocaleDateString('en-IN', { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' })}
                        </div>
                    </div>

                    <div className="glass-panel" style={{
                        borderRadius: '16px',
                        padding: '2.5rem',
                        maxWidth: '800px',
                        margin: '0 auto',
                        position: 'relative',
                        overflow: 'hidden'
                    }}>
                        {/* Decorative background element */}
                        <div style={{
                            position: 'absolute',
                            top: '-10%',
                            right: '-5%',
                            width: '300px',
                            height: '300px',
                            background: 'radial-gradient(circle, rgba(168, 85, 247, 0.15) 0%, rgba(168, 85, 247, 0) 70%)',
                            borderRadius: '50%',
                            zIndex: 0
                        }} />

                        <div className="profile-header" style={{
                            display: 'flex',
                            alignItems: 'center',
                            gap: '2rem',
                            marginBottom: '2.5rem',
                            borderBottom: '1px solid var(--glass-border)',
                            paddingBottom: '2.5rem',
                            position: 'relative',
                            zIndex: 1
                        }}>
                            <div className="profile-avatar-large" style={{
                                width: '120px',
                                height: '120px',
                                background: 'linear-gradient(135deg, rgba(59, 130, 246, 0.2) 0%, rgba(139, 92, 246, 0.2) 100%)',
                                borderRadius: '50%',
                                display: 'flex',
                                alignItems: 'center',
                                justifyContent: 'center',
                                color: 'var(--primary-blue)',
                                border: '4px solid rgba(255, 255, 255, 0.05)',
                                boxShadow: '0 8px 32px rgba(0, 0, 0, 0.2)'
                            }}>
                                <User size={56} />
                            </div>
                            <div>
                                <h3 style={{ margin: '0 0 0.75rem 0', fontSize: '1.75rem', fontWeight: 'bold', color: 'var(--text-primary)' }}>{user.name}</h3>
                                <div style={{ display: 'flex', gap: '0.75rem', flexWrap: 'wrap' }}>
                                    <span style={{
                                        background: 'rgba(59, 130, 246, 0.1)',
                                        color: '#60a5fa',
                                        padding: '0.35rem 1rem',
                                        borderRadius: '9999px',
                                        fontSize: '0.875rem',
                                        fontWeight: '500',
                                        border: '1px solid rgba(59, 130, 246, 0.2)'
                                    }}>
                                        {user.role}
                                    </span>
                                </div>
                            </div>
                        </div>

                        <div className="profile-details-grid" style={{
                            display: 'grid',
                            gridTemplateColumns: 'repeat(auto-fit, minmax(300px, 1fr))',
                            gap: '1.5rem',
                            position: 'relative',
                            zIndex: 1
                        }}>
                            <div className="detail-item">
                                <label style={{ display: 'block', fontSize: '0.875rem', color: 'var(--text-secondary)', marginBottom: '0.5rem', fontWeight: '500' }}>Full Name</label>
                                <div style={{ display: 'flex', alignItems: 'center', gap: '1rem', fontSize: '1rem', color: 'var(--text-primary)', padding: '1rem', backgroundColor: 'rgba(255, 255, 255, 0.03)', borderRadius: '12px', border: '1px solid var(--glass-border)' }}>
                                    <User size={20} color="#94a3b8" />
                                    {user.name}
                                </div>
                            </div>

                            <div className="detail-item">
                                <label style={{ display: 'block', fontSize: '0.875rem', color: 'var(--text-secondary)', marginBottom: '0.5rem', fontWeight: '500' }}>Email Address</label>
                                <div style={{ display: 'flex', alignItems: 'center', gap: '1rem', fontSize: '1rem', color: 'var(--text-primary)', padding: '1rem', backgroundColor: 'rgba(255, 255, 255, 0.03)', borderRadius: '12px', border: '1px solid var(--glass-border)' }}>
                                    <Mail size={20} color="#94a3b8" />
                                    {user.email}
                                </div>
                            </div>

                            <div className="detail-item">
                                <label style={{ display: 'block', fontSize: '0.875rem', color: 'var(--text-secondary)', marginBottom: '0.5rem', fontWeight: '500' }}>Role</label>
                                <div style={{ display: 'flex', alignItems: 'center', gap: '1rem', fontSize: '1rem', color: 'var(--text-primary)', padding: '1rem', backgroundColor: 'rgba(255, 255, 255, 0.03)', borderRadius: '12px', border: '1px solid var(--glass-border)' }}>
                                    <Shield size={20} color="#94a3b8" />
                                    {user.role}
                                </div>
                            </div>

                            <div className="detail-item">
                                <label style={{ display: 'block', fontSize: '0.875rem', color: 'var(--text-secondary)', marginBottom: '0.5rem', fontWeight: '500' }}>Organization</label>
                                <div style={{ display: 'flex', alignItems: 'center', gap: '1rem', fontSize: '1rem', color: 'var(--text-primary)', padding: '1rem', backgroundColor: 'rgba(255, 255, 255, 0.03)', borderRadius: '12px', border: '1px solid var(--glass-border)' }}>
                                    <Building size={20} color="#94a3b8" />
                                    Flarmainds technologie
                                </div>
                            </div>
                        </div>
                    </div>
                </main>
            </div>
        </div>
    );
};

export default Profile;
