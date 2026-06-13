import React, { useState, useEffect } from 'react';
import { ArrowLeft, BookOpen, ExternalLink, Sparkles } from 'lucide-react';

export default function GradeView({ grade, authToken, onLogout }) {
  const [section, setSection] = useState(null); // 'A', 'B', or null (only for grades 2 & 3)
  const [buttons, setButtons] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const hasSections = grade === '2' || grade === '3';

  useEffect(() => {
    // Reset section selection when grade changes
    setSection(null);
    setButtons([]);
    setError('');

    // If it doesn't have sections, fetch right away
    if (!hasSections) {
      fetchButtons(null);
    }
  }, [grade]);

  const fetchButtons = async (sect) => {
    setLoading(true);
    setError('');
    
    let url = `/api/buttons?grade=${grade}`;
    if (sect) {
      url += `&section=${sect}`;
    }

    try {
      const res = await fetch(url, {
        headers: {
          'Authorization': authToken,
          'Content-Type': 'application/json'
        }
      });

      if (res.status === 401) {
        onLogout();
        return;
      }

      if (!res.ok) {
        throw new Error('Failed to load lesson buttons');
      }

      const data = await res.json();
      setButtons(data || []);
    } catch (err) {
      console.error(err);
      setError('Error loading buttons. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const handleSelectSection = (secCode) => {
    setSection(secCode);
    fetchButtons(secCode);
  };

  const handleResetSection = () => {
    setSection(null);
    setButtons([]);
  };

  // Group buttons by set (1 or 2)
  const set1Buttons = buttons.filter(btn => btn.set_num === 1);
  const set2Buttons = buttons.filter(btn => btn.set_num === 2);

  // If we need section selection and haven't chosen yet
  if (hasSections && section === null) {
    return (
      <div className="glass-panel">
        <div className="section-chooser">
          <div className="funky-subtitle" style={{ background: 'var(--fun-pink)', color: 'white', border: '3px solid var(--text-main)' }}>
            GRADE {grade} PORTAL
          </div>
          <h2 className="chooser-title">Choose Your Section!</h2>
          <div className="chooser-buttons">
            <button 
              className="section-btn sec-a" 
              onClick={() => handleSelectSection('A')}
            >
              SECTION A
            </button>
            <button 
              className="section-btn sec-b" 
              onClick={() => handleSelectSection('B')}
            >
              SECTION B
            </button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="glass-panel">
      <div className="grade-header-bar">
        <div>
          <h2>
            Grade {grade} {section ? `- Section ${section}` : ''}
          </h2>
          <span className="funky-subtitle" style={{ fontSize: '0.9rem', marginTop: '0.3rem', background: 'var(--fun-green)', color: 'var(--text-main)' }}>
            Lesson Showcase 📚
          </span>
        </div>
        {hasSections && (
          <button className="back-btn" onClick={handleResetSection}>
            <ArrowLeft size={16} style={{ verticalAlign: 'middle', marginRight: '4px' }} />
            Switch Section
          </button>
        )}
      </div>

      {loading && (
        <div style={{ textAlign: 'center', padding: '2rem' }}>
          <h3 className="funky-title" style={{ fontSize: '1.5rem' }}>Gathering Lessons...</h3>
        </div>
      )}

      {error && <div className="error-text" style={{ padding: '1rem', textAlign: 'center' }}>{error}</div>}

      {!loading && !error && (
        <div>
          {/* Set 1 Showcase */}
          <div className="set-container">
            <h3 className="set-title" style={{ background: 'var(--fun-pink)' }}>
              Set A: Subject Exploration 🌟
            </h3>
            <div className="lesson-grid">
              {set1Buttons.map((btn) => (
                <a 
                  key={btn.id} 
                  href={btn.url} 
                  target="_blank" 
                  rel="noopener noreferrer" 
                  className="lesson-button"
                >
                  <BookOpen size={20} style={{ marginBottom: '6px', color: 'inherit' }} />
                  <span>{btn.lesson_name}</span>
                  <ExternalLink size={12} style={{ marginTop: '4px', opacity: 0.6 }} />
                </a>
              ))}
              {set1Buttons.length === 0 && (
                <div style={{ gridColumn: '1/-1', fontStyle: 'italic', color: 'var(--text-muted)', padding: '1rem' }}>
                  No lessons added to Set 1 yet.
                </div>
              )}
            </div>
          </div>

          {/* Set 2 Showcase */}
          <div className="set-container" style={{ marginTop: '3rem' }}>
            <h3 className="set-title" style={{ background: 'var(--fun-blue)' }}>
              Set B: Subject Exploration 🚀
            </h3>
            <div className="lesson-grid">
              {set2Buttons.map((btn) => (
                <a 
                  key={btn.id} 
                  href={btn.url} 
                  target="_blank" 
                  rel="noopener noreferrer" 
                  className="lesson-button"
                >
                  <Sparkles size={20} style={{ marginBottom: '6px', color: 'inherit' }} />
                  <span>{btn.lesson_name}</span>
                  <ExternalLink size={12} style={{ marginTop: '4px', opacity: 0.6 }} />
                </a>
              ))}
              {set2Buttons.length === 0 && (
                <div style={{ gridColumn: '1/-1', fontStyle: 'italic', color: 'var(--text-muted)', padding: '1rem' }}>
                  No lessons added to Set 2 yet.
                </div>
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
