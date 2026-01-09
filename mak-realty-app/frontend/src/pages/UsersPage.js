import React, { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { usersAPI } from '../utils/api';
import {
  Building2, ArrowLeft, Users, Eye, EyeOff, Shield, User,
  LogOut, Loader2, RefreshCw, Plus, Trash2, X
} from 'lucide-react';

const UsersPage = () => {
  const navigate = useNavigate();
  const { user, logout, isAdmin } = useAuth();

  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [showAddModal, setShowAddModal] = useState(false);
  const [newUser, setNewUser] = useState({ name: '', email: '', password: '', role: 'user' });
  const [addingUser, setAddingUser] = useState(false);

  useEffect(() => {
    if (!isAdmin()) {
      navigate('/dashboard');
    } else {
      fetchUsers();
    }
  }, [isAdmin, navigate]);

  const fetchUsers = async () => {
    try {
      setRefreshing(true);
      const data = await usersAPI.getAll();
      setUsers(data.users);
    } catch (error) {
      console.error('Fetch users error:', error);
      alert('Failed to load users');
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  const handleToggleVisibility = async (userId, currentVisibility) => {
    try {
      await usersAPI.toggleVisibility(userId, !currentVisibility);
      await fetchUsers();
    } catch (error) {
      console.error('Toggle visibility error:', error);
      alert('Failed to update user visibility');
    }
  };

  const handleToggleRole = async (userId, currentRole) => {
    const newRole = currentRole === 'admin' ? 'user' : 'admin';
    if (!window.confirm(`Change user role to ${newRole}?`)) return;

    try {
      await usersAPI.updateRole(userId, newRole);
      await fetchUsers();
    } catch (error) {
      console.error('Update role error:', error);
      alert(error.response?.data?.error || 'Failed to update user role');
    }
  };

  const handleLogout = () => {
    logout();
    navigate('/');
  };

  const handleDeleteUser = async (userId, userName) => {
    if (!window.confirm(`Are you sure you want to delete user "${userName}"? This action cannot be undone.`)) {
      return;
    }

    try {
      await usersAPI.delete(userId);
      await fetchUsers();
    } catch (error) {
      console.error('Delete user error:', error);
      alert(error.response?.data?.error || 'Failed to delete user');
    }
  };

  const handleAddUser = async (e) => {
    e.preventDefault();
    if (!newUser.name || !newUser.email || !newUser.password) {
      alert('Please fill in all fields');
      return;
    }

    try {
      setAddingUser(true);
      await usersAPI.create(newUser);
      setShowAddModal(false);
      setNewUser({ name: '', email: '', password: '', role: 'user' });
      await fetchUsers();
    } catch (error) {
      console.error('Add user error:', error);
      alert(error.response?.data?.error || 'Failed to add user');
    } finally {
      setAddingUser(false);
    }
  };

  const formatDate = (dateString) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric'
    });
  };

  return (
    <div className="users-page">
      <div className="page-bg">
        <div className="gradient-orb orb-1"></div>
        <div className="gradient-orb orb-2"></div>
      </div>

      <nav className="page-nav">
        <div className="nav-left">
          <Link to="/dashboard" className="back-btn">
            <ArrowLeft size={20} />
          </Link>
          <Link to="/" className="nav-logo">
            <Building2 size={24} strokeWidth={1.5} />
            <span>MAK Kotwal Venus</span>
          </Link>
        </div>
        <div className="nav-right">
          <div className="user-badge">
            <Shield size={16} />
            <span>{user?.name}</span>
          </div>
          <button className="logout-btn" onClick={handleLogout}>
            <LogOut size={18} />
          </button>
        </div>
      </nav>

      <main className="users-content">
        <div className="users-header">
          <h1>
            <Users size={28} />
            <span>User Management</span>
          </h1>
          <p>Manage user accounts, roles, and visibility</p>
        </div>

        <div className="users-container">
          <div className="users-actions">
            <div className="users-count">
              {users.length} user{users.length !== 1 ? 's' : ''} total
            </div>
            <div className="actions-buttons">
              <button
                className="add-user-btn"
                onClick={() => setShowAddModal(true)}
              >
                <Plus size={16} />
                <span>Add User</span>
              </button>
              <button
                className="refresh-btn"
                onClick={fetchUsers}
                disabled={refreshing}
              >
                <RefreshCw size={16} className={refreshing ? 'spin' : ''} />
                <span>Refresh</span>
              </button>
            </div>
          </div>

          <div className="users-table-container">
            {loading ? (
              <div className="loading-state">
                <Loader2 className="spin" size={32} />
                <p>Loading users...</p>
              </div>
            ) : users.length === 0 ? (
              <div className="empty-state">
                <Users size={48} />
                <h3>No Users Found</h3>
                <p>No registered users in the system</p>
              </div>
            ) : (
              <table className="users-table">
                <thead>
                  <tr>
                    <th>Name</th>
                    <th>Email</th>
                    <th>Role</th>
                    <th>2FA Status</th>
                    <th>Joined</th>
                    <th>Visibility</th>
                    <th>Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {users.map(u => (
                    <tr key={u.id} className={!u.is_visible ? 'hidden-user' : ''}>
                      <td>
                        <div className="user-name">
                          {u.role === 'admin' ? <Shield size={14} /> : <User size={14} />}
                          <span>{u.name}</span>
                        </div>
                      </td>
                      <td>{u.email}</td>
                      <td>
                        <span className={`role-badge ${u.role}`}>
                          {u.role}
                        </span>
                      </td>
                      <td>
                        <span className={`status-badge ${u.two_factor_enabled ? 'enabled' : 'disabled'}`}>
                          {u.two_factor_enabled ? 'Enabled' : 'Disabled'}
                        </span>
                      </td>
                      <td className="date-cell">{formatDate(u.created_at)}</td>
                      <td>
                        <button
                          className={`visibility-btn ${u.is_visible ? 'visible' : 'hidden'}`}
                          onClick={() => handleToggleVisibility(u.id, u.is_visible)}
                          title={u.is_visible ? 'Hide user' : 'Show user'}
                        >
                          {u.is_visible ? <Eye size={16} /> : <EyeOff size={16} />}
                          <span>{u.is_visible ? 'Visible' : 'Hidden'}</span>
                        </button>
                      </td>
                      <td>
                        <div className="actions-cell">
                          <button
                            className="role-toggle-btn"
                            onClick={() => handleToggleRole(u.id, u.role)}
                            disabled={u.id === user?.id}
                          >
                            Make {u.role === 'admin' ? 'User' : 'Admin'}
                          </button>
                          <button
                            className="delete-btn"
                            onClick={() => handleDeleteUser(u.id, u.name)}
                            disabled={u.id === user?.id}
                            title={u.id === user?.id ? "Cannot delete yourself" : "Delete user"}
                          >
                            <Trash2 size={16} />
                          </button>
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            )}
          </div>
        </div>
      </main>

      {showAddModal && (
        <div className="modal-overlay" onClick={() => setShowAddModal(false)}>
          <div className="modal-content" onClick={e => e.stopPropagation()}>
            <div className="modal-header">
              <h2>Add New User</h2>
              <button className="modal-close" onClick={() => setShowAddModal(false)}>
                <X size={20} />
              </button>
            </div>
            <form onSubmit={handleAddUser}>
              <div className="form-group">
                <label>Name</label>
                <input
                  type="text"
                  value={newUser.name}
                  onChange={e => setNewUser({ ...newUser, name: e.target.value })}
                  placeholder="Enter full name"
                  required
                />
              </div>
              <div className="form-group">
                <label>Email</label>
                <input
                  type="email"
                  value={newUser.email}
                  onChange={e => setNewUser({ ...newUser, email: e.target.value })}
                  placeholder="Enter email address"
                  required
                />
              </div>
              <div className="form-group">
                <label>Password</label>
                <input
                  type="password"
                  value={newUser.password}
                  onChange={e => setNewUser({ ...newUser, password: e.target.value })}
                  placeholder="Enter password (min 6 characters)"
                  minLength={6}
                  required
                />
              </div>
              <div className="form-group">
                <label>Role</label>
                <select
                  value={newUser.role}
                  onChange={e => setNewUser({ ...newUser, role: e.target.value })}
                >
                  <option value="user">User</option>
                  <option value="admin">Admin</option>
                </select>
              </div>
              <div className="modal-actions">
                <button type="button" className="cancel-btn" onClick={() => setShowAddModal(false)}>
                  Cancel
                </button>
                <button type="submit" className="submit-btn" disabled={addingUser}>
                  {addingUser ? <Loader2 size={16} className="spin" /> : <Plus size={16} />}
                  <span>{addingUser ? 'Adding...' : 'Add User'}</span>
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      <style>{`
        .users-page {
          min-height: 100vh;
          background: #0a0a0f;
          position: relative;
        }

        .page-bg {
          position: fixed;
          inset: 0;
          pointer-events: none;
          overflow: hidden;
        }

        .gradient-orb {
          position: absolute;
          border-radius: 50%;
          filter: blur(100px);
          opacity: 0.2;
        }

        .orb-1 {
          width: 500px;
          height: 500px;
          background: linear-gradient(135deg, #2d4a3e 0%, #1a2f25 100%);
          top: -100px;
          right: -100px;
        }

        .orb-2 {
          width: 400px;
          height: 400px;
          background: linear-gradient(135deg, #c9a962 0%, #8b7355 100%);
          bottom: -100px;
          left: -100px;
        }

        .page-nav {
          position: sticky;
          top: 0;
          z-index: 100;
          display: flex;
          align-items: center;
          justify-content: space-between;
          padding: 1rem 2rem;
          background: rgba(10, 10, 15, 0.9);
          border-bottom: 1px solid rgba(255, 255, 255, 0.06);
          backdrop-filter: blur(10px);
        }

        .nav-left {
          display: flex;
          align-items: center;
          gap: 1rem;
        }

        .back-btn {
          width: 40px;
          height: 40px;
          display: flex;
          align-items: center;
          justify-content: center;
          background: rgba(255, 255, 255, 0.05);
          border: 1px solid rgba(255, 255, 255, 0.1);
          border-radius: 10px;
          color: rgba(255, 255, 255, 0.7);
          transition: all 0.2s ease;
        }

        .back-btn:hover {
          background: rgba(255, 255, 255, 0.1);
          color: #fff;
        }

        .nav-logo {
          display: flex;
          align-items: center;
          gap: 0.75rem;
          color: #c9a962;
          text-decoration: none;
          font-family: 'Outfit', sans-serif;
          font-weight: 600;
        }

        .nav-right {
          display: flex;
          align-items: center;
          gap: 1rem;
        }

        .user-badge {
          display: flex;
          align-items: center;
          gap: 0.5rem;
          padding: 0.5rem 1rem;
          background: rgba(255, 255, 255, 0.05);
          border-radius: 20px;
          font-family: 'Outfit', sans-serif;
          font-size: 0.9rem;
          color: rgba(255, 255, 255, 0.7);
        }

        .user-badge svg {
          color: #c9a962;
        }

        .logout-btn {
          width: 40px;
          height: 40px;
          background: rgba(255, 255, 255, 0.05);
          border: 1px solid rgba(255, 255, 255, 0.1);
          border-radius: 10px;
          display: flex;
          align-items: center;
          justify-content: center;
          color: rgba(255, 255, 255, 0.6);
          cursor: pointer;
          transition: all 0.2s ease;
        }

        .logout-btn:hover {
          background: rgba(220, 38, 38, 0.1);
          border-color: rgba(220, 38, 38, 0.3);
          color: #fca5a5;
        }

        .users-content {
          position: relative;
          z-index: 10;
          padding: 2rem;
          max-width: 1400px;
          margin: 0 auto;
        }

        .users-header {
          text-align: center;
          margin-bottom: 2rem;
        }

        .users-header h1 {
          display: flex;
          align-items: center;
          justify-content: center;
          gap: 0.75rem;
          font-family: 'Cormorant Garamond', serif;
          font-size: 2rem;
          color: #fff;
          margin-bottom: 0.5rem;
        }

        .users-header h1 svg {
          color: #2d4a3e;
        }

        .users-header p {
          font-family: 'Outfit', sans-serif;
          color: rgba(255, 255, 255, 0.5);
        }

        .users-container {
          background: rgba(255, 255, 255, 0.03);
          border: 1px solid rgba(255, 255, 255, 0.08);
          border-radius: 16px;
          overflow: hidden;
        }

        .users-actions {
          display: flex;
          align-items: center;
          justify-content: space-between;
          padding: 1.25rem 1.5rem;
          border-bottom: 1px solid rgba(255, 255, 255, 0.08);
        }

        .users-count {
          font-family: 'Outfit', sans-serif;
          font-size: 0.9rem;
          color: rgba(255, 255, 255, 0.6);
        }

        .actions-buttons {
          display: flex;
          align-items: center;
          gap: 0.75rem;
        }

        .add-user-btn {
          display: flex;
          align-items: center;
          gap: 0.5rem;
          padding: 0.5rem 1rem;
          background: rgba(201, 169, 98, 0.2);
          border: 1px solid rgba(201, 169, 98, 0.4);
          border-radius: 8px;
          color: #c9a962;
          font-family: 'Outfit', sans-serif;
          font-size: 0.85rem;
          cursor: pointer;
          transition: all 0.2s ease;
        }

        .add-user-btn:hover {
          background: rgba(201, 169, 98, 0.3);
        }

        .refresh-btn {
          display: flex;
          align-items: center;
          gap: 0.5rem;
          padding: 0.5rem 1rem;
          background: rgba(45, 74, 62, 0.2);
          border: 1px solid rgba(45, 74, 62, 0.4);
          border-radius: 8px;
          color: #4ade80;
          font-family: 'Outfit', sans-serif;
          font-size: 0.85rem;
          cursor: pointer;
          transition: all 0.2s ease;
        }

        .refresh-btn:hover:not(:disabled) {
          background: rgba(45, 74, 62, 0.3);
        }

        .refresh-btn:disabled {
          opacity: 0.6;
          cursor: not-allowed;
        }

        .spin {
          animation: spin 1s linear infinite;
        }

        @keyframes spin {
          to { transform: rotate(360deg); }
        }

        .users-table-container {
          overflow-x: auto;
        }

        .loading-state,
        .empty-state {
          display: flex;
          flex-direction: column;
          align-items: center;
          justify-content: center;
          padding: 4rem 2rem;
          text-align: center;
        }

        .loading-state svg,
        .empty-state svg {
          color: rgba(255, 255, 255, 0.2);
          margin-bottom: 1rem;
        }

        .loading-state p,
        .empty-state h3 {
          font-family: 'Outfit', sans-serif;
          color: rgba(255, 255, 255, 0.6);
        }

        .empty-state p {
          font-family: 'Outfit', sans-serif;
          font-size: 0.9rem;
          color: rgba(255, 255, 255, 0.4);
          margin-top: 0.5rem;
        }

        .users-table {
          width: 100%;
          border-collapse: collapse;
        }

        .users-table thead {
          background: rgba(255, 255, 255, 0.02);
          border-bottom: 1px solid rgba(255, 255, 255, 0.08);
        }

        .users-table th {
          padding: 1rem 1.5rem;
          text-align: left;
          font-family: 'Outfit', sans-serif;
          font-size: 0.85rem;
          font-weight: 600;
          color: rgba(255, 255, 255, 0.6);
          text-transform: uppercase;
          letter-spacing: 0.05em;
        }

        .users-table tbody tr {
          border-bottom: 1px solid rgba(255, 255, 255, 0.05);
          transition: all 0.2s ease;
        }

        .users-table tbody tr:hover {
          background: rgba(255, 255, 255, 0.02);
        }

        .users-table tbody tr.hidden-user {
          opacity: 0.5;
        }

        .users-table td {
          padding: 1rem 1.5rem;
          font-family: 'Outfit', sans-serif;
          font-size: 0.9rem;
          color: rgba(255, 255, 255, 0.8);
        }

        .user-name {
          display: flex;
          align-items: center;
          gap: 0.5rem;
        }

        .user-name svg {
          color: #c9a962;
        }

        .role-badge {
          display: inline-block;
          padding: 0.35rem 0.75rem;
          border-radius: 12px;
          font-size: 0.75rem;
          font-weight: 500;
          text-transform: capitalize;
        }

        .role-badge.admin {
          background: rgba(201, 169, 98, 0.1);
          color: #c9a962;
          border: 1px solid rgba(201, 169, 98, 0.3);
        }

        .role-badge.user {
          background: rgba(59, 130, 246, 0.1);
          color: #60a5fa;
          border: 1px solid rgba(59, 130, 246, 0.3);
        }

        .status-badge {
          display: inline-block;
          padding: 0.35rem 0.75rem;
          border-radius: 12px;
          font-size: 0.75rem;
          font-weight: 500;
        }

        .status-badge.enabled {
          background: rgba(34, 197, 94, 0.1);
          color: #4ade80;
          border: 1px solid rgba(34, 197, 94, 0.3);
        }

        .status-badge.disabled {
          background: rgba(156, 163, 175, 0.1);
          color: #9ca3af;
          border: 1px solid rgba(156, 163, 175, 0.3);
        }

        .date-cell {
          color: rgba(255, 255, 255, 0.5);
          font-size: 0.85rem;
        }

        .visibility-btn {
          display: flex;
          align-items: center;
          gap: 0.5rem;
          padding: 0.4rem 0.75rem;
          border-radius: 8px;
          font-family: 'Outfit', sans-serif;
          font-size: 0.8rem;
          cursor: pointer;
          transition: all 0.2s ease;
          border: 1px solid;
        }

        .visibility-btn.visible {
          background: rgba(34, 197, 94, 0.1);
          border-color: rgba(34, 197, 94, 0.3);
          color: #4ade80;
        }

        .visibility-btn.hidden {
          background: rgba(239, 68, 68, 0.1);
          border-color: rgba(239, 68, 68, 0.3);
          color: #f87171;
        }

        .visibility-btn:hover {
          opacity: 0.8;
        }

        .role-toggle-btn {
          padding: 0.4rem 0.75rem;
          background: rgba(59, 130, 246, 0.1);
          border: 1px solid rgba(59, 130, 246, 0.3);
          border-radius: 8px;
          color: #60a5fa;
          font-family: 'Outfit', sans-serif;
          font-size: 0.8rem;
          cursor: pointer;
          transition: all 0.2s ease;
        }

        .role-toggle-btn:hover:not(:disabled) {
          background: rgba(59, 130, 246, 0.2);
        }

        .role-toggle-btn:disabled {
          opacity: 0.4;
          cursor: not-allowed;
        }

        .actions-cell {
          display: flex;
          align-items: center;
          gap: 0.5rem;
        }

        .delete-btn {
          width: 32px;
          height: 32px;
          display: flex;
          align-items: center;
          justify-content: center;
          background: rgba(239, 68, 68, 0.1);
          border: 1px solid rgba(239, 68, 68, 0.3);
          border-radius: 6px;
          color: #f87171;
          cursor: pointer;
          transition: all 0.2s ease;
        }

        .delete-btn:hover:not(:disabled) {
          background: rgba(239, 68, 68, 0.2);
        }

        .delete-btn:disabled {
          opacity: 0.4;
          cursor: not-allowed;
        }

        /* Modal Styles */
        .modal-overlay {
          position: fixed;
          inset: 0;
          background: rgba(0, 0, 0, 0.8);
          display: flex;
          align-items: center;
          justify-content: center;
          z-index: 1000;
          padding: 1rem;
        }

        .modal-content {
          background: #1a1a1f;
          border: 1px solid rgba(255, 255, 255, 0.1);
          border-radius: 16px;
          width: 100%;
          max-width: 450px;
          overflow: hidden;
        }

        .modal-header {
          display: flex;
          align-items: center;
          justify-content: space-between;
          padding: 1.25rem 1.5rem;
          border-bottom: 1px solid rgba(255, 255, 255, 0.08);
        }

        .modal-header h2 {
          font-family: 'Cormorant Garamond', serif;
          font-size: 1.5rem;
          color: #fff;
          margin: 0;
        }

        .modal-close {
          width: 36px;
          height: 36px;
          display: flex;
          align-items: center;
          justify-content: center;
          background: rgba(255, 255, 255, 0.05);
          border: 1px solid rgba(255, 255, 255, 0.1);
          border-radius: 8px;
          color: rgba(255, 255, 255, 0.6);
          cursor: pointer;
          transition: all 0.2s ease;
        }

        .modal-close:hover {
          background: rgba(255, 255, 255, 0.1);
          color: #fff;
        }

        .modal-content form {
          padding: 1.5rem;
        }

        .form-group {
          margin-bottom: 1.25rem;
        }

        .form-group label {
          display: block;
          font-family: 'Outfit', sans-serif;
          font-size: 0.85rem;
          color: rgba(255, 255, 255, 0.7);
          margin-bottom: 0.5rem;
        }

        .form-group input,
        .form-group select {
          width: 100%;
          padding: 0.75rem 1rem;
          background: rgba(255, 255, 255, 0.05);
          border: 1px solid rgba(255, 255, 255, 0.1);
          border-radius: 8px;
          font-family: 'Outfit', sans-serif;
          font-size: 0.95rem;
          color: #fff;
          transition: all 0.2s ease;
        }

        .form-group input:focus,
        .form-group select:focus {
          outline: none;
          border-color: rgba(201, 169, 98, 0.5);
          background: rgba(255, 255, 255, 0.08);
        }

        .form-group input::placeholder {
          color: rgba(255, 255, 255, 0.4);
        }

        .form-group select {
          cursor: pointer;
        }

        .form-group select option {
          background: #1a1a1f;
          color: #fff;
        }

        .modal-actions {
          display: flex;
          gap: 1rem;
          margin-top: 1.5rem;
        }

        .cancel-btn {
          flex: 1;
          padding: 0.75rem 1rem;
          background: rgba(255, 255, 255, 0.05);
          border: 1px solid rgba(255, 255, 255, 0.1);
          border-radius: 8px;
          font-family: 'Outfit', sans-serif;
          font-size: 0.95rem;
          color: rgba(255, 255, 255, 0.7);
          cursor: pointer;
          transition: all 0.2s ease;
        }

        .cancel-btn:hover {
          background: rgba(255, 255, 255, 0.1);
        }

        .submit-btn {
          flex: 1;
          display: flex;
          align-items: center;
          justify-content: center;
          gap: 0.5rem;
          padding: 0.75rem 1rem;
          background: rgba(201, 169, 98, 0.2);
          border: 1px solid rgba(201, 169, 98, 0.4);
          border-radius: 8px;
          font-family: 'Outfit', sans-serif;
          font-size: 0.95rem;
          color: #c9a962;
          cursor: pointer;
          transition: all 0.2s ease;
        }

        .submit-btn:hover:not(:disabled) {
          background: rgba(201, 169, 98, 0.3);
        }

        .submit-btn:disabled {
          opacity: 0.6;
          cursor: not-allowed;
        }

        @media (max-width: 768px) {
          .users-content {
            padding: 1rem;
          }

          .users-table {
            font-size: 0.85rem;
          }

          .users-table th,
          .users-table td {
            padding: 0.75rem;
          }
        }
      `}</style>
    </div>
  );
};

export default UsersPage;
