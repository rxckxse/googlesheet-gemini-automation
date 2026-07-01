"use client";

import Image from 'next/image';
import React, { useEffect, useState } from 'react';
import './taskpane.css';

const MODEL_LABEL = 'server-default';
const OFFICE_JS_URL = 'https://appsforoffice.microsoft.com/lib/1.1/hosted/office.js';

function getOffice() {
  if (typeof window === 'undefined') {
    return undefined;
  }

  return window.Office;
}

function restoreHistoryMethods() {
  if (!window._historyCache || !window.history) return;

  if (window._historyCache.replaceState) {
    window.history.replaceState = window._historyCache.replaceState;
  }
  if (window._historyCache.pushState) {
    window.history.pushState = window._historyCache.pushState;
  }
}

function loadOfficeScript() {
  if (typeof window === 'undefined') {
    return Promise.resolve(undefined);
  }

  const existingOffice = getOffice();
  if (existingOffice) {
    return Promise.resolve(existingOffice);
  }

  if (window._officeJsLoadPromise) {
    return window._officeJsLoadPromise;
  }

  if (window.history) {
    window._historyCache = {
      replaceState: window.history.replaceState,
      pushState: window.history.pushState,
    };
  }

  window._officeJsLoadPromise = new Promise((resolve, reject) => {
    const existingScript = document.querySelector(`script[src="${OFFICE_JS_URL}"]`);
    const script = existingScript || document.createElement('script');

    script.onload = () => {
      restoreHistoryMethods();
      resolve(getOffice());
    };
    script.onerror = () => {
      restoreHistoryMethods();
      reject(new Error('Failed to load Office.js'));
    };

    if (!existingScript) {
      script.src = OFFICE_JS_URL;
      script.async = true;
      document.head.appendChild(script);
    }
  });

  return window._officeJsLoadPromise;
}

function readHistory() {
  if (typeof window === 'undefined' || typeof localStorage === 'undefined') {
    return [];
  }

  try {
    const historyJson = localStorage.getItem("geminiHistory") || "[]";
    return JSON.parse(historyJson);
  } catch (e) {
    console.warn("Failed to load history:", e);
    return [];
  }
}

function readSavedSystemInstruction() {
  if (typeof window === 'undefined' || typeof localStorage === 'undefined') {
    return "";
  }

  try {
    return localStorage.getItem("defaultSystemInstruction") || "";
  } catch (e) {
    console.warn("localStorage is not available:", e);
    return "";
  }
}

function makeHistoryItem(input, status, details) {
  return {
    timestamp: new Date().toLocaleTimeString(),
    input: input.substring(0, 30) + (input.length > 30 ? '...' : ''),
    model: MODEL_LABEL,
    status,
    ...(details ? { details } : {}),
  };
}

function saveHistoryItem(item) {
  if (typeof window === 'undefined' || typeof localStorage === 'undefined') {
    return [];
  }

  try {
    const historyJson = localStorage.getItem("geminiHistory") || "[]";
    const currentHistory = JSON.parse(historyJson);
    currentHistory.unshift(item);
    const nextHistory = currentHistory.slice(0, 20);
    localStorage.setItem("geminiHistory", JSON.stringify(nextHistory));
    return nextHistory;
  } catch (e) {
    console.warn("Failed to save history:", e);
    return [];
  }
}

export default function TaskpanePage() {
  const [isOfficeInitialized, setIsOfficeInitialized] = useState(false);
  const [systemInstruction, setSystemInstruction] = useState('');
  const [history, setHistory] = useState([]);
  const [saveStatus, setSaveStatus] = useState('');
  const [playgroundInput, setPlaygroundInput] = useState('');
  const [playgroundResult, setPlaygroundResult] = useState('');
  const [playgroundLoading, setPlaygroundLoading] = useState(false);

  useEffect(() => {
    let isActive = true;

    Promise.resolve().then(() => {
      if (!isActive) return;

      const savedInstruction = readSavedSystemInstruction();
      if (savedInstruction) {
        setSystemInstruction(savedInstruction);
      }
      setHistory(readHistory());
    });

    loadOfficeScript()
      .then((office) => {
        if (!isActive || !office) return;

        office.onReady((info) => {
          if (!isActive) return;

          if (info.host === office.HostType.Excel) {
            setIsOfficeInitialized(true);

            try {
              const savedPrompt = office.context.document.settings.get("defaultSystemInstruction");
              if (savedPrompt) setSystemInstruction(savedPrompt);
            } catch (e) {
              console.error("Error reading settings from Office:", e);
            }
          }
        });
      })
      .catch((e) => {
        console.warn("Office.js is not available:", e);
      });

    const handleStorageChange = () => {
      setHistory(readHistory());
    };

    window.addEventListener('storage', handleStorageChange);
    return () => {
      isActive = false;
      window.removeEventListener('storage', handleStorageChange);
    };
  }, []);

  const handleSaveConfig = () => {
    setSaveStatus('Saving...');

    try {
      localStorage.setItem("defaultSystemInstruction", systemInstruction);
    } catch (e) {
      console.warn("Failed to save to localStorage:", e);
    }

    const office = getOffice();
    if (office?.context?.document) {
      try {
        office.context.document.settings.set("defaultSystemInstruction", systemInstruction);
        office.context.document.settings.saveAsync((result) => {
          if (result.status === office.AsyncResultStatus.Failed) {
            console.error("Office settings save failed:", result.error.message);
            setSaveStatus('Save failed');
          } else {
            setSaveStatus('Configuration saved');
            setTimeout(() => setSaveStatus(''), 3000);
          }
        });
      } catch (e) {
        console.error("Office settings save exception:", e);
        setSaveStatus('Office save error');
      }
    } else {
      setSaveStatus('Saved locally');
      setTimeout(() => setSaveStatus(''), 3000);
    }
  };

  const handleClearHistory = () => {
    try {
      localStorage.removeItem("geminiHistory");
      setHistory([]);
    } catch (e) {
      console.warn("Failed to clear history:", e);
    }
  };

  const handleRunPlayground = async () => {
    if (!playgroundInput || playgroundInput.trim() === "") return;
    setPlaygroundLoading(true);
    setPlaygroundResult('Thinking...');

    try {
      const response = await fetch('/api/gemini', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          text: playgroundInput,
          systemInstruction,
        }),
      });

      const data = await response.json();
      if (!response.ok) {
        throw new Error(data.error || 'Server error: ' + response.status);
      }

      setPlaygroundResult(data.result);
      setHistory(saveHistoryItem(makeHistoryItem(playgroundInput, 'success')));
    } catch (err) {
      setPlaygroundResult("Error: " + err.message);
      setHistory(saveHistoryItem(makeHistoryItem(playgroundInput, 'error', err.message)));
    } finally {
      setPlaygroundLoading(false);
    }
  };

  return (
    <div className="taskpane-container">
      <div className="header">
        <Image src="/icon-32.png" width={36} height={36} alt="Gemini Logo" className="logo" />
        <div className="title-container">
          <h1>Gemini Excel AI</h1>
          <p>Next-Gen Sheet Intelligence</p>
        </div>
        <button
          onClick={() => {
            const office = getOffice();
            if (office?.context?.ui) {
              try {
                office.context.ui.closeContainer();
                return;
              } catch (e) {
                console.warn("Office closeContainer failed:", e);
              }
            }

            if (window.history.length > 1) {
              window.history.back();
            } else {
              window.close();
            }
          }}
          title="Close / Go back"
          style={{
            marginLeft: 'auto',
            background: 'rgba(255,255,255,0.07)',
            border: '1px solid rgba(255,255,255,0.12)',
            borderRadius: '6px',
            color: '#94a3b8',
            cursor: 'pointer',
            fontSize: '1.1rem',
            padding: '4px 10px',
            lineHeight: '1',
            transition: 'background 0.2s, color 0.2s',
          }}
          onMouseEnter={(e) => {
            e.currentTarget.style.background = 'rgba(255,255,255,0.14)';
            e.currentTarget.style.color = '#f1f5f9';
          }}
          onMouseLeave={(e) => {
            e.currentTarget.style.background = 'rgba(255,255,255,0.07)';
            e.currentTarget.style.color = '#94a3b8';
          }}
        >
          x
        </button>
      </div>

      <div className="card">
        <div className="card-title">Environment Connection</div>
        <div style={{ display: 'flex', gap: '8px', flexWrap: 'wrap' }}>
          <span className={`status-badge ${isOfficeInitialized ? 'status-connected' : 'status-disconnected'}`}>
            Excel: {isOfficeInitialized ? 'Connected' : 'Offline/Standalone'}
          </span>
          <span className="status-badge status-connected">Server API: Online</span>
        </div>
      </div>

      <div className="card">
        <div className="card-title">Prompt Config</div>

        <div style={{ marginBottom: '14px', display: 'flex', alignItems: 'center', gap: '8px' }}>
          <span style={{ fontSize: '0.78rem', color: '#64748b' }}>Active Model:</span>
          <span style={{
            background: 'rgba(16,185,129,0.12)',
            border: '1px solid rgba(16,185,129,0.3)',
            color: '#34d399',
            borderRadius: '20px',
            padding: '3px 10px',
            fontSize: '0.78rem',
            fontWeight: '600',
            fontFamily: 'monospace',
            letterSpacing: '0.03em',
          }}>
            {MODEL_LABEL}
          </span>
        </div>

        <div className="form-group">
          <label htmlFor="system-instruction">Default System Instructions</label>
          <textarea
            id="system-instruction"
            className="textarea-input"
            value={systemInstruction}
            onChange={(e) => setSystemInstruction(e.target.value)}
            placeholder="e.g. Act as a translation engine to Spanish. Be concise, clean, and output only the direct translation."
          />
        </div>

        <button className="btn" onClick={handleSaveConfig}>
          Save Config Settings
        </button>
        {saveStatus && (
          <div style={{
            marginTop: '8px',
            fontSize: '0.8rem',
            textAlign: 'center',
            color: saveStatus.toLowerCase().includes('error') || saveStatus.toLowerCase().includes('failed') ? '#f87171' : '#34d399',
            fontWeight: '600',
          }}>
            {saveStatus}
          </div>
        )}
      </div>

      <div className="card">
        <div className="card-title">LLM Formula Playground</div>
        <div className="form-group">
          <label htmlFor="playground-prompt">Quick API Test</label>
          <input
            id="playground-prompt"
            type="text"
            className="text-input"
            value={playgroundInput}
            onChange={(e) => setPlaygroundInput(e.target.value)}
            onKeyDown={(e) => e.key === 'Enter' && handleRunPlayground()}
            placeholder="Type prompt and press Enter..."
            disabled={playgroundLoading}
          />
        </div>

        <button
          className="btn btn-secondary"
          onClick={handleRunPlayground}
          disabled={playgroundLoading}
        >
          {playgroundLoading ? 'Processing...' : 'Run Generation'}
        </button>

        {playgroundResult && (
          <div className="playground-result">
            {playgroundResult}
          </div>
        )}
      </div>

      <div className="card">
        <div className="card-title" style={{ justifyContent: 'space-between' }}>
          <span>Formula Calculation Log</span>
          {history.length > 0 && (
            <button
              onClick={handleClearHistory}
              style={{
                background: 'none',
                border: 'none',
                color: '#f87171',
                cursor: 'pointer',
                fontSize: '0.75rem',
                padding: 0,
              }}
            >
              Clear
            </button>
          )}
        </div>

        {history.length === 0 ? (
          <div style={{ fontSize: '0.75rem', color: '#64748b', textAlign: 'center', padding: '10px 0' }}>
            No recent calculations. Enter `=GEMINI.ASK(A1)` in a cell.
          </div>
        ) : (
          <ul className="history-list">
            {history.map((item, idx) => (
              <li key={`${item.timestamp}-${idx}`} className="history-item">
                <div className="history-info">
                  <span className="history-prompt">&quot;{item.input}&quot;</span>
                  <span className="history-meta">
                    {item.timestamp} <span className="badge-model">{item.model}</span>
                  </span>
                </div>
                <span className={`history-status ${item.status === 'success' ? 'status-ok' : 'status-fail'}`}>
                  {item.status === 'success' ? 'SUCCESS' : 'ERROR'}
                </span>
              </li>
            ))}
          </ul>
        )}
      </div>

      <div className="footer">
        Gemini Add-in v1.0.0 - Developed via Antigravity
      </div>
    </div>
  );
}
