"use client";

import React, { useState } from 'react';

const codeStyle = {
  background: '#111827',
  border: '1px solid #243244',
  borderRadius: '6px',
  color: '#7dd3fc',
  fontFamily: 'ui-monospace, SFMono-Regular, Menlo, Monaco, Consolas, monospace',
  padding: '3px 7px',
};

const cardStyle = {
  background: 'rgba(17, 24, 39, 0.76)',
  border: '1px solid rgba(148, 163, 184, 0.18)',
  borderRadius: '8px',
  padding: '22px',
};

export default function Home() {
  const [copied, setCopied] = useState(false);

  const copyFormula = async () => {
    await navigator.clipboard.writeText('=GEMINI_ASK(A2)');
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <main style={{
      minHeight: '100vh',
      background: '#07111f',
      color: '#f8fafc',
      fontFamily: 'system-ui, -apple-system, BlinkMacSystemFont, "Segoe UI", sans-serif',
      padding: '42px 20px',
      boxSizing: 'border-box',
    }}>
      <div style={{ maxWidth: '920px', margin: '0 auto' }}>
        <header style={{ marginBottom: '34px' }}>
          <p style={{ color: '#5eead4', fontSize: '0.86rem', fontWeight: 700, margin: '0 0 10px' }}>
            Google Sheets + Gemini
          </p>
          <h1 style={{ fontSize: 'clamp(2rem, 5vw, 3.6rem)', lineHeight: 1.05, margin: 0 }}>
            One-cell Gemini automation for Google Sheets
          </h1>
          <p style={{ color: '#b6c2d2', fontSize: '1rem', lineHeight: 1.65, maxWidth: '680px' }}>
            Paste the Apps Script function into your sheet, save the backend prompt here, then use one formula argument: the input cell.
          </p>
        </header>

        <section style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(240px, 1fr))', gap: '18px', marginBottom: '22px' }}>
          <div style={cardStyle}>
            <div style={{ color: '#5eead4', fontWeight: 800, marginBottom: '12px' }}>1. Deploy backend</div>
            <p style={{ color: '#cbd5e1', lineHeight: 1.55, margin: 0 }}>
              Keep <span style={codeStyle}>GEMINI_API_KEY</span> configured on the Next.js server. Optionally set <span style={codeStyle}>GEMINI_SYSTEM_INSTRUCTION</span> as the default saved prompt.
            </p>
          </div>

          <div style={cardStyle}>
            <div style={{ color: '#5eead4', fontWeight: 800, marginBottom: '12px' }}>2. Add Apps Script</div>
            <p style={{ color: '#cbd5e1', lineHeight: 1.55, margin: 0 }}>
              Copy <span style={codeStyle}>sheets/Code.gs</span> into Extensions &gt; Apps Script for your Google Sheet.
            </p>
          </div>

          <div style={cardStyle}>
            <div style={{ color: '#5eead4', fontWeight: 800, marginBottom: '12px' }}>3. Use formula</div>
            <p style={{ color: '#cbd5e1', lineHeight: 1.55, margin: 0 }}>
              Enter <span style={codeStyle}>=GEMINI_ASK(A2)</span>. The backend adds the saved prompt and sends the request to Gemini.
            </p>
          </div>
        </section>

        <section style={{ ...cardStyle, display: 'flex', gap: '14px', alignItems: 'center', justifyContent: 'space-between', flexWrap: 'wrap' }}>
          <div>
            <div style={{ color: '#e2e8f0', fontWeight: 800, marginBottom: '6px' }}>Formula</div>
            <code style={{ ...codeStyle, display: 'inline-block', padding: '8px 10px' }}>=GEMINI_ASK(A2)</code>
          </div>
          <div style={{ display: 'flex', gap: '10px', flexWrap: 'wrap' }}>
            <button onClick={copyFormula} style={{ background: '#0d9488', color: 'white', border: 0, borderRadius: '6px', padding: '10px 14px', fontWeight: 700, cursor: 'pointer' }}>
              {copied ? 'Copied' : 'Copy formula'}
            </button>
            <a href="/settings" style={{ background: '#1f2937', color: 'white', borderRadius: '6px', padding: '10px 14px', fontWeight: 700, textDecoration: 'none' }}>
              Configure prompt
            </a>
          </div>
        </section>
      </div>
    </main>
  );
}