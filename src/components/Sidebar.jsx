import React from 'react';
import { LayoutDashboard, Users, FileText, Settings, LogOut, MapPin, ClipboardList, Calendar } from 'lucide-react';
import { Link, useLocation } from 'react-router-dom';

const Sidebar = ({ isOpen }) => {
    const location = useLocation();

    return (
        <aside className={`sidebar ${isOpen ? 'open' : ''}`}>
            <nav className="sidebar-nav">
                <ul>
                    <li className={location.pathname === '/dashboard' ? 'active' : ''}>
                        <Link to="/dashboard">
                            <LayoutDashboard size={20} />
                            <span>Dashboard</span>
                        </Link>
                    </li>
                    <li className={location.pathname === '/attendance-sheet' ? 'active' : ''}>
                        <Link to="/attendance-sheet">
                            <Calendar size={20} />
                            <span>Attendance</span>
                        </Link>
                    </li>
                    <li className={location.pathname === '/attendance-log' ? 'active' : ''}>
                        <Link to="/attendance-log">
                            <ClipboardList size={20} />
                            <span>Daily Logs</span>
                        </Link>
                    </li>

                    <li>
                        <Link to="/employees">
                            <Users size={20} />
                            <span>Employees</span>
                        </Link>
                    </li>
                    <li>
                        <Link to="/location-settings">
                            <MapPin size={20} />
                            <span>Location</span>
                        </Link>
                    </li>
                    <li>
                        <Link to="/reports">
                            <FileText size={20} />
                            <span>Reports</span>
                        </Link>
                    </li>
                    <li>
                        <Link to="/profile">
                            <Settings size={20} />
                            <span>Profile</span>
                        </Link>
                    </li>
                </ul>
            </nav>

            <div className="sidebar-footer">
                <button className="logout-btn">
                    <LogOut size={20} />
                    <span>Logout</span>
                </button>
            </div>
        </aside>
    );
};

export default Sidebar;
