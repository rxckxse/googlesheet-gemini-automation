"use client";

import React, { useState, useEffect } from 'react';

export default function Home() {
  const [copied, setCopied] = useState(false);

  const copyFormula = () => {
    navigator.clipboard.writeText('=GEMINI.ASK(A2)');
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <div style={{
      minHeight: '100vh',
      background: 'linear-gradient(135deg, #090d16 0%, #030712 100%)',
      color: '#f3f4f6',
      fontFamily: 'system-ui, -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif',
      display: 'flex',
      flexDirection: 'column',
      alignItems: 'center',
      padding: '40px 20px',
      boxSizing: 'border-box',
    }}>
      {/* Container */}
      <div style={{
        maxWidth: '850px',
        width: '100%',
      }}>
        {/* Header */}
        <header style={{
          textAlign: 'center',
          marginBottom: '50px',
        }}>
          <div style={{
            display: 'inline-flex',
            alignItems: 'center',
            justifyContent: 'center',
            background: 'linear-gradient(135deg, #10b981 0%, #06b6d4 100%)',
            width: '72px',
            height: '72px',
            borderRadius: '18px',
            boxShadow: '0 0 25px rgba(16, 185, 129, 0.4)',
            marginBottom: '20px',
          }}>
            <svg width="40" height="40" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
              <path d="M12 2L14.85 9.15L22 12L14.85 14.85L12 22L9.15 14.85L2 12L9.15 9.15L12 2Z" fill="white" />
            </svg>
          </div>
          <h1 style={{
            fontSize: '2.5rem',
            margin: '0 0 10px 0',
            fontWeight: '800',
            background: 'linear-gradient(90deg, #34d399 0%, #22d3ee 100%)',
            WebkitBackgroundClip: 'text',
            WebkitTextFillColor: 'transparent',
          }}>
            Gemini Excel AI Integration Hub
          </h1>
          <p style={{
            color: '#9ca3af',
            fontSize: '1.1rem',
            margin: '0 auto',
            maxWidth: '600px',
            lineHeight: '1.5',
          }}>
            Power up your spreadsheets with the Gemini 2.0 and 1.5 models directly inside Excel formulas.
          </p>
        </header>

        {/* Steps Grid */}
        <div style={{
          display: 'grid',
          gridTemplateColumns: 'repeat(auto-fit, minmax(250px, 1fr))',
          gap: '24px',
          marginBottom: '40px',
        }}>
          
          {/* Step 1 */}
          <div style={cardStyle}>
            <div style={stepBadgeStyle}>1</div>
            <h3 style={stepTitleStyle}>Trust SSL Certificate</h3>
            <p style={stepTextStyle}>
              Excel requires HTTPS. Click the button below to open the manifest, then accept the risk/warning in your browser to trust the local self-signed certificate:
            </p>
            <a 
              href="/manifest.xml" 
              target="_blank" 
              style={actionButtonStyle}
            >
              Authorize Certificate 🔐
            </a>
          </div>

          {/* Step 2 */}
          <div style={cardStyle}>
            <div style={stepBadgeStyle}>2</div>
            <h3 style={stepTitleStyle}>Sideload Add-in</h3>
            <p style={stepTextStyle}>
              Download the manifest file or use its URL, then import it:
            </p>
            <ul style={{
              color: '#d1d5db',
              fontSize: '0.85rem',
              paddingLeft: '20px',
              margin: '10px 0',
              textAlign: 'left',
              lineHeight: '1.4'
            }}>
              <li>In Excel on the Web: Go to Insert &gt; Add-ins &gt; Upload My Add-in.</li>
              <li>Select the <code style={codeBlockStyle}>manifest.xml</code> file.</li>
            </ul>
            <a 
              href="/manifest.xml" 
              download 
              style={{...actionButtonStyle, background: '#1e293b', border: '1px solid #475569'}}
            >
              Save Manifest XML 💾
            </a>
          </div>

          {/* Step 3 */}
          <div style={cardStyle}>
            <div style={stepBadgeStyle}>3</div>
            <h3 style={stepTitleStyle}>Write Formulas</h3>
            <p style={stepTextStyle}>
              Inside any worksheet, use our custom function to generate text:
            </p>
            <div style={{
              background: '#0f172a',
              padding: '10px',
              borderRadius: '6px',
              border: '1px solid #334155',
              fontSize: '0.9rem',
              display: 'flex',
              justifyContent: 'space-between',
              alignItems: 'center',
              fontFamily: 'monospace',
              margin: '12px 0'
            }}>
              <span style={{ color: '#38bdf8' }}>=GEMINI.ASK(A2)</span>
              <button 
                onClick={copyFormula} 
                style={{
                  background: 'none',
                  border: 'none',
                  color: '#10b981',
                  cursor: 'pointer',
                  fontSize: '0.8rem'
                }}
              >
                {copied ? 'Copied' : 'Copy'}
              </button>
            </div>
            <p style={stepTextStyle}>
              Excel displays <span style={{color: '#fbbf24'}}>#GETTING_DATA</span> while processing.
            </p>
          </div>

        </div>

        {/* Links Panel */}
        <div style={{
          background: 'rgba(30, 41, 59, 0.4)',
          border: '1px solid rgba(255, 255, 255, 0.08)',
          borderRadius: '12px',
          padding: '24px',
          textAlign: 'center',
        }}>
          <h2 style={{ fontSize: '1.25rem', color: '#38bdf8', marginTop: 0, marginBottom: '10px' }}>
            ⚙️ Configuration Console
          </h2>
          <p style={{ color: '#9ca3af', fontSize: '0.9rem', marginBottom: '20px' }}>
            You can customize default models, track query history, or test prompts in the settings dashboard:
          </p>
          <a 
            href="/taskpane" 
            style={{
              display: 'inline-flex',
              alignItems: 'center',
              gap: '8px',
              background: 'linear-gradient(90deg, #10b981 0%, #059669 100%)',
              color: 'white',
              textDecoration: 'none',
              padding: '12px 30px',
              borderRadius: '8px',
              fontWeight: '600',
              boxShadow: '0 4px 15px rgba(16, 185, 129, 0.2)',
            }}
          >
            Open Settings Dashboard
          </a>
        </div>

        {/* Developer Notes */}
        <footer style={{
          textAlign: 'center',
          color: '#4b5563',
          fontSize: '0.8rem',
          marginTop: '60px',
          borderTop: '1px solid #1f2937',
          paddingTop: '20px'
        }}>
          Powered by Google Gemini & Next.js App Router • Created by Antigravity AI
        </footer>

      </div>
    </div>
  );
}

const cardStyle = {
  background: 'rgba(17, 24, 39, 0.6)',
  backdropFilter: 'blur(10px)',
  border: '1px solid rgba(255, 255, 255, 0.05)',
  borderRadius: '12px',
  padding: '24px',
  display: 'flex',
  flexDirection: 'column',
  position: 'relative',
  boxShadow: '0 4px 30px rgba(0, 0, 0, 0.3)',
};

const stepBadgeStyle = {
  position: 'absolute',
  top: '-12px',
  left: '24px',
  background: '#10b981',
  color: 'white',
  fontWeight: '700',
  width: '28px',
  height: '28px',
  borderRadius: '50%',
  display: 'flex',
  alignItems: 'center',
  justifyContent: 'center',
  fontSize: '0.9rem',
  boxShadow: '0 0 10px rgba(16, 185, 129, 0.5)',
};

const stepTitleStyle = {
  fontSize: '1.1rem',
  fontWeight: '600',
  margin: '10px 0 12px 0',
  color: '#f3f4f6',
};

const stepTextStyle = {
  fontSize: '0.85rem',
  color: '#9ca3af',
  lineHeight: '1.6',
  margin: '0 0 16px 0',
  flexGrow: 1,
};

const actionButtonStyle = {
  display: 'block',
  background: '#10b981',
  color: 'white',
  textAlign: 'center',
  textDecoration: 'none',
  padding: '10px',
  borderRadius: '6px',
  fontWeight: '600',
  fontSize: '0.85rem',
  transition: 'opacity 0.2s',
  marginTop: 'auto'
};

const codeBlockStyle = {
  background: '#1e293b',
  padding: '2px 6px',
  borderRadius: '4px',
  fontFamily: 'monospace',
  color: '#34d399',
};
