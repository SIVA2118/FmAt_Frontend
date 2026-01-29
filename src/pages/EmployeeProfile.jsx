import React, { useState, useEffect } from 'react';
import Header from '../components/Header';
import Sidebar from '../components/Sidebar';
import {
    UserPlus, Save, Loader, AlertCircle, CheckCircle,
    User, Briefcase, MapPin, CreditCard, Phone, Heart, FileText, ArrowLeft
} from 'lucide-react';
import { JOB_ROLES } from '../utils/jobRoles';
import { useParams, useNavigate } from 'react-router-dom';
import './CreateEmployee.css';

const FormContext = React.createContext(null);

const SectionHeader = ({ title, icon: Icon }) => (
    <div className="section-header-custom">
        {Icon && <Icon size={24} className="section-icon" />}
        <h3>{title}</h3>
    </div>
);

const InputGroup = ({ label, name, type = 'text', required = false, options = null }) => {
    const { formData, handleChange } = React.useContext(FormContext);
    const inputId = `field-${name}`;

    return (
        <div className="input-group">
            <label className="input-label" htmlFor={inputId}>
                {label} {required && <span className="required-star">*</span>}
            </label>
            {options ? (
                <select
                    id={inputId}
                    name={name}
                    value={formData[name] || ''}
                    onChange={handleChange}
                    className="form-select"
                >
                    <option value="">Select {label}</option>
                    {options.map(opt => (
                        <option key={opt} value={opt}>{opt}</option>
                    ))}
                </select>
            ) : (
                <input
                    id={inputId}
                    type={type}
                    name={name}
                    value={formData[name] || ''}
                    onChange={handleChange}
                    required={required && name !== 'password'} // Password not required for edit
                    className="form-input"
                    placeholder={name === 'password' ? 'Leave blank to keep current' : ''}
                />
            )}
        </div>
    );
};

const EmployeeProfile = () => {
    const { id } = useParams();
    const navigate = useNavigate();
    const [sidebarOpen, setSidebarOpen] = useState(true);
    const [loading, setLoading] = useState(true);
    const [saving, setSaving] = useState(false);
    const [success, setSuccess] = useState('');
    const [error, setError] = useState('');

    const [formData, setFormData] = useState({
        // Account
        name: '', email: '', password: '',

        // Personal
        dob: '', gender: '', maritalStatus: '', bloodGroup: '',
        fatherName: '', motherName: '',

        // Contact
        phone: '', personalEmail: '',
        emergencyContactName: '', emergencyContactRelation: '', emergencyContactPhone: '',

        // Address
        currentAddress: '', permanentAddress: '',

        // Identity
        aadharNumber: '', panNumber: '',

        // Professional
        joiningDate: '', department: '', designation: '',
        employmentType: '', status: '', salary: '',

        // Bank
        bankAccountName: '', bankAccountNumber: '', bankIfscCode: '', bankName: '',
    });

    useEffect(() => {
        fetchEmployee();
    }, [id]);

    const fetchEmployee = async () => {
        try {
            const token = JSON.parse(localStorage.getItem('user'))?.token;
            const response = await fetch(`https://fmat-backend.onrender.com/api/admin/employees/${id}`, {
                headers: {
                    'Authorization': `Bearer ${token}`
                }
            });
            const data = await response.json();

            if (response.ok) {
                // Flatten nested objects for form
                setFormData({
                    ...data,
                    // Handle dates if needed, usually string 'YYYY-MM-DD' from input type=date works with ISO string part
                    dob: data.dob ? data.dob.split('T')[0] : '',
                    joiningDate: data.joiningDate ? data.joiningDate.split('T')[0] : '',

                    emergencyContactName: data.emergencyContact?.name || '',
                    emergencyContactRelation: data.emergencyContact?.relation || '',
                    emergencyContactPhone: data.emergencyContact?.phone || '',

                    bankAccountName: data.bankDetails?.accountName || '',
                    bankAccountNumber: data.bankDetails?.accountNumber || '',
                    bankIfscCode: data.bankDetails?.ifscCode || '',
                    bankName: data.bankDetails?.bankName || '',

                    password: '' // Don't show hash
                });
            } else {
                console.error('Fetch error:', data);
                setError(data.message || 'Failed to fetch employee details');
            }
        } catch (err) {
            console.error(err);
            setError('Error fetching employee');
        } finally {
            setLoading(false);
        }
    };

    const handleChange = (e) => {
        setFormData({ ...formData, [e.target.name]: e.target.value });
    };

    const toggleSidebar = () => setSidebarOpen(!sidebarOpen);

    const handleSubmit = async (e) => {
        e.preventDefault();
        setSaving(true);
        setError('');
        setSuccess('');

        const payload = {
            ...formData,
            emergencyContact: {
                name: formData.emergencyContactName,
                relation: formData.emergencyContactRelation,
                phone: formData.emergencyContactPhone
            },
            bankDetails: {
                accountName: formData.bankAccountName,
                accountNumber: formData.bankAccountNumber,
                ifscCode: formData.bankIfscCode,
                bankName: formData.bankName
            }
        };

        // Remove empty password if not changing
        if (!payload.password) delete payload.password;

        try {
            const token = JSON.parse(localStorage.getItem('user'))?.token;

            const response = await fetch(`https://fmat-backend.onrender.com/api/admin/employees/${id}`, {
                method: 'PUT',
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer ${token}`
                },
                body: JSON.stringify(payload)
            });

            const data = await response.json();

            if (!response.ok) {
                throw new Error(data.message || 'Failed to update employee');
            }

            setSuccess('Employee updated successfully!');
            // Re-fetch to ensure sync? Or just rely on local state update

        } catch (err) {
            console.error(err);
            setError(err.message);
        } finally {
            setSaving(false);
        }
    };

    if (loading) return <div className="loading-screen">Loading...</div>;

    return (
        <div className="dashboard-container">
            <Header toggleSidebar={toggleSidebar} />
            <div className="dashboard-content-wrapper">
                <Sidebar isOpen={sidebarOpen} />
                <main className="main-content" style={{ padding: 0, backgroundColor: '#0f172a' }}>
                    <FormContext.Provider value={{ formData, handleChange }}>
                        <div className="create-employee-wrapper">
                            <div style={{ maxWidth: '1200px', margin: '0 auto', padding: '2rem' }}>
                                <div className="page-header-custom" style={{ display: 'flex', alignItems: 'center', gap: '1rem' }}>
                                    <button onClick={() => navigate('/employees')} className="icon-btn">
                                        <ArrowLeft size={24} />
                                    </button>
                                    <h2>Edit Employee Profile</h2>
                                </div>

                                <form onSubmit={handleSubmit} className="glass-container">
                                    <div className="glass-content">
                                        {error && (
                                            <div className="alert alert-error">
                                                <AlertCircle size={20} />
                                                <span>{error}</span>
                                            </div>
                                        )}
                                        {success && (
                                            <div className="alert alert-success">
                                                <CheckCircle size={20} />
                                                <span>{success}</span>
                                            </div>
                                        )}

                                        {/* Profile Image Display */}
                                        <div style={{ display: 'flex', justifyContent: 'center', marginBottom: '2rem' }}>
                                            <div style={{
                                                width: '150px', height: '150px', borderRadius: '50%',
                                                overflow: 'hidden', border: '4px solid rgba(255, 255, 255, 0.1)',
                                                display: 'flex', alignItems: 'center', justifyContent: 'center',
                                                backgroundColor: 'rgba(30, 41, 59, 0.5)',
                                                boxShadow: '0 8px 32px 0 rgba(0, 0, 0, 0.36)'
                                            }}>
                                                {formData.profileImage ? (
                                                    <img
                                                        src={
                                                            formData.profileImage.startsWith('data:') || formData.profileImage.startsWith('http')
                                                                ? formData.profileImage
                                                                : `https://fmat-backend.onrender.com/${formData.profileImage.replace(/\\/g, '/')}`
                                                        }
                                                        alt="Profile"
                                                        style={{ width: '100%', height: '100%', objectFit: 'cover' }}
                                                        onError={(e) => { e.target.style.display = 'none'; e.target.nextSibling.style.display = 'flex'; }}
                                                    />
                                                ) : null}
                                                <div style={{
                                                    display: formData.profileImage ? 'none' : 'flex',
                                                    width: '100%', height: '100%', alignItems: 'center', justifyContent: 'center',
                                                    color: '#94a3b8'
                                                }}>
                                                    <User size={64} />
                                                </div>
                                            </div>
                                        </div>

                                        {/* Account Details */}
                                        <div style={{ marginBottom: '2rem' }}>
                                            <SectionHeader title="Account Information" icon={UserPlus} />
                                            <div className="form-grid-3">
                                                <InputGroup label="Full Name" name="name" required />
                                                <InputGroup label="Official Email" name="email" type="email" required />
                                                <InputGroup label="Password" name="password" type="password" />
                                            </div>
                                        </div>

                                        {/* Personal Information */}
                                        <SectionHeader title="Personal Information" icon={User} />
                                        <div className="form-grid">
                                            <InputGroup label="Date of Birth" name="dob" type="date" />
                                            <InputGroup label="Gender" name="gender" options={['Male', 'Female', 'Other']} />
                                            <InputGroup label="Marital Status" name="maritalStatus" options={['Single', 'Married', 'Divorced', 'Widowed']} />
                                            <InputGroup label="Blood Group" name="bloodGroup" />
                                            <InputGroup label="Father's Name" name="fatherName" />
                                            <InputGroup label="Mother's Name" name="motherName" />
                                        </div>

                                        {/* Contact Information */}
                                        <SectionHeader title="Contact Information" icon={Phone} />
                                        <div className="form-grid-2">
                                            <InputGroup label="Phone Number" name="phone" required />
                                            <InputGroup label="Personal Email" name="personalEmail" type="email" />
                                        </div>

                                        <div className="sub-header">Emergency Contact</div>
                                        <div className="form-grid-3">
                                            <InputGroup label="Contact Name" name="emergencyContactName" />
                                            <InputGroup label="Relation" name="emergencyContactRelation" />
                                            <InputGroup label="Phone" name="emergencyContactPhone" />
                                        </div>

                                        {/* Address */}
                                        <SectionHeader title="Address Details" icon={MapPin} />
                                        <div className="form-grid">
                                            <div className="input-group">
                                                <label className="input-label" htmlFor="field-currentAddress">Current Address</label>
                                                <textarea
                                                    id="field-currentAddress"
                                                    name="currentAddress"
                                                    value={formData.currentAddress || ''}
                                                    onChange={handleChange}
                                                    className="form-textarea"
                                                />
                                            </div>
                                            <div className="input-group">
                                                <label className="input-label" htmlFor="field-permanentAddress">Permanent Address</label>
                                                <textarea
                                                    id="field-permanentAddress"
                                                    name="permanentAddress"
                                                    value={formData.permanentAddress || ''}
                                                    onChange={handleChange}
                                                    className="form-textarea"
                                                />
                                            </div>
                                        </div>

                                        {/* Identity */}
                                        <SectionHeader title="Identity Proofs" icon={FileText} />
                                        <div className="form-grid-2">
                                            <InputGroup label="Aadhar Number" name="aadharNumber" />
                                            <InputGroup label="PAN Number" name="panNumber" />
                                        </div>

                                        {/* Professional Details */}
                                        <SectionHeader title="Professional Details" icon={Briefcase} />
                                        <div className="form-grid">
                                            <InputGroup label="Designation" name="designation" required options={JOB_ROLES} />
                                            <InputGroup label="Department" name="department" />
                                            <InputGroup label="Joining Date" name="joiningDate" type="date" />
                                            <InputGroup label="Employment Type" name="employmentType" options={['Full-Time', 'Part-Time', 'Contract', 'Intern']} />
                                            <InputGroup label="Status" name="status" options={['Active', 'Inactive']} />
                                            <InputGroup label="Salary (CTC)" name="salary" type="number" />
                                        </div>

                                        {/* Bank Details */}
                                        <SectionHeader title="Bank Details" icon={CreditCard} />
                                        <div className="form-grid-2">
                                            <InputGroup label="Bank Name" name="bankName" />
                                            <InputGroup label="Account Holder Name" name="bankAccountName" />
                                            <InputGroup label="Account Number" name="bankAccountNumber" />
                                            <InputGroup label="IFSC Code" name="bankIfscCode" />
                                        </div>

                                        {/* Actions */}
                                        <div className="button-group">
                                            <button type="button" onClick={() => navigate('/employees')} className="btn-cancel">
                                                Cancel
                                            </button>
                                            <button
                                                type="submit"
                                                disabled={saving}
                                                className="btn-submit"
                                            >
                                                {saving ? <Loader className="animate-spin" size={20} /> : <Save size={20} />}
                                                {saving ? 'Saving...' : 'Save Changes'}
                                            </button>
                                        </div>
                                    </div>
                                </form>
                            </div>
                        </div>
                    </FormContext.Provider>
                </main>
            </div>
        </div>
    );
};

export default EmployeeProfile;
