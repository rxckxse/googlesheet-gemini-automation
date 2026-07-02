"use client";

import React, { useEffect, useState } from 'react';
import './settings.css';

function makeHistoryItem(input, status, details) {
  return {
    timestamp: new Date().toLocaleTimeString(),
    input: input.substring(0, 48) + (input.length > 48 ? '...' : ''),
    model: 'server-default',
    status,
    ...(details ? { details } : {}),
  };
}

function readHistory() {
  if (typeof window === 'undefined') return [];

  try {
    return JSON.parse(localStorage.getItem('geminiHistory') || '[]');
  } catch (e) {
    console.warn('Failed to load history:', e);
    return [];
  }
}

function saveHistoryItem(item) {
  if (typeof window === 'undefined') return [];

  try {
    const nextHistory = [item, ...readHistory()].slice(0, 20);
    localStorage.setItem('geminiHistory', JSON.stringify(nextHistory));
    return nextHistory;
  } catch (e) {
    console.warn('Failed to save history:', e);
    return [];
  }
}

async function readServerConfig() {
  const response = await fetch('/api/config');
  const data = await response.json();

  if (!response.ok) {
    throw new Error(data.error || 'Config load failed: ' + response.status);
  }

  return data;
}

async function saveServerConfig(systemInstruction) {
  const response = await fetch('/api/config', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ systemInstruction }),
  });
  const data = await response.json();

  if (!response.ok) {
    throw new Error(data.error || 'Config save failed: ' + response.status);
  }

  return data;
}

export default function SettingsPage() {
  const [systemInstruction, setSystemInstruction] = useState('');
  const [history, setHistory] = useState(() => readHistory());
  const [saveStatus, setSaveStatus] = useState('');
  const [playgroundInput, setPlaygroundInput] = useState('');
  const [playgroundResult, setPlaygroundResult] = useState('');
  const [playgroundLoading, setPlaygroundLoading] = useState(false);

  useEffect(() => {
    let isActive = true;

    readServerConfig()
      .then((config) => {
        if (isActive) setSystemInstruction(config.systemInstruction || '');
      })
      .catch((e) => {
        console.warn('Server config is not available:', e);
        setSaveStatus('Could not load saved prompt');
      });

    return () => {
      isActive = false;
    };
  }, []);

  const handleSaveConfig = async () => {
    setSaveStatus('Saving...');

    try {
      await saveServerConfig(systemInstruction);
      setSaveStatus('Prompt saved');
      setTimeout(() => setSaveStatus(''), 3000);
    } catch (e) {
      console.error('Server config save failed:', e);
      setSaveStatus('Save failed');
    }
  };

  const handleClearHistory = () => {
    localStorage.removeItem('geminiHistory');
    setHistory([]);
  };

  const handleRunPlayground = async () => {
    if (!playgroundInput.trim()) return;

    setPlaygroundLoading(true);
    setPlaygroundResult('Thinking...');

    try {
      const response = await fetch('/api/gemini', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ text: playgroundInput }),
      });
      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || 'Server error: ' + response.status);
      }

      setPlaygroundResult(data.result);
      setHistory(saveHistoryItem(makeHistoryItem(playgroundInput, 'success')));
    } catch (err) {
      setPlaygroundResult('Error: ' + err.message);
      setHistory(saveHistoryItem(makeHistoryItem(playgroundInput, 'error', err.message)));
    } finally {
      setPlaygroundLoading(false);
    }
  };

  return (
    <main className="settings-container">
      <header className="header">
        <div className="logo-mark">G</div>
        <div className="title-container">
          <h1>Google Sheets Gemini</h1>
          <p>Backend prompt configuration</p>
        </div>
      </header>

      <section className="card">
        <div className="card-title">Saved Prompt</div>
        <div className="form-group">
          <label htmlFor="system-instruction">System instruction used by =GEMINI_ASK(A2)</label>
          <textarea
            id="system-instruction"
            className="textarea-input"
            value={systemInstruction}
            onChange={(e) => setSystemInstruction(e.target.value)}
            placeholder="Example: Clean this row text, return only a concise summary, and do not add extra commentary."
          />
        </div>
        <button className="btn" onClick={handleSaveConfig}>Save Prompt</button>
        {saveStatus && <div className="save-status">{saveStatus}</div>}
      </section>

      <section className="card">
        <div className="card-title">Formula Test</div>
        <div className="form-group">
          <label htmlFor="playground-prompt">Input text</label>
          <input
            id="playground-prompt"
            type="text"
            className="text-input"
            value={playgroundInput}
            onChange={(e) => setPlaygroundInput(e.target.value)}
            onKeyDown={(e) => e.key === 'Enter' && handleRunPlayground()}
            placeholder="Type the same text you would pass from a sheet cell"
            disabled={playgroundLoading}
          />
        </div>
        <button className="btn btn-secondary" onClick={handleRunPlayground} disabled={playgroundLoading}>
          {playgroundLoading ? 'Processing...' : 'Run Backend Test'}
        </button>
        {playgroundResult && <div className="playground-result">{playgroundResult}</div>}
      </section>

      <section className="card">
        <div className="card-title history-title">
          <span>Recent Tests</span>
          {history.length > 0 && <button onClick={handleClearHistory} className="clear-button">Clear</button>}
        </div>
        {history.length === 0 ? (
          <div className="empty-state">No recent tests. In Google Sheets use =GEMINI_ASK(A2).</div>
        ) : (
          <ul className="history-list">
            {history.map((item, idx) => (
              <li key={`${item.timestamp}-${idx}`} className="history-item">
                <div className="history-info">
                  <span className="history-prompt">&quot;{item.input}&quot;</span>
                  <span className="history-meta">{item.timestamp} <span className="badge-model">{item.model}</span></span>
                </div>
                <span className={`history-status ${item.status === 'success' ? 'status-ok' : 'status-fail'}`}>
                  {item.status === 'success' ? 'SUCCESS' : 'ERROR'}
                </span>
              </li>
            ))}
          </ul>
        )}
      </section>

      <footer className="footer">Google Sheets formula: =GEMINI_ASK(A2)</footer>
    </main>
  );
}