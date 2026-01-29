import React, { useState, useEffect } from 'react';
import Header from '../components/Header';
import Sidebar from '../components/Sidebar';
import { Plus, Search, Filter, MoreVertical, Edit, Trash2, User } from 'lucide-react';
import { Link, useNavigate } from 'react-router-dom';

const Employees = () => {
    const [sidebarOpen, setSidebarOpen] = useState(true);
    const [employees, setEmployees] = useState([]);
    const [loading, setLoading] = useState(true);
    const [searchTerm, setSearchTerm] = useState('');
    const navigate = useNavigate();

    const toggleSidebar = () => setSidebarOpen(!sidebarOpen);

    useEffect(() => {
        fetchEmployees();
    }, []);

    const fetchEmployees = async () => {
        try {
            const token = JSON.parse(localStorage.getItem('user'))?.token;
            const response = await fetch('https://fmat-backend.onrender.com/api/admin/employees', {
                headers: {
                    'Authorization': `Bearer ${token}`
                }
            });
            const data = await response.json();
            if (response.ok) {
                setEmployees(data);
            }
        } catch (error) {
            console.error('Error fetching employees:', error);
        } finally {
            setLoading(false);
        }
    };

    const filteredEmployees = employees.filter(emp =>
        emp.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
        emp.email.toLowerCase().includes(searchTerm.toLowerCase()) ||
        (emp.department && emp.department.toLowerCase().includes(searchTerm.toLowerCase())) ||
        emp._id.toLowerCase().includes(searchTerm.toLowerCase())
    );

    return (
        <div className="dashboard-container">
            <Header toggleSidebar={toggleSidebar} />
            <div className="dashboard-content-wrapper">
                <Sidebar isOpen={sidebarOpen} />
                <main className="main-content fade-in">
                    <div className="page-header">
                        <div>
                            <h2>Employees</h2>
                            <p className="sub-header" style={{ margin: '0.25rem 0 0 0', textTransform: 'none', color: 'var(--text-secondary)' }}>
                                Manage your team members and their accounts.
                            </p>
                        </div>
                        <Link
                            to="/create-employee"
                            className="btn-submit"
                            style={{ padding: '0.6rem 1.25rem', textDecoration: 'none', width: 'auto', marginTop: 0 }}
                        >
                            <Plus size={18} />
                            Add Employee
                        </Link>
                    </div>

                    {/* Filters and Search */}
                    <div className="glass-panel" style={{ padding: '1rem', borderRadius: '16px 16px 0 0', borderBottom: '1px solid var(--glass-border)', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                        <div style={{ position: 'relative', width: '300px' }}>
                            <Search size={18} style={{ position: 'absolute', left: '12px', top: '50%', transform: 'translateY(-50%)', color: 'var(--text-secondary)' }} />
                            <input
                                type="text"
                                placeholder="Search employees..."
                                value={searchTerm}
                                onChange={(e) => setSearchTerm(e.target.value)}
                                className="form-input"
                                style={{ paddingLeft: '2.5rem', backgroundColor: 'rgba(17, 24, 39, 0.5)' }}
                            />
                        </div>
                    </div>

                    <div className="glass-panel" style={{ borderRadius: '0 0 16px 16px', borderTop: 'none', overflow: 'hidden' }}>
                        <table style={{ width: '100%', borderCollapse: 'collapse', textAlign: 'left' }}>
                            <thead style={{ backgroundColor: 'rgba(59, 130, 246, 0.1)', borderBottom: '1px solid var(--glass-border)' }}>
                                <tr>
                                    <th style={{ padding: '1rem 1.5rem', fontSize: '0.75rem', fontWeight: '600', color: 'var(--primary-blue)', textTransform: 'uppercase', letterSpacing: '0.05em' }}>ID</th>
                                    <th style={{ padding: '1rem 1.5rem', fontSize: '0.75rem', fontWeight: '600', color: 'var(--primary-blue)', textTransform: 'uppercase', letterSpacing: '0.05em' }}>Name</th>
                                    <th style={{ padding: '1rem 1.5rem', fontSize: '0.75rem', fontWeight: '600', color: 'var(--primary-blue)', textTransform: 'uppercase', letterSpacing: '0.05em' }}>Role/Designation</th>
                                    <th style={{ padding: '1rem 1.5rem', fontSize: '0.75rem', fontWeight: '600', color: 'var(--primary-blue)', textTransform: 'uppercase', letterSpacing: '0.05em' }}>Department</th>
                                    <th style={{ padding: '1rem 1.5rem', fontSize: '0.75rem', fontWeight: '600', color: 'var(--primary-blue)', textTransform: 'uppercase', letterSpacing: '0.05em' }}>Status</th>
                                    <th style={{ padding: '1rem 1.5rem', fontSize: '0.75rem', fontWeight: '600', color: 'var(--primary-blue)', textTransform: 'uppercase', letterSpacing: '0.05em', textAlign: 'right' }}>Actions</th>
                                </tr>
                            </thead>
                            <tbody>
                                {loading ? (
                                    <tr>
                                        <td colSpan="5" style={{ padding: '3rem', textAlign: 'center', color: 'var(--text-secondary)' }}>Loading employees...</td>
                                    </tr>
                                ) : filteredEmployees.length === 0 ? (
                                    <tr>
                                        <td colSpan="5" style={{ padding: '3rem', textAlign: 'center', color: 'var(--text-secondary)' }}>No employees found.</td>
                                    </tr>
                                ) : (
                                    filteredEmployees.map((emp) => (
                                        <tr
                                            key={emp._id}
                                            style={{ borderBottom: '1px solid var(--glass-border)', transition: 'background-color 0.2s', cursor: 'pointer' }}
                                            className="hover:bg-white/5"
                                            onClick={() => navigate(`/employees/${emp._id}`)}
                                        >
                                            <td style={{ padding: '1rem 1.5rem', fontFamily: 'monospace', color: 'var(--text-secondary)', fontSize: '0.85rem' }} title={emp._id}>
                                                #{emp._id.slice(-4)}
                                            </td>
                                            <td style={{ padding: '1rem 1.5rem' }}>
                                                <div style={{ display: 'flex', alignItems: 'center' }}>
                                                    <div style={{
                                                        height: '2.5rem', width: '2.5rem', borderRadius: '50%',
                                                        background: 'linear-gradient(135deg, rgba(59, 130, 246, 0.2) 0%, rgba(139, 92, 246, 0.2) 100%)',
                                                        border: '1px solid var(--glass-border)',
                                                        display: 'flex', alignItems: 'center', justifyContent: 'center',
                                                        color: 'var(--primary-blue)', marginRight: '1rem'
                                                    }}>
                                                        <User size={18} />
                                                    </div>
                                                    <div>
                                                        <div style={{ fontSize: '0.875rem', fontWeight: '500', color: 'var(--text-primary)' }}>{emp.name}</div>
                                                        <div style={{ fontSize: '0.75rem', color: 'var(--text-secondary)' }}>{emp.email}</div>
                                                    </div>
                                                </div>
                                            </td>
                                            <td style={{ padding: '1rem 1.5rem' }}>
                                                <div style={{ fontSize: '0.875rem', color: 'var(--text-primary)' }}>{emp.designation || emp.role}</div>
                                                <div style={{ fontSize: '0.75rem', color: 'var(--text-secondary)' }}>{emp.employmentType || 'Full-time'}</div>
                                            </td>
                                            <td style={{ padding: '1rem 1.5rem', fontSize: '0.875rem', color: 'var(--text-secondary)' }}>{emp.department || '-'}</td>
                                            <td style={{ padding: '1rem 1.5rem' }}>
                                                <span style={{
                                                    padding: '0.25rem 0.75rem', borderRadius: '9999px', fontSize: '0.75rem', fontWeight: '500',
                                                    backgroundColor: emp.status === 'Inactive' ? 'rgba(75, 85, 99, 0.2)' : 'rgba(34, 197, 94, 0.1)',
                                                    color: emp.status === 'Inactive' ? '#9ca3af' : '#4ade80',
                                                    border: emp.status === 'Inactive' ? '1px solid rgba(75, 85, 99, 0.3)' : '1px solid rgba(34, 197, 94, 0.3)'
                                                }}>
                                                    {emp.status || 'Active'}
                                                </span>
                                            </td>
                                            <td style={{ padding: '1rem 1.5rem', textAlign: 'right' }}>
                                                <button className="icon-btn" onClick={(e) => { e.stopPropagation(); navigate(`/employees/${emp._id}`); }}>
                                                    <Edit size={18} />
                                                </button>
                                            </td>
                                        </tr>
                                    ))
                                )}
                            </tbody>
                        </table>
                    </div>
                </main>
            </div>
        </div>
    );
};

export default Employees;
