import React, { useState } from 'react';
import './Landing.css';

export default function Landing({ url, setUrl, onAnalyze }) {
  const [scope, setScope] = useState('all');

  const handleAnalyze = () => {
    if (!url.trim()) return;
    onAnalyze(url, scope);
  };

  const handleQuickSandbox = (repo) => {
    setUrl(repo);
    onAnalyze(repo, scope);
  };

  const scopeOptions = [
    { id: 'all', label: 'Consolidated', flag: '--focus=all', icon: '🌐' },
    { id: 'arch', label: 'Architecture', flag: '--focus=arch', icon: '🏛️' },
    { id: 'ux', label: 'UX / DX', flag: '--focus=ux', icon: '🎨' },
    { id: 'perf', label: 'Performance', flag: '--focus=perf', icon: '⚡' },
    { id: 'sec', label: 'Security', flag: '--focus=sec', icon: '🛡️' }
  ];

  return (
    <div className="landing-view">
      <h2 className="hero-title">
        Audit Your Codebase with <span className="gradient-text">AI Specialized Agents</span>
      </h2>
      <p className="hero-subtitle">
        Enter a public GitHub repository URL below. Our specialized panel of AI agents will run high-fidelity audits across architecture, UX/DX, performance, and security.
      </p>

      {/* Scope Selector */}
      <div className="scope-selector-container">
        <span className="scope-selector-label">Audit Focus:</span>
        <div className="scope-options">
          {scopeOptions.map((opt) => (
            <button
              key={opt.id}
              className={`scope-opt-btn ${scope === opt.id ? 'active' : ''}`}
              onClick={() => setScope(opt.id)}
            >
              <span className="opt-icon">{opt.icon}</span>
              <span className="opt-label">{opt.label}</span>
              <span className="opt-flag">{opt.flag}</span>
            </button>
          ))}
        </div>
      </div>

      {/* URL Input Box */}
      <div className="url-input-container">
        <span className="github-icon-input">
          <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
            <path d="M9 19c-5 1.5-5-2.5-7-3m14 6v-3.87a3.37 3.37 0 0 0-.94-2.61c3.14-.35 6.44-1.54 6.44-7A5.44 5.44 0 0 0 20 4.77 5.07 5.07 0 0 0 19.91 1S18.73.65 16 2.48a13.38 13.38 0 0 0-7 0C6.27.65 5.09 1 5.09 1A5.07 5.07 0 0 0 5 4.77a5.44 5.44 0 0 0-1.5 3.78c0 5.42 3.3 6.61 6.44 7A3.37 3.37 0 0 0 9 18.13V22" />
          </svg>
        </span>
        <input
          type="text"
          placeholder="https://github.com/facebook/react or owner/repo"
          value={url}
          onChange={(e) => setUrl(e.target.value)}
          onKeyDown={(e) => e.key === 'Enter' && handleAnalyze()}
        />
        <button onClick={handleAnalyze}>RUN AUDIT</button>
      </div>

      {/* Quick Sandbox Options */}
      <div className="sample-projects">
        <span>Quick Sandbox:</span>
        <button className="sample-btn" onClick={() => handleQuickSandbox('facebook/react')}>facebook/react</button>
        <button className="sample-btn" onClick={() => handleQuickSandbox('vitejs/vite')}>vitejs/vite</button>
        <button className="sample-btn" onClick={() => handleQuickSandbox('expressjs/express')}>expressjs/express</button>
      </div>

      {/* Agent description cards */}
      <div className="intro-grid">
        <div className={`terminal-window intro-card ${scope === 'arch' ? 'highlight-card' : ''}`} onClick={() => setScope('arch')}>
          <div className="terminal-titlebar">
            <div className="terminal-dots">
              <span className="terminal-dot dot-close"></span>
              <span className="terminal-dot dot-min"></span>
              <span className="terminal-dot dot-max"></span>
            </div>
            <span className="terminal-title">agent-arch.log</span>
          </div>
          <div className="terminal-body intro-card-body">
            <div className="intro-card-icon">🏛️</div>
            <h3>Architecture Agent</h3>
            <p>Checks structure layering, module coupling, circular dependencies, and design pattern conventions.</p>
          </div>
        </div>

        <div className={`terminal-window intro-card ${scope === 'ux' ? 'highlight-card' : ''}`} onClick={() => setScope('ux')}>
          <div className="terminal-titlebar">
            <div className="terminal-dots">
              <span className="terminal-dot dot-close"></span>
              <span className="terminal-dot dot-min"></span>
              <span className="terminal-dot dot-max"></span>
            </div>
            <span className="terminal-title">agent-ux.log</span>
          </div>
          <div className="terminal-body intro-card-body">
            <div className="intro-card-icon">🎨</div>
            <h3>Product &amp; UX Agent</h3>
            <p>Assesses layouts, media query responsiveness, skeleton loaders, and API developer experience.</p>
          </div>
        </div>

        <div className={`terminal-window intro-card ${scope === 'perf' ? 'highlight-card' : ''}`} onClick={() => setScope('perf')}>
          <div className="terminal-titlebar">
            <div className="terminal-dots">
              <span className="terminal-dot dot-close"></span>
              <span className="terminal-dot dot-min"></span>
              <span className="terminal-dot dot-max"></span>
            </div>
            <span className="terminal-title">agent-perf.log</span>
          </div>
          <div className="terminal-body intro-card-body">
            <div className="intro-card-icon">⚡</div>
            <h3>Performance Agent</h3>
            <p>Detects bundle size bloat, un-shaked monolithic imports, rendering cycles, and runtime bottlenecks.</p>
          </div>
        </div>

        <div className={`terminal-window intro-card ${scope === 'sec' ? 'highlight-card' : ''}`} onClick={() => setScope('sec')}>
          <div className="terminal-titlebar">
            <div className="terminal-dots">
              <span className="terminal-dot dot-close"></span>
              <span className="terminal-dot dot-min"></span>
              <span className="terminal-dot dot-max"></span>
            </div>
            <span className="terminal-title">agent-sec.log</span>
          </div>
          <div className="terminal-body intro-card-body">
            <div className="intro-card-icon">🛡️</div>
            <h3>Security Agent</h3>
            <p>Audits route authorization gates, CORS settings, exposed configurations, and package dependencies.</p>
          </div>
        </div>
      </div>
    </div>
  );
}
