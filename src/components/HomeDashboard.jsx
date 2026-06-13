import React, { useState, useEffect } from 'react';
import { 
  Pin, Plus, Trash2, Check, FileText, 
  FileSpreadsheet, Gamepad2, Sparkles, LogOut, Settings 
} from 'lucide-react';

export default function HomeDashboard({ authToken, role, onLogout, onGoToAdmin }) {
  const [notes, setNotes] = useState([]);
  const [newNote, setNewNote] = useState('');
  const [noteColor, setNoteColor] = useState('#fef08a');
  
  const [tasks, setTasks] = useState([]);
  const [newTask, setNewTask] = useState('');
  
  const [links, setLinks] = useState([]);
  
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  const noteColors = [
    { value: '#fef08a', name: 'Yellow' }, // yellow
    { value: '#bbf7d0', name: 'Green' },  // green
    { value: '#bfdbfe', name: 'Blue' },   // blue
    { value: '#fbcfe8', name: 'Pink' },   // pink
    { value: '#ddd6fe', name: 'Purple' }  // purple
  ];

  const apiHeaders = {
    'Content-Type': 'application/json',
    'Authorization': authToken,
  };

  const adminHeaders = {
    'Content-Type': 'application/json',
    'Authorization': authToken,
    'X-Admin-Token': authToken,
  };

  useEffect(() => {
    fetchDashboardData();
  }, [authToken]);

  const fetchDashboardData = async () => {
    setLoading(true);
    try {
      const [notesRes, tasksRes, linksRes] = await Promise.all([
        fetch('/api/notes', { headers: apiHeaders }),
        fetch('/api/tasks', { headers: apiHeaders }),
        fetch('/api/links', { headers: apiHeaders })
      ]);

      if (notesRes.status === 401 || tasksRes.status === 401 || linksRes.status === 401) {
        onLogout();
        return;
      }

      const notesData = await notesRes.json();
      const tasksData = await tasksRes.json();
      const linksData = await linksRes.json();

      setNotes(notesData || []);
      setTasks(tasksData || []);
      setLinks(linksData || []);
      setLoading(false);
    } catch (err) {
      console.error(err);
      setError('Failed to fetch dashboard data. Please try again.');
      setLoading(false);
    }
  };

  // Notes actions
  const handleAddNote = async (e) => {
    e.preventDefault();
    if (!newNote.trim()) return;
    try {
      const res = await fetch('/api/notes', {
        method: 'POST',
        headers: apiHeaders,
        body: JSON.stringify({ content: newNote, color: noteColor })
      });
      if (res.ok) {
        const data = await res.json();
        setNotes([{ id: data.id, content: newNote, color: noteColor }, ...notes]);
        setNewNote('');
      }
    } catch (err) {
      console.error(err);
    }
  };

  const handleDeleteNote = async (id) => {
    try {
      const res = await fetch(`/api/notes?id=${id}`, {
        method: 'DELETE',
        headers: role === 'admin' ? adminHeaders : apiHeaders
      });
      if (res.ok) {
        setNotes(notes.filter(n => n.id !== id));
      } else {
        alert('Only Admins can delete notes!');
      }
    } catch (err) {
      console.error(err);
    }
  };

  // Tasks actions
  const handleAddTask = async (e) => {
    e.preventDefault();
    if (!newTask.trim()) return;
    try {
      const res = await fetch('/api/tasks', {
        method: 'POST',
        headers: apiHeaders,
        body: JSON.stringify({ text: newTask, completed: 0 })
      });
      if (res.ok) {
        const data = await res.json();
        setTasks([...tasks, { id: data.id, text: newTask, completed: 0 }]);
        setNewTask('');
      }
    } catch (err) {
      console.error(err);
    }
  };

  const handleToggleTask = async (task) => {
    const nextCompleted = task.completed === 1 ? 0 : 1;
    try {
      const res = await fetch('/api/tasks', {
        method: 'PUT',
        headers: apiHeaders,
        body: JSON.stringify({ id: task.id, completed: nextCompleted })
      });
      if (res.ok) {
        setTasks(tasks.map(t => t.id === task.id ? { ...t, completed: nextCompleted } : t));
      }
    } catch (err) {
      console.error(err);
    }
  };

  const handleDeleteTask = async (id) => {
    try {
      const res = await fetch(`/api/tasks?id=${id}`, {
        method: 'DELETE',
        headers: role === 'admin' ? adminHeaders : apiHeaders
      });
      if (res.ok) {
        setTasks(tasks.filter(t => t.id !== id));
      } else {
        alert('Only Admins can delete tasks!');
      }
    } catch (err) {
      console.error(err);
    }
  };

  if (loading) {
    return (
      <div className="glass-panel" style={{ textAlign: 'center', padding: '3rem' }}>
        <h2 className="funky-title" style={{ fontSize: '2rem' }}>Loading Dashboard...</h2>
      </div>
    );
  }

  // Filter links
  const documentsList = links.filter(l => l.type === 'document');
  const googleSheetsList = links.filter(l => l.type === 'sheet');
  const googleDocsList = links.filter(l => l.type === 'doc');
  const gameLink = links.find(l => l.type === 'game') || { url: 'https://play2048.co/', title: 'Fun Math Game' };

  return (
    <div className="main-content">
      {error && <div className="glass-panel error-text">{error}</div>}

      <div className="dashboard-grid">
        
        {/* Play Game Button (Span 2 Columns) */}
        <div className="grid-span-2" style={{ textAlign: 'center', margin: '1rem 0 2rem 0' }}>
          <a href={gameLink.url} target="_blank" rel="noopener noreferrer" className="game-play-btn">
            <Gamepad2 size={36} />
            <span>PLAY GAME: {gameLink.title}</span>
            <Sparkles size={28} />
          </a>
        </div>

        {/* Notes Board Card */}
        <div className="glass-panel grid-span-2">
          <h3 className="card-title">
            <Pin size={24} style={{ color: 'var(--fun-pink)' }} />
            <span>Classroom Sticky Notes Board</span>
          </h3>
          
          <form onSubmit={handleAddNote} className="note-input-container">
            <input 
              type="text" 
              className="note-input" 
              placeholder="Write a message on the sticky board..." 
              value={newNote}
              onChange={(e) => setNewNote(e.target.value)}
              maxLength={150}
            />
            <button type="submit" className="note-add-btn">Pin It!</button>
          </form>

          <div style={{ display: 'flex', alignItems: 'center', gap: '0.8rem', marginTop: '0.6rem' }}>
            <span style={{ fontSize: '0.9rem', fontWeight: 700 }}>Choose Color:</span>
            <div className="color-picker">
              {noteColors.map(c => (
                <div 
                  key={c.value} 
                  className={`color-dot ${noteColor === c.value ? 'selected' : ''}`}
                  style={{ backgroundColor: c.value }}
                  onClick={() => setNoteColor(c.value)}
                  title={c.name}
                />
              ))}
            </div>
          </div>

          <div className="notes-board">
            {notes.map(note => (
              <div key={note.id} className="sticky-note" style={{ backgroundColor: note.color }}>
                <div className="sticky-note-text">{note.content}</div>
                <div className="sticky-note-footer">
                  {role === 'admin' && (
                    <button onClick={() => handleDeleteNote(note.id)} className="note-btn" title="Delete note">
                      <Trash2 size={16} style={{ color: '#ef4444' }} />
                    </button>
                  )}
                </div>
              </div>
            ))}
            {notes.length === 0 && (
              <div style={{ gridColumn: '1/-1', textAlign: 'center', padding: '2rem', fontStyle: 'italic', color: 'var(--text-muted)' }}>
                No notes posted yet. Be the first to add one!
              </div>
            )}
          </div>
        </div>

        {/* Tasks Section Card */}
        <div className="dashboard-card">
          <h3 className="card-title">
            <Check size={24} style={{ color: 'var(--fun-green)' }} />
            <span>Interactive Task Board</span>
          </h3>

          <form onSubmit={handleAddTask} className="note-input-container" style={{ marginBottom: '1.2rem' }}>
            <input 
              type="text" 
              className="note-input" 
              placeholder="Add a new task..." 
              value={newTask}
              onChange={(e) => setNewTask(e.target.value)}
            />
            <button type="submit" className="note-add-btn" style={{ backgroundColor: 'var(--fun-green)', color: 'var(--text-main)' }}>Add</button>
          </form>

          <div className="task-list">
            {tasks.map(task => (
              <div key={task.id} className={`task-item ${task.completed ? 'completed' : ''}`}>
                <div className="task-item-left" onClick={() => handleToggleTask(task)}>
                  <div className="task-checkbox">
                    {task.completed === 1 && <Check size={14} />}
                  </div>
                  <span className="task-text">{task.text}</span>
                </div>
                {role === 'admin' && (
                  <button onClick={() => handleDeleteTask(task.id)} className="note-btn" title="Delete task">
                    <Trash2 size={16} style={{ color: '#ef4444' }} />
                  </button>
                )}
              </div>
            ))}
            {tasks.length === 0 && (
              <span style={{ textAlign: 'center', fontStyle: 'italic', padding: '1rem', color: 'var(--text-muted)' }}>
                All tasks done! Add a new one above.
              </span>
            )}
          </div>
        </div>

        {/* Documents Section Card */}
        <div className="dashboard-card">
          <h3 className="card-title">
            <FileText size={24} style={{ color: 'var(--fun-blue)' }} />
            <span>Documents Library</span>
          </h3>
          <div className="logos-container">
            {documentsList.map(doc => (
              <a key={doc.id} href={doc.url} target="_blank" rel="noopener noreferrer" className="logo-item">
                <span className={`logo-icon icon-${doc.icon || 'pdf'}`}>
                  📄
                </span>
                <span className="logo-title">{doc.title}</span>
              </a>
            ))}
            {documentsList.length === 0 && (
              <span style={{ fontStyle: 'italic', color: 'var(--text-muted)', gridColumn: 'span 2', textAlign: 'center' }}>
                No documents uploaded yet.
              </span>
            )}
          </div>
        </div>

        {/* Google Sheets Section Card */}
        <div className="dashboard-card">
          <h3 className="card-title">
            <FileSpreadsheet size={24} style={{ color: '#10b981' }} />
            <span>Google Sheets Logs</span>
          </h3>
          <div className="logos-container">
            {googleSheetsList.map(sheet => (
              <a key={sheet.id} href={sheet.url} target="_blank" rel="noopener noreferrer" className="logo-item" style={{ borderColor: '#10b981' }}>
                <span className="logo-icon icon-sheets">📊</span>
                <span className="logo-title">{sheet.title}</span>
              </a>
            ))}
            {googleSheetsList.length === 0 && (
              <span style={{ fontStyle: 'italic', color: 'var(--text-muted)', gridColumn: 'span 2', textAlign: 'center' }}>
                No Google Sheets configured.
              </span>
            )}
          </div>
        </div>

        {/* Google Docs Section Card */}
        <div className="dashboard-card">
          <h3 className="card-title">
            <FileText size={24} style={{ color: '#4285f4' }} />
            <span>Google Docs Assignments</span>
          </h3>
          <div className="logos-container">
            {googleDocsList.map(doc => (
              <a key={doc.id} href={doc.url} target="_blank" rel="noopener noreferrer" className="logo-item" style={{ borderColor: '#4285f4' }}>
                <span className="logo-icon icon-docs">📝</span>
                <span className="logo-title">{doc.title}</span>
              </a>
            ))}
            {googleDocsList.length === 0 && (
              <span style={{ fontStyle: 'italic', color: 'var(--text-muted)', gridColumn: 'span 2', textAlign: 'center' }}>
                No Google Docs configured.
              </span>
            )}
          </div>
        </div>

      </div>
    </div>
  );
}
