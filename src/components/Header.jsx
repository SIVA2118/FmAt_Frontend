import React from 'react';
import { User, Bell, Menu } from 'lucide-react';
import { Link } from 'react-router-dom';
import authService from '../services/authService';

const Header = ({ toggleSidebar }) => {
    const user = authService.getCurrentUser();
    const userName = user ? user.name : 'Admin User';
    const [notificationCount, setNotificationCount] = React.useState(0);

    React.useEffect(() => {
        fetchNotifications();
        const interval = setInterval(fetchNotifications, 30000); // Poll every 30 seconds
        return () => clearInterval(interval);
    }, []);

    const fetchNotifications = async () => {
        try {
            if (!user || !user.token) return;
            const response = await fetch('http://localhost:5000/api/reports/all', {
                headers: {
                    'Authorization': `Bearer ${user.token}`
                }
            });
            const data = await response.json();
            if (response.ok) {
                const pendingCount = data.filter(r => r.status === 'Pending').length;
                setNotificationCount(pendingCount);
            }
        } catch (error) {
            console.error('Error fetching notifications:', error);
        }
    };

    return (
        <header className="header">
            <div className="header-left">
                <button className="menu-btn" onClick={toggleSidebar}>
                    <Menu size={24} />
                </button>
                <div className="logo-container" style={{ display: 'flex', alignItems: 'center', gap: '1rem' }}>
                    <img src="/logo.png" alt="Company Logo" style={{ height: '40px', objectFit: 'contain' }} />
                    <div className="logo-text">
                        <h1 style={{ fontSize: '1.2rem', margin: 0 }}>Flarmainds technologie</h1>
                        <span style={{ fontSize: '0.8rem', opacity: 0.8 }}>Employee Attendance</span>
                    </div>
                </div>
            </div>

            <div className="header-right">
                <Link to="/reports" className="icon-btn" style={{ position: 'relative', textDecoration: 'none', color: 'inherit' }}>
                    <Bell size={20} />
                    {notificationCount > 0 && (
                        <span className="badge" style={{ position: 'absolute', top: '-5px', right: '-5px', backgroundColor: '#ef4444', color: 'white', fontSize: '0.7rem', padding: '2px 6px', borderRadius: '50%' }}>
                            {notificationCount}
                        </span>
                    )}
                </Link>
                <Link to="/profile" className="user-profile">
                    <div className="avatar">
                        <User size={20} />
                    </div>
                    <span className="user-name">{userName}</span>
                </Link>
            </div>
        </header>
    );
};

export default Header;
