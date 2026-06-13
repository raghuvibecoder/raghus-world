import React, { useState, useEffect } from 'react';
import { Lock, RefreshCw, Plus, Trash2, Key, Link as LinkIcon, Layers, Edit2, X, Check } from 'lucide-react';

export default function AdminPanel({ authToken, role, onAdminSuccess, onLogout }) {
  const [adminPasswordInput, setAdminPasswordInput] = useState('');
  const [authError, setAuthError] = useState('');
  
  // Seeding/Syncing state
  const [syncing, setSyncing] = useState(false);
  const [syncMessage, setSyncMessage] = useState('');

  // Lesson Button Manager state
  const [buttons, setButtons] = useState([]);
  const [filterGrade, setFilterGrade] = useState('2');
  const [filterSection, setFilterSection] = useState('A');
  const [newBtn, setNewBtn] = useState({
    grade: '2',
    section: 'A',
    set_num: '1',
    lesson_name: '',
    url: ''
  });

  // Edit button state
  const [editingBtn, setEditingBtn] = useState(null); // holds the button being edited
  const [editBtnSaving, setEditBtnSaving] = useState(false);

  // Home Link Manager state
  const [links, setLinks] = useState([]);
  const [newLink, setNewLink] = useState({
    type: 'document',
    title: '',
    url: '',
    icon: 'pdf'
  });

  // Edit link state
  const [editingLink, setEditingLink] = useState(null);
  const [editLinkSaving, setEditLinkSaving] = useState(false);

  // Password Management state
  const [sitePassConfig, setSitePassConfig] = useState({ currentPassword: '', newPassword: '' });
  const [adminPassConfig, setAdminPassConfig] = useState({ currentPassword: '', newPassword: '' });
  const [passMessage, setPassMessage] = useState('');
  const [passError, setPassError] = useState('');

  const adminHeaders = {
    'Content-Type': 'application/json',
    'Authorization': authToken,
    'X-Admin-Token': authToken
  };

  useEffect(() => {
    if (role === 'admin') {
      fetchButtons();
      fetchLinks();
    }
  }, [role, filterGrade, filterSection]);

  const fetchButtons = async () => {
    try {
      const sect = (filterGrade === '2' || filterGrade === '3') ? filterSection : 'null';
      const res = await fetch(`/api/buttons?grade=${filterGrade}&section=${sect}`, {
        headers: adminHeaders
      });
      if (res.ok) {
        const data = await res.json();
        setButtons(data || []);
      }
    } catch (err) {
      console.error(err);
    }
  };

  const fetchLinks = async () => {
    try {
      const res = await fetch('/api/links', { headers: adminHeaders });
      if (res.ok) {
        const data = await res.json();
        setLinks(data || []);
      }
    } catch (err) {
      console.error(err);
    }
  };

  const handleAdminLogin = async (e) => {
    e.preventDefault();
    setAuthError('');
    try {
      const res = await fetch('/api/auth/login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ password: adminPasswordInput })
      });
      
      const data = await res.json();
      if (res.ok && data.role === 'admin') {
        onAdminSuccess(adminPasswordInput);
      } else {
        setAuthError('Incorrect admin password!');
      }
    } catch (err) {
      setAuthError('Error authenticating. Try again.');
    }
  };

  // Sync templates
  const handleSyncTemplates = async () => {
    setSyncing(true);
    setSyncMessage('');
    try {
      const [btnTpl, linkTpl, noteTpl, taskTpl] = await Promise.all([
        fetch('/templates/buttons.json').then(r => r.json()),
        fetch('/templates/links.json').then(r => r.json()),
        fetch('/templates/notes.json').then(r => r.json()),
        fetch('/templates/tasks.json').then(r => r.json())
      ]);

      const syncRes = await fetch('/api/sync', {
        method: 'POST',
        headers: adminHeaders,
        body: JSON.stringify({
          buttons: btnTpl,
          links: linkTpl,
          notes: noteTpl,
          tasks: taskTpl
        })
      });

      if (syncRes.ok) {
        setSyncMessage('Successfully synced all data from templates! 🚀');
        fetchButtons();
        fetchLinks();
      } else {
        const err = await syncRes.json();
        setSyncMessage(`Sync failed: ${err.error || 'Server error'}`);
      }
    } catch (err) {
      console.error(err);
      setSyncMessage(`Sync failed: ${err.message}`);
    } finally {
      setSyncing(false);
    }
  };

  // ──────────────────────────────────────────────
  // Buttons CRUD
  // ──────────────────────────────────────────────
  const handleAddButton = async (e) => {
    e.preventDefault();
    if (!newBtn.lesson_name || !newBtn.url) return;
    try {
      const sectionValue = (newBtn.grade === '2' || newBtn.grade === '3') ? newBtn.section : 'null';
      const res = await fetch('/api/buttons', {
        method: 'POST',
        headers: adminHeaders,
        body: JSON.stringify({
          ...newBtn,
          section: sectionValue
        })
      });
      if (res.ok) {
        setNewBtn({ ...newBtn, lesson_name: '', url: '' });
        fetchButtons();
      }
    } catch (err) {
      console.error(err);
    }
  };

  const handleDeleteButton = async (id) => {
    if (!confirm('Are you sure you want to delete this button?')) return;
    try {
      const res = await fetch(`/api/buttons?id=${id}`, {
        method: 'DELETE',
        headers: adminHeaders
      });
      if (res.ok) {
        fetchButtons();
      }
    } catch (err) {
      console.error(err);
    }
  };

  const startEditButton = (btn) => {
    setEditingBtn({ ...btn });
  };

  const cancelEditButton = () => {
    setEditingBtn(null);
  };

  const handleSaveButton = async () => {
    if (!editingBtn) return;
    setEditBtnSaving(true);
    try {
      const sectionValue = (editingBtn.grade === '2' || editingBtn.grade === '3') ? editingBtn.section : null;
      const res = await fetch('/api/buttons', {
        method: 'PUT',
        headers: adminHeaders,
        body: JSON.stringify({
          id: editingBtn.id,
          grade: editingBtn.grade,
          section: sectionValue,
          set_num: editingBtn.set_num,
          lesson_name: editingBtn.lesson_name,
          url: editingBtn.url
        })
      });
      if (res.ok) {
        setEditingBtn(null);
        fetchButtons();
      } else {
        const err = await res.json();
        alert(`Error: ${err.error}`);
      }
    } catch (err) {
      alert(`Error: ${err.message}`);
    } finally {
      setEditBtnSaving(false);
    }
  };

  // ──────────────────────────────────────────────
  // Links CRUD
  // ──────────────────────────────────────────────
  const handleAddLink = async (e) => {
    e.preventDefault();
    if (!newLink.title || !newLink.url) return;
    try {
      const res = await fetch('/api/links', {
        method: 'POST',
        headers: adminHeaders,
        body: JSON.stringify(newLink)
      });
      if (res.ok) {
        setNewLink({ type: 'document', title: '', url: '', icon: 'pdf' });
        fetchLinks();
      }
    } catch (err) {
      console.error(err);
    }
  };

  const handleDeleteLink = async (id) => {
    if (!confirm('Are you sure you want to delete this link?')) return;
    try {
      const res = await fetch(`/api/links?id=${id}`, {
        method: 'DELETE',
        headers: adminHeaders
      });
      if (res.ok) {
        fetchLinks();
      }
    } catch (err) {
      console.error(err);
    }
  };

  const startEditLink = (link) => {
    setEditingLink({ ...link });
  };

  const cancelEditLink = () => {
    setEditingLink(null);
  };

  const handleSaveLink = async () => {
    if (!editingLink) return;
    setEditLinkSaving(true);
    try {
      const res = await fetch('/api/links', {
        method: 'PUT',
        headers: adminHeaders,
        body: JSON.stringify({
          id: editingLink.id,
          type: editingLink.type,
          title: editingLink.title,
          url: editingLink.url,
          icon: editingLink.icon || null
        })
      });
      if (res.ok) {
        setEditingLink(null);
        fetchLinks();
      } else {
        const err = await res.json();
        alert(`Error: ${err.error}`);
      }
    } catch (err) {
      alert(`Error: ${err.message}`);
    } finally {
      setEditLinkSaving(false);
    }
  };

  // ──────────────────────────────────────────────
  // Password Actions
  // ──────────────────────────────────────────────
  const handlePasswordChange = async (e, type) => {
    e.preventDefault();
    setPassMessage('');
    setPassError('');
    const config = type === 'site' ? sitePassConfig : adminPassConfig;

    try {
      const res = await fetch('/api/auth/change', {
        method: 'POST',
        headers: adminHeaders,
        body: JSON.stringify({
          role: type,
          currentPassword: config.currentPassword,
          newPassword: config.newPassword
        })
      });

      if (res.ok) {
        setPassMessage(`Successfully updated ${type} password!`);
        if (type === 'site') setSitePassConfig({ currentPassword: '', newPassword: '' });
        else setAdminPassConfig({ currentPassword: '', newPassword: '' });
      } else {
        const data = await res.json();
        setPassError(data.error || 'Failed to change password');
      }
    } catch (err) {
      setPassError(err.message);
    }
  };

  // ──────────────────────────────────────────────
  // If not admin, challenge for Admin Password
  // ──────────────────────────────────────────────
  if (role !== 'admin') {
    return (
      <div className="glass-panel" style={{ maxWidth: '500px', margin: '2rem auto' }}>
        <div style={{ textAlign: 'center', marginBottom: '1.5rem' }}>
          <Lock size={48} style={{ color: 'var(--fun-pink)' }} />
          <h2 className="funky-title" style={{ fontSize: '2rem', display: 'block' }}>Admin Lock</h2>
          <p style={{ fontWeight: 600, color: 'var(--text-muted)' }}>Enter the teacher/admin password to modify settings.</p>
        </div>
        <form onSubmit={handleAdminLogin} className="password-form">
          <input 
            type="password" 
            className="password-input" 
            placeholder="Admin Password..." 
            value={adminPasswordInput}
            onChange={(e) => setAdminPasswordInput(e.target.value)}
            required
          />
          <button type="submit" className="unlock-btn" style={{ backgroundColor: 'var(--fun-pink)', color: '#fff' }}>
            Verify Admin
          </button>
          {authError && <div className="error-text" style={{ textAlign: 'center' }}>{authError}</div>}
        </form>
      </div>
    );
  }

  return (
    <div className="main-content">
      {/* Template Seeding Widget */}
      <div className="glass-panel sync-bar">
        <div>
          <h4 className="sync-title">Template Directory Sync</h4>
          <p className="sync-desc">Overwrite the database with custom layouts specified in files like public/templates/buttons.json.</p>
        </div>
        <button className="sync-btn" onClick={handleSyncTemplates} disabled={syncing}>
          <RefreshCw size={16} className={syncing ? 'animate-spin' : ''} style={{ verticalAlign: 'middle', marginRight: '6px' }} />
          {syncing ? 'Syncing...' : 'Sync from Templates'}
        </button>
      </div>
      {syncMessage && (
        <div className="glass-panel" style={{ marginBottom: '1.5rem', backgroundColor: '#ecfdf5', borderColor: '#10b981', padding: '1rem' }}>
          <strong style={{ color: '#047857' }}>{syncMessage}</strong>
        </div>
      )}

      {/* Edit Button Modal */}
      {editingBtn && (
        <div style={{
          position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.55)', zIndex: 1000,
          display: 'flex', alignItems: 'center', justifyContent: 'center'
        }}>
          <div className="dashboard-card" style={{ minWidth: '360px', maxWidth: '480px', width: '90%', position: 'relative' }}>
            <button onClick={cancelEditButton} style={{
              position: 'absolute', top: '1rem', right: '1rem',
              background: 'none', border: 'none', cursor: 'pointer', color: 'var(--text-muted)'
            }}><X size={20} /></button>
            <h3 className="card-title" style={{ marginBottom: '1.2rem' }}>
              <Edit2 size={18} style={{ color: 'var(--fun-pink)' }} />
              <span>Edit Lesson Button</span>
            </h3>
            <div className="admin-form-group">
              <label>Grade</label>
              <select className="admin-select" value={editingBtn.grade}
                onChange={e => setEditingBtn({ ...editingBtn, grade: e.target.value })}>
                {['2','3','4','5','6','7','8'].map(g => <option key={g} value={g}>Grade {g}</option>)}
              </select>
            </div>
            {(editingBtn.grade === '2' || editingBtn.grade === '3') && (
              <div className="admin-form-group">
                <label>Section</label>
                <select className="admin-select" value={editingBtn.section || 'A'}
                  onChange={e => setEditingBtn({ ...editingBtn, section: e.target.value })}>
                  <option value="A">Section A</option>
                  <option value="B">Section B</option>
                </select>
              </div>
            )}
            <div className="admin-form-group">
              <label>Set (Group)</label>
              <select className="admin-select" value={editingBtn.set_num}
                onChange={e => setEditingBtn({ ...editingBtn, set_num: e.target.value })}>
                <option value="1">Set 1 (First 7)</option>
                <option value="2">Set 2 (Second 7)</option>
              </select>
            </div>
            <div className="admin-form-group">
              <label>Lesson Name</label>
              <input type="text" className="admin-input" value={editingBtn.lesson_name}
                onChange={e => setEditingBtn({ ...editingBtn, lesson_name: e.target.value })} required />
            </div>
            <div className="admin-form-group">
              <label>Redirect URL</label>
              <input type="url" className="admin-input" value={editingBtn.url}
                onChange={e => setEditingBtn({ ...editingBtn, url: e.target.value })} required />
            </div>
            <div style={{ display: 'flex', gap: '0.75rem', marginTop: '1rem' }}>
              <button className="admin-submit-btn" onClick={handleSaveButton} disabled={editBtnSaving}
                style={{ flex: 1 }}>
                <Check size={16} style={{ verticalAlign: 'middle', marginRight: '4px' }} />
                {editBtnSaving ? 'Saving...' : 'Save Changes'}
              </button>
              <button onClick={cancelEditButton}
                style={{ flex: 1, padding: '0.6rem', border: '2px solid #e5e7eb', borderRadius: '8px', cursor: 'pointer', fontWeight: 700 }}>
                Cancel
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Edit Link Modal */}
      {editingLink && (
        <div style={{
          position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.55)', zIndex: 1000,
          display: 'flex', alignItems: 'center', justifyContent: 'center'
        }}>
          <div className="dashboard-card" style={{ minWidth: '360px', maxWidth: '480px', width: '90%', position: 'relative' }}>
            <button onClick={cancelEditLink} style={{
              position: 'absolute', top: '1rem', right: '1rem',
              background: 'none', border: 'none', cursor: 'pointer', color: 'var(--text-muted)'
            }}><X size={20} /></button>
            <h3 className="card-title" style={{ marginBottom: '1.2rem' }}>
              <Edit2 size={18} style={{ color: 'var(--fun-blue)' }} />
              <span>Edit Dashboard Link</span>
            </h3>
            <div className="admin-form-group">
              <label>Link Type / Section</label>
              <select className="admin-select" value={editingLink.type}
                onChange={e => setEditingLink({ ...editingLink, type: e.target.value })}>
                <option value="document">Documents Library</option>
                <option value="sheet">Google Sheets</option>
                <option value="doc">Google Docs</option>
                <option value="game">Game Link</option>
              </select>
            </div>
            <div className="admin-form-group">
              <label>Link Title / Name</label>
              <input type="text" className="admin-input" value={editingLink.title}
                onChange={e => setEditingLink({ ...editingLink, title: e.target.value })} required />
            </div>
            <div className="admin-form-group">
              <label>Target URL</label>
              <input type="url" className="admin-input" value={editingLink.url}
                onChange={e => setEditingLink({ ...editingLink, url: e.target.value })} required />
            </div>
            {editingLink.type === 'document' && (
              <div className="admin-form-group">
                <label>Document Icon</label>
                <select className="admin-select" value={editingLink.icon || 'pdf'}
                  onChange={e => setEditingLink({ ...editingLink, icon: e.target.value })}>
                  <option value="pdf">PDF File (Red Logo)</option>
                  <option value="word">Word Document (Blue Logo)</option>
                </select>
              </div>
            )}
            <div style={{ display: 'flex', gap: '0.75rem', marginTop: '1rem' }}>
              <button className="admin-submit-btn" onClick={handleSaveLink} disabled={editLinkSaving}
                style={{ flex: 1, backgroundColor: 'var(--fun-blue)' }}>
                <Check size={16} style={{ verticalAlign: 'middle', marginRight: '4px' }} />
                {editLinkSaving ? 'Saving...' : 'Save Changes'}
              </button>
              <button onClick={cancelEditLink}
                style={{ flex: 1, padding: '0.6rem', border: '2px solid #e5e7eb', borderRadius: '8px', cursor: 'pointer', fontWeight: 700 }}>
                Cancel
              </button>
            </div>
          </div>
        </div>
      )}

      <div className="admin-grid">
        {/* Left Hand: Management Forms */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: '2rem' }}>
          
          {/* Add Lesson Button */}
          <div className="dashboard-card">
            <h3 className="card-title">
              <Plus size={20} style={{ color: 'var(--fun-pink)' }} />
              <span>Add Lesson Button</span>
            </h3>
            <form onSubmit={handleAddButton}>
              <div className="admin-form-group">
                <label>Select Grade</label>
                <select 
                  className="admin-select"
                  value={newBtn.grade}
                  onChange={(e) => setNewBtn({ ...newBtn, grade: e.target.value })}
                >
                  {['2', '3', '4', '5', '6', '7', '8'].map(g => (
                    <option key={g} value={g}>Grade {g}</option>
                  ))}
                </select>
              </div>

              {(newBtn.grade === '2' || newBtn.grade === '3') && (
                <div className="admin-form-group">
                  <label>Section</label>
                  <select 
                    className="admin-select"
                    value={newBtn.section}
                    onChange={(e) => setNewBtn({ ...newBtn, section: e.target.value })}
                  >
                    <option value="A">Section A</option>
                    <option value="B">Section B</option>
                  </select>
                </div>
              )}

              <div className="admin-form-group">
                <label>Set (Group)</label>
                <select 
                  className="admin-select"
                  value={newBtn.set_num}
                  onChange={(e) => setNewBtn({ ...newBtn, set_num: e.target.value })}
                >
                  <option value="1">Set 1 (First set of 7)</option>
                  <option value="2">Set 2 (Second set of 7)</option>
                </select>
              </div>

              <div className="admin-form-group">
                <label>Lesson Name</label>
                <input 
                  type="text" 
                  className="admin-input" 
                  placeholder="e.g. Science Quest 2"
                  value={newBtn.lesson_name}
                  onChange={(e) => setNewBtn({ ...newBtn, lesson_name: e.target.value })}
                  required
                />
              </div>

              <div className="admin-form-group">
                <label>Redirect URL</label>
                <input 
                  type="url" 
                  className="admin-input" 
                  placeholder="https://example.com/lesson"
                  value={newBtn.url}
                  onChange={(e) => setNewBtn({ ...newBtn, url: e.target.value })}
                  required
                />
              </div>

              <button type="submit" className="admin-submit-btn">Add Lesson Button</button>
            </form>
          </div>

          {/* Add Home Dashboard Link */}
          <div className="dashboard-card">
            <h3 className="card-title">
              <LinkIcon size={20} style={{ color: 'var(--fun-blue)' }} />
              <span>Add Dashboard Link</span>
            </h3>
            <form onSubmit={handleAddLink}>
              <div className="admin-form-group">
                <label>Link Type / Section</label>
                <select 
                  className="admin-select"
                  value={newLink.type}
                  onChange={(e) => setNewLink({ ...newLink, type: e.target.value })}
                >
                  <option value="document">Documents Library (represented as logos)</option>
                  <option value="sheet">Google Sheets Section</option>
                  <option value="doc">Google Docs Section</option>
                  <option value="game">Game Link Button</option>
                </select>
              </div>

              <div className="admin-form-group">
                <label>Link Title / Name</label>
                <input 
                  type="text" 
                  className="admin-input" 
                  placeholder="e.g. Semester Gradesheet"
                  value={newLink.title}
                  onChange={(e) => setNewLink({ ...newLink, title: e.target.value })}
                  required
                />
              </div>

              <div className="admin-form-group">
                <label>Target URL</label>
                <input 
                  type="url" 
                  className="admin-input" 
                  placeholder="https://docs.google.com/..."
                  value={newLink.url}
                  onChange={(e) => setNewLink({ ...newLink, url: e.target.value })}
                  required
                />
              </div>

              {newLink.type === 'document' && (
                <div className="admin-form-group">
                  <label>Document Icon Representation</label>
                  <select 
                    className="admin-select"
                    value={newLink.icon}
                    onChange={(e) => setNewLink({ ...newLink, icon: e.target.value })}
                  >
                    <option value="pdf">PDF File (Red Logo)</option>
                    <option value="word">Word Document (Blue Logo)</option>
                  </select>
                </div>
              )}

              <button type="submit" className="admin-submit-btn" style={{ backgroundColor: 'var(--fun-blue)' }}>
                Add Link
              </button>
            </form>
          </div>

          {/* Password Management */}
          <div className="dashboard-card">
            <h3 className="card-title">
              <Key size={20} style={{ color: 'var(--fun-orange)' }} />
              <span>Password Manager</span>
            </h3>

            {passMessage && <div style={{ color: '#047857', fontWeight: 700, marginBottom: '0.5rem' }}>{passMessage}</div>}
            {passError && <div style={{ color: '#ef4444', fontWeight: 700, marginBottom: '0.5rem' }}>{passError}</div>}

            {/* Change Site Lock Password */}
            <form onSubmit={(e) => handlePasswordChange(e, 'site')} style={{ marginBottom: '1.5rem', borderBottom: '1px solid #eee', paddingBottom: '1rem' }}>
              <strong style={{ fontSize: '0.9rem', display: 'block', marginBottom: '0.5rem' }}>Change Site Password</strong>
              <div className="admin-form-group">
                <input 
                  type="password" 
                  className="admin-input" 
                  placeholder="Current password..." 
                  value={sitePassConfig.currentPassword}
                  onChange={(e) => setSitePassConfig({ ...sitePassConfig, currentPassword: e.target.value })}
                  required
                />
              </div>
              <div className="admin-form-group">
                <input 
                  type="password" 
                  className="admin-input" 
                  placeholder="New site password..." 
                  value={sitePassConfig.newPassword}
                  onChange={(e) => setSitePassConfig({ ...sitePassConfig, newPassword: e.target.value })}
                  required
                />
              </div>
              <button type="submit" className="admin-submit-btn" style={{ backgroundColor: 'var(--fun-orange)', fontSize: '0.9rem', padding: '0.5rem' }}>
                Change Site Password
              </button>
            </form>

            {/* Change Admin Password */}
            <form onSubmit={(e) => handlePasswordChange(e, 'admin')}>
              <strong style={{ fontSize: '0.9rem', display: 'block', marginBottom: '0.5rem' }}>Change Admin Password</strong>
              <div className="admin-form-group">
                <input 
                  type="password" 
                  className="admin-input" 
                  placeholder="Current admin password..." 
                  value={adminPassConfig.currentPassword}
                  onChange={(e) => setAdminPassConfig({ ...adminPassConfig, currentPassword: e.target.value })}
                  required
                />
              </div>
              <div className="admin-form-group">
                <input 
                  type="password" 
                  className="admin-input" 
                  placeholder="New admin password..." 
                  value={adminPassConfig.newPassword}
                  onChange={(e) => setAdminPassConfig({ ...adminPassConfig, newPassword: e.target.value })}
                  required
                />
              </div>
              <button type="submit" className="admin-submit-btn" style={{ backgroundColor: 'var(--fun-purple)', fontSize: '0.9rem', padding: '0.5rem' }}>
                Change Admin Password
              </button>
            </form>
          </div>

        </div>

        {/* Right Hand: Buttons & Links View/Edit/Delete */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: '2rem' }}>
          
          {/* Lesson Buttons Manager */}
          <div className="dashboard-card" style={{ flex: 1 }}>
            <h3 className="card-title">
              <Layers size={20} style={{ color: 'var(--fun-pink)' }} />
              <span>Configure Lesson Buttons</span>
            </h3>

            {/* Filter controls */}
            <div style={{ display: 'flex', gap: '1rem', marginBottom: '1.2rem' }}>
              <div style={{ flex: 1 }}>
                <label style={{ fontSize: '0.85rem', fontWeight: 700, color: 'var(--text-muted)' }}>Grade</label>
                <select 
                  className="admin-select" 
                  style={{ width: '100%' }}
                  value={filterGrade} 
                  onChange={(e) => setFilterGrade(e.target.value)}
                >
                  {['2', '3', '4', '5', '6', '7', '8'].map(g => (
                    <option key={g} value={g}>Grade {g}</option>
                  ))}
                </select>
              </div>

              {(filterGrade === '2' || filterGrade === '3') && (
                <div style={{ flex: 1 }}>
                  <label style={{ fontSize: '0.85rem', fontWeight: 700, color: 'var(--text-muted)' }}>Section</label>
                  <select 
                    className="admin-select" 
                    style={{ width: '100%' }}
                    value={filterSection} 
                    onChange={(e) => setFilterSection(e.target.value)}
                  >
                    <option value="A">Section A</option>
                    <option value="B">Section B</option>
                  </select>
                </div>
              )}
            </div>

            <div className="admin-buttons-list">
              <strong style={{ display: 'block', marginBottom: '0.5rem', fontSize: '0.9rem' }}>
                Buttons in database ({buttons.length})
              </strong>
              {buttons.map(btn => (
                <div key={btn.id} className="admin-button-item">
                  <div style={{ overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap', marginRight: '1rem', flex: 1 }}>
                    <span style={{ fontSize: '0.8rem', background: '#e0f2fe', color: '#0369a1', padding: '2px 6px', borderRadius: '4px', marginRight: '6px', fontWeight: 700 }}>
                      Set {btn.set_num}
                    </span>
                    <strong style={{ fontSize: '0.95rem' }}>{btn.lesson_name}</strong>
                    <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)', overflow: 'hidden', textOverflow: 'ellipsis' }}>{btn.url}</div>
                  </div>
                  <div style={{ display: 'flex', gap: '0.4rem', flexShrink: 0 }}>
                    <button onClick={() => startEditButton(btn)} className="btn-edit" title="Edit">
                      <Edit2 size={14} />
                    </button>
                    <button onClick={() => handleDeleteButton(btn.id)} className="btn-delete" title="Delete">
                      <Trash2 size={14} />
                    </button>
                  </div>
                </div>
              ))}
              {buttons.length === 0 && (
                <div style={{ textAlign: 'center', padding: '2rem', color: 'var(--text-muted)', fontStyle: 'italic' }}>
                  No buttons found for Grade {filterGrade}{(filterGrade === '2' || filterGrade === '3') ? ` Section ${filterSection}` : ''}.
                </div>
              )}
            </div>
          </div>

          {/* Home Links Manager */}
          <div className="dashboard-card">
            <h3 className="card-title">
              <LinkIcon size={20} style={{ color: 'var(--fun-blue)' }} />
              <span>Configure Dashboard Links</span>
            </h3>

            <div className="admin-buttons-list" style={{ maxHeight: '350px' }}>
              {links.map(link => (
                <div key={link.id} className="admin-button-item">
                  <div style={{ overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap', marginRight: '1rem', flex: 1 }}>
                    <span style={{ fontSize: '0.8rem', background: '#fef3c7', color: '#d97706', padding: '2px 6px', borderRadius: '4px', marginRight: '6px', fontWeight: 700, textTransform: 'capitalize' }}>
                      {link.type}
                    </span>
                    <strong style={{ fontSize: '0.95rem' }}>{link.title}</strong>
                    <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>{link.url}</div>
                  </div>
                  <div style={{ display: 'flex', gap: '0.4rem', flexShrink: 0 }}>
                    <button onClick={() => startEditLink(link)} className="btn-edit" title="Edit">
                      <Edit2 size={14} />
                    </button>
                    <button onClick={() => handleDeleteLink(link.id)} className="btn-delete" title="Delete">
                      <Trash2 size={14} />
                    </button>
                  </div>
                </div>
              ))}
              {links.length === 0 && (
                <div style={{ textAlign: 'center', padding: '2rem', color: 'var(--text-muted)', fontStyle: 'italic' }}>
                  No dashboard links found.
                </div>
              )}
            </div>
          </div>

        </div>
      </div>
    </div>
  );
}
