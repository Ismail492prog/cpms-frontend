import React, { useState, useEffect, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import Navbar from '../components/Navbar';
import { profileService } from '../services/profileService';
import toast from 'react-hot-toast';
import './Profile.css';

const Profile = () => {
    const [profile, setProfile] = useState(null);
    const [loading, setLoading] = useState(true);
    const [isEditing, setIsEditing] = useState(false);
    const [showPasswordModal, setShowPasswordModal] = useState(false);
    const [uploading, setUploading] = useState(false);
    const [imageError, setImageError] = useState(false);
    const [formData, setFormData] = useState({
        fullName: '',
        phoneNumber: '',
        department: '',
        jobTitle: '',
        bio: '',
        address: '',
        city: '',
        country: 'Kenya',
        postalCode: '',
        companyName: ''
    });
    const [passwordData, setPasswordData] = useState({
        oldPassword: '',
        newPassword: '',
        confirmPassword: ''
    });
    const navigate = useNavigate();

    const fetchProfile = useCallback(async () => {
        try {
            const response = await profileService.getProfile();
            if (response.success) {
                setProfile(response.profile);
                setImageError(false);
                setFormData({
                    fullName: response.profile.fullName || '',
                    phoneNumber: response.profile.phoneNumber || '',
                    department: response.profile.department || '',
                    jobTitle: response.profile.jobTitle || '',
                    bio: response.profile.bio || '',
                    address: response.profile.address || '',
                    city: response.profile.city || '',
                    country: response.profile.country || 'Kenya',
                    postalCode: response.profile.postalCode || '',
                    companyName: response.profile.companyName || ''
                });
            }
        } catch (err) {
            console.error('Failed to fetch profile:', err);
            toast.error('Failed to load profile');
            navigate('/dashboard');
        } finally {
            setLoading(false);
        }
    }, [navigate]);

    useEffect(() => {
        // eslint-disable-next-line react-hooks/set-state-in-effect
        fetchProfile();
    }, [fetchProfile]);

    // Handle profile picture upload using Base64 (No file system issues)
    const handlePictureUpload = async (e) => {
        const file = e.target.files[0];
        if (!file) return;
        
        // Validate file type
        if (!file.type.startsWith('image/')) {
            toast.error('Please select an image file');
            return;
        }
        
        // Validate file size (max 2MB)
        if (file.size > 2 * 1024 * 1024) {
            toast.error('File size must be less than 2MB');
            return;
        }
        
        setUploading(true);
        try {
            // Convert to Base64
            const reader = new FileReader();
            reader.readAsDataURL(file);
            reader.onload = async () => {
                const base64Image = reader.result;
                const response = await profileService.uploadProfilePictureBase64(base64Image);
                if (response.success) {
                    toast.success('Profile picture updated!');
                    setImageError(false);
                    fetchProfile(); // Refresh profile
                }
                setUploading(false);
            };
            reader.onerror = (error) => {
                console.error('Error reading file:', error);
                toast.error('Failed to read image file');
                setUploading(false);
            };
        } catch (err) {
            console.error('Failed to upload picture:', err);
            toast.error(err.response?.data?.message || 'Failed to upload picture');
            setUploading(false);
        }
    };

    const handleInputChange = (e) => {
        setFormData({
            ...formData,
            [e.target.name]: e.target.value
        });
    };

    const handlePasswordChange = (e) => {
        setPasswordData({
            ...passwordData,
            [e.target.name]: e.target.value
        });
    };

    const handleUpdateProfile = async (e) => {
        e.preventDefault();
        try {
            const response = await profileService.updateProfile(formData);
            if (response.success) {
                toast.success('Profile updated successfully!');
                setIsEditing(false);
                fetchProfile();
                
                // Update stored user info
                const storedUser = JSON.parse(localStorage.getItem('user') || '{}');
                storedUser.fullName = formData.fullName;
                localStorage.setItem('user', JSON.stringify(storedUser));
            }
        } catch (err) {
            console.error('Failed to update profile:', err);
            toast.error(err.response?.data?.message || 'Failed to update profile');
        }
    };

    const handleChangePassword = async (e) => {
        e.preventDefault();
        
        if (passwordData.newPassword !== passwordData.confirmPassword) {
            toast.error('New passwords do not match');
            return;
        }
        
        if (passwordData.newPassword.length < 6) {
            toast.error('Password must be at least 6 characters');
            return;
        }
        
        try {
            const response = await profileService.changePassword({
                oldPassword: passwordData.oldPassword,
                newPassword: passwordData.newPassword,
                confirmPassword: passwordData.confirmPassword
            });
            
            if (response.success) {
                toast.success('Password changed successfully!');
                setShowPasswordModal(false);
                setPasswordData({
                    oldPassword: '',
                    newPassword: '',
                    confirmPassword: ''
                });
            }
        } catch (err) {
            console.error('Failed to change password:', err);
            toast.error(err.response?.data?.message || 'Failed to change password');
        }
    };

    // Handle image load error - fallback to placeholder
    const handleImageError = () => {
        setImageError(true);
    };

    if (loading) {
        return (
            <>
                <Navbar />
                <div className="loading">Loading profile...</div>
            </>
        );
    }

    return (
        <div className="dashboard">
            <Navbar />
            <div className="dashboard-container">
                <div className="profile-container">
                    <div className="profile-header">
                        <div className="profile-avatar">
                            {profile?.profilePictureBase64 && !imageError ? (
                                <img 
                                    src={profile.profilePictureBase64} 
                                    alt="Profile" 
                                    className="avatar-image"
                                    onError={handleImageError}
                                />
                            ) : (
                                <div className="avatar-placeholder">
                                    {profile?.fullName?.charAt(0) || 'U'}
                                </div>
                            )}
                            {/* Upload button overlay */}
                            <label className="upload-btn" htmlFor="profile-picture" title="Upload profile picture">
                                📷
                                <input
                                    id="profile-picture"
                                    type="file"
                                    accept="image/*"
                                    onChange={handlePictureUpload}
                                    disabled={uploading}
                                    style={{ display: 'none' }}
                                />
                            </label>
                            {uploading && <div className="upload-spinner">⏳</div>}
                        </div>
                        <div className="profile-title">
                            <h1>My Profile</h1>
                            <p>Manage your personal information</p>
                        </div>
                        <div className="profile-actions">
                            {!isEditing ? (
                                <button className="btn-primary" onClick={() => setIsEditing(true)}>
                                    ✏️ Edit Profile
                                </button>
                            ) : (
                                <button className="btn-secondary" onClick={() => setIsEditing(false)}>
                                    Cancel
                                </button>
                            )}
                            <button className="btn-secondary" onClick={() => setShowPasswordModal(true)}>
                                🔒 Change Password
                            </button>
                        </div>
                    </div>

                    <div className="profile-info">
                        <div className="info-card">
                            <h3>Account Information</h3>
                            <div className="info-row">
                                <span className="info-label">Email:</span>
                                <span className="info-value">{profile?.email}</span>
                            </div>
                            <div className="info-row">
                                <span className="info-label">Role:</span>
                                <span className="info-value role-badge">{profile?.role}</span>
                            </div>
                            <div className="info-row">
                                <span className="info-label">Member Since:</span>
                                <span className="info-value">
                                    {profile?.createdAt ? new Date(profile.createdAt).toLocaleDateString() : '-'}
                                </span>
                            </div>
                        </div>

                        <div className="info-card">
                            <h3>Personal Information</h3>
                            {!isEditing ? (
                                <>
                                    <div className="info-row">
                                        <span className="info-label">Full Name:</span>
                                        <span className="info-value">{profile?.fullName || '-'}</span>
                                    </div>
                                    <div className="info-row">
                                        <span className="info-label">Phone Number:</span>
                                        <span className="info-value">{profile?.phoneNumber || '-'}</span>
                                    </div>
                                    <div className="info-row">
                                        <span className="info-label">Department:</span>
                                        <span className="info-value">{profile?.department || '-'}</span>
                                    </div>
                                    <div className="info-row">
                                        <span className="info-label">Job Title:</span>
                                        <span className="info-value">{profile?.jobTitle || '-'}</span>
                                    </div>
                                    <div className="info-row">
                                        <span className="info-label">Bio:</span>
                                        <span className="info-value">{profile?.bio || '-'}</span>
                                    </div>
                                </>
                            ) : (
                                <form onSubmit={handleUpdateProfile}>
                                    <div className="form-group">
                                        <label>Full Name</label>
                                        <input
                                            type="text"
                                            name="fullName"
                                            value={formData.fullName}
                                            onChange={handleInputChange}
                                            required
                                        />
                                    </div>
                                    <div className="form-group">
                                        <label>Phone Number</label>
                                        <input
                                            type="tel"
                                            name="phoneNumber"
                                            value={formData.phoneNumber}
                                            onChange={handleInputChange}
                                        />
                                    </div>
                                    <div className="form-row">
                                        <div className="form-group">
                                            <label>Department</label>
                                            <input
                                                type="text"
                                                name="department"
                                                value={formData.department}
                                                onChange={handleInputChange}
                                            />
                                        </div>
                                        <div className="form-group">
                                            <label>Job Title</label>
                                            <input
                                                type="text"
                                                name="jobTitle"
                                                value={formData.jobTitle}
                                                onChange={handleInputChange}
                                            />
                                        </div>
                                    </div>
                                    <div className="form-group">
                                        <label>Bio</label>
                                        <textarea
                                            name="bio"
                                            value={formData.bio}
                                            onChange={handleInputChange}
                                            rows="3"
                                        />
                                    </div>
                                    <button type="submit" className="btn-primary">Save Changes</button>
                                </form>
                            )}
                        </div>

                        <div className="info-card">
                            <h3>Address & Company</h3>
                            {!isEditing ? (
                                <>
                                    <div className="info-row">
                                        <span className="info-label">Address:</span>
                                        <span className="info-value">{profile?.address || '-'}</span>
                                    </div>
                                    <div className="info-row">
                                        <span className="info-label">City:</span>
                                        <span className="info-value">{profile?.city || '-'}</span>
                                    </div>
                                    <div className="info-row">
                                        <span className="info-label">Country:</span>
                                        <span className="info-value">{profile?.country || 'Kenya'}</span>
                                    </div>
                                    <div className="info-row">
                                        <span className="info-label">Postal Code:</span>
                                        <span className="info-value">{profile?.postalCode || '-'}</span>
                                    </div>
                                    <div className="info-row">
                                        <span className="info-label">Company:</span>
                                        <span className="info-value">{profile?.companyName || '-'}</span>
                                    </div>
                                </>
                            ) : (
                                <>
                                    <div className="form-group">
                                        <label>Address</label>
                                        <input
                                            type="text"
                                            name="address"
                                            value={formData.address}
                                            onChange={handleInputChange}
                                        />
                                    </div>
                                    <div className="form-row">
                                        <div className="form-group">
                                            <label>City</label>
                                            <input
                                                type="text"
                                                name="city"
                                                value={formData.city}
                                                onChange={handleInputChange}
                                            />
                                        </div>
                                        <div className="form-group">
                                            <label>Country</label>
                                            <input
                                                type="text"
                                                name="country"
                                                value={formData.country}
                                                onChange={handleInputChange}
                                            />
                                        </div>
                                    </div>
                                    <div className="form-row">
                                        <div className="form-group">
                                            <label>Postal Code</label>
                                            <input
                                                type="text"
                                                name="postalCode"
                                                value={formData.postalCode}
                                                onChange={handleInputChange}
                                            />
                                        </div>
                                        <div className="form-group">
                                            <label>Company Name</label>
                                            <input
                                                type="text"
                                                name="companyName"
                                                value={formData.companyName}
                                                onChange={handleInputChange}
                                            />
                                        </div>
                                    </div>
                                </>
                            )}
                        </div>
                    </div>
                </div>
            </div>

            {/* Change Password Modal */}
            {showPasswordModal && (
                <div className="modal-overlay" onClick={() => setShowPasswordModal(false)}>
                    <div className="modal-content" onClick={(e) => e.stopPropagation()}>
                        <div className="modal-header">
                            <h3>Change Password</h3>
                            <button className="close-btn" onClick={() => setShowPasswordModal(false)}>×</button>
                        </div>
                        <form onSubmit={handleChangePassword}>
                            <div className="form-group">
                                <label>Current Password</label>
                                <input
                                    type="password"
                                    name="oldPassword"
                                    value={passwordData.oldPassword}
                                    onChange={handlePasswordChange}
                                    required
                                />
                            </div>
                            <div className="form-group">
                                <label>New Password</label>
                                <input
                                    type="password"
                                    name="newPassword"
                                    value={passwordData.newPassword}
                                    onChange={handlePasswordChange}
                                    required
                                />
                            </div>
                            <div className="form-group">
                                <label>Confirm New Password</label>
                                <input
                                    type="password"
                                    name="confirmPassword"
                                    value={passwordData.confirmPassword}
                                    onChange={handlePasswordChange}
                                    required
                                />
                            </div>
                            <div className="modal-buttons">
                                <button type="button" className="btn-secondary" onClick={() => setShowPasswordModal(false)}>
                                    Cancel
                                </button>
                                <button type="submit" className="btn-primary">
                                    Change Password
                                </button>
                            </div>
                        </form>
                    </div>
                </div>
            )}
        </div>
    );
};

export default Profile;