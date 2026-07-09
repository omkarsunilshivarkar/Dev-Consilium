import React, { useEffect, useState } from 'react';
import Playbook from './Playbook';
import './Dashboard.css';

export default function Dashboard({ repoName, projectData, scope = 'all', onReanalyze, onOpenCertificate }) {
  const [animatedWidths, setAnimatedWidths] = useState({
    arch: 0,
    ux: 0,
    perf: 0,
    sec: 0
  });
  const rawScores = projectData?.scores || {};
  const scores = {
    overall: rawScores.overall ?? 0,
    arch: rawScores.arch ?? 0,
    ux: rawScores.ux ?? 0,
    perf: rawScores.perf ?? 0,
    sec: rawScores.sec ?? 0
  };

  useEffect(() => {
    const timer = setTimeout(() => {
      setAnimatedWidths({
        arch: scores.arch,
        ux: scores.ux,
        perf: scores.perf,
        sec: scores.sec
      });
    }, 100);
    return () => clearTimeout(timer);
  }, [projectData?.scores]);

  let targetScore = scores.overall;
  let targetLabel = "CONSILIUM INDEX";
  if (scope === 'arch') { targetScore = scores.arch; targetLabel = "ARCH INDEX"; }
  else if (scope === 'ux') { targetScore = scores.ux; targetLabel = "UX/UI INDEX"; }
  else if (scope === 'perf') { targetScore = scores.perf; targetLabel = "PERF INDEX"; }
  else if (scope === 'sec') { targetScore = scores.sec; targetLabel = "SECURITY INDEX"; }

  const gaugeOffset = 377 - (377 * targetScore / 100);

  const getAsciiBar = (val) => {
    const total = 18;
    const filled = Math.min(total, Math.round((val / 100) * total));
    return '█'.repeat(filled) + '░'.repeat(total - filled);
  };

  return (
    <section className="dashboard-view">
      
      {/* Left Sidebar: Terminal Metrics Dashboard */}
      <aside className="sidebar-panel">
        <div className="terminal-window project-summary-card">
          <div className="terminal-titlebar">
            <div className="terminal-dots">
              <span className="terminal-dot dot-close"></span>
              <span className="terminal-dot dot-min"></span>
            </div>
            <span className="terminal-title">audit-summary.txt</span>
          </div>
          
          <div className="terminal-body dashboard-summary-body">
            <div className="meta-repo-name">{repoName}</div>
            <div className="meta-branch">Branch: <strong>main</strong> &bull; Commit: <strong>a4b87d2</strong></div>
            
            {/* Radial SVG Score Gauge */}
            <div className="overall-gauge-container">
              <svg className="gauge-svg" viewBox="0 0 130 130">
                <defs>
                  <linearGradient id="gauge-gradient" x1="0%" y1="0%" x2="100%" y2="100%">
                    <stop offset="0%" stop-color="var(--term-magenta)" />
                    <stop offset="100%" stop-color="var(--term-cyan)" />
                  </linearGradient>
                </defs>
                <circle className="gauge-bg" cx="65" cy="65" r="60" />
                <circle 
                  className="gauge-fill" 
                  cx="65" 
                  cy="65" 
                  r="60" 
                  strokeDashoffset={gaugeOffset}
                  stroke="url(#gauge-gradient)"
                />
              </svg>
              <div className="gauge-content">
                <div className="gauge-val lens-gauge-val">{targetScore}</div>
                <div className="gauge-lbl">{targetLabel}</div>
              </div>
            </div>
            
            {/* Metric Breakdowns using ASCII UI Progress Bars */}
            <div className="scores-list">
              
              {(scope === 'all' || scope === 'arch') && (
                <div className="score-row">
                  <div className="score-row-header">
                    <span>Architecture</span>
                    <span className="metric-arch">{scores.arch}%</span>
                  </div>
                  <div className="metric-row metric-row-arch">
                    [{getAsciiBar(animatedWidths.arch)}]
                  </div>
                </div>
              )}

              {(scope === 'all' || scope === 'ux') && (
                <div className="score-row">
                  <div className="score-row-header">
                    <span>Product &amp; UX</span>
                    <span className="metric-ux">{scores.ux}%</span>
                  </div>
                  <div className="metric-row metric-row-ux">
                    [{getAsciiBar(animatedWidths.ux)}]
                  </div>
                </div>
              )}

              {(scope === 'all' || scope === 'perf') && (
                <div className="score-row">
                  <div className="score-row-header">
                    <span>Performance</span>
                    <span className="metric-perf">{scores.perf}%</span>
                  </div>
                  <div className="metric-row metric-row-perf">
                    [{getAsciiBar(animatedWidths.perf)}]
                  </div>
                </div>
              )}

              {(scope === 'all' || scope === 'sec') && (
                <div className="score-row">
                  <div className="score-row-header">
                    <span>Security</span>
                    <span className="metric-sec">{scores.sec}%</span>
                  </div>
                  <div className="metric-row metric-row-sec">
                    [{getAsciiBar(animatedWidths.sec)}]
                  </div>
                </div>
              )}

            </div>
          </div>
        </div>
        
        {/* Action Panel Buttons */}
        <div className="sidebar-actions">
          <button className="btn-primary" onClick={onReanalyze}>
            <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
              <path d="M21.5 2v6h-6M21.34 15.57a10 10 0 1 1-.57-8.38l5.67-5.67"/>
            </svg>
            <span>Audit Another Repo</span>
          </button>
        </div>
      </aside>
      
      {/* Right Main Dashboard Panel */}
      <section className="main-panel">
        

        
        {/* Playbook List */}
        <Playbook tickets={projectData?.playbook || []} scope={scope} />
        
      </section>
      
    </section>
  );
}
