import React, { useState, useEffect, useRef } from 'react';
import './Scanning.css';

export default function Scanning({ repoName, projectData, error, scope = 'all', onScanningFinished, onBack }) {
  const [visibleLogs, setVisibleLogs] = useState([]);
  const [timeElapsed, setTimeElapsed] = useState(0);
  const logsEndRef = useRef(null);

  // Timer Effect
  useEffect(() => {
    if (error) return;
    const timer = setInterval(() => {
      setTimeElapsed(prev => prev + 1);
    }, 1000);
    return () => clearInterval(timer);
  }, [error]);

  const filteredDebate = React.useMemo(() => {
    if (!projectData || !projectData.debate) return [];
    if (scope === 'all') return projectData.debate;
    return projectData.debate.filter(log => {
      if (log.sender === 'System') return true;
      const sender = log.sender ? log.sender.toLowerCase() : '';
      if (scope === 'arch') return sender.includes('architecture') || sender.includes('arch');
      if (scope === 'ux') return sender.includes('ux') || sender.includes('product');
      if (scope === 'perf') return sender.includes('performance') || sender.includes('perf');
      if (scope === 'sec') return sender.includes('security') || sender.includes('sec');
      return false;
    });
  }, [projectData, scope]);

  // Print Sequence Effect
  useEffect(() => {
    if (error || filteredDebate.length === 0) return;

    let index = 0;
    const printNext = () => {
      if (index >= filteredDebate.length) {
        setTimeout(() => {
          onScanningFinished();
        }, 1200);
        return;
      }

      const nextLog = filteredDebate[index];
      setVisibleLogs(prev => [...prev, nextLog]);
      index++;

      if (logsEndRef.current) {
        logsEndRef.current.scrollIntoView({ behavior: 'smooth' });
      }

      const delay = nextLog.sender === 'System' ? 400 : 1000;
      setTimeout(printNext, delay);
    };

    const initialTimeout = setTimeout(printNext, 400);
    return () => clearTimeout(initialTimeout);
  }, [filteredDebate, error, onScanningFinished]);

  const formatTime = (secs) => {
    const m = Math.floor(secs / 60).toString().padStart(2, '0');
    const s = (secs % 60).toString().padStart(2, '0');
    return `${m}:${s}`;
  };

  return (
    <section className="scanning-view">
      
      {/* Terminal Title Header */}
      <div className="scanning-header terminal-window scanning-header-term">
        <div className="radar-container" style={error ? { borderColor: 'var(--term-rose)' } : {}}>
          <div className={error ? "" : "radar-line"} style={error ? { background: 'var(--term-rose)' } : {}}></div>
          <span className="radar-icon">{error ? "❌" : "⚙️"}</span>
        </div>
        <div className="scanning-details">
          <h2 style={error ? { color: 'var(--term-rose)' } : {}}>{error ? "Analysis Pipeline Aborted" : "Analyzing Repository Topology..."}</h2>
          <p>{error ? "The DevConsilium engine encountered a system connection exception." : <>Orchestrating agent threads for <span className="scanning-repo-name">{repoName}</span></>}</p>
        </div>
      </div>

      {/* Main Console Box as a Shell terminal */}
      <div className="console-box scanning-console-box" style={error ? { borderColor: 'rgba(244, 63, 94, 0.4)' } : {}}>
        <div className="console-bar">
          <div className="console-dots">
            <span className="console-dot dot-red"></span>
            <span className="console-dot dot-yellow"></span>
            <span className="console-dot dot-green"></span>
          </div>
          <div className="console-title">devconsilium-agent-broker --stream</div>
          <div className="line-time">{formatTime(timeElapsed)}</div>
        </div>
        <div className="console-logs">
          
          {/* Prompt Setup */}
          <div className="bash-prompt">
            <span className="bash-user">visitor@DESKTOP-DEVCONSILIUM </span>
            <span className="bash-branch">MINGW64 </span>
            <span className="bash-dir">~/devconsilium-audit/repositories</span>
            <br />
            <span className="bash-char">$ </span>
            <span className="bash-cmd-text">devconsilium --audit https://github.com/{repoName} --focus={scope}</span>
          </div>

          {/* Dynamic typing logs */}
          {visibleLogs.map((log, i) => {
            if (log.sender === 'System') {
              return (
                <div key={i} className="console-line system">
                  <span className="line-time">[{new Date().toLocaleTimeString()}]</span>
                  <span className="line-msg line-msg-system">{log.message}</span>
                </div>
              );
            }

            let agentClass = "agent-label-arch";
            let borderCol = "var(--term-magenta)";
            
            if (scope === 'ux') {
              agentClass = "agent-label-ux";
              borderCol = "var(--term-cyan)";
            } else if (scope === 'perf') {
              agentClass = "agent-label-perf";
              borderCol = "var(--term-green)";
            } else if (scope === 'sec') {
              agentClass = "agent-label-sec";
              borderCol = "var(--term-rose)";
            } else if (scope === 'arch') {
              agentClass = "agent-label-arch";
              borderCol = "var(--term-magenta)";
            } else {
              const sender = log.sender ? log.sender.toLowerCase() : '';
              if (sender.includes("ux") || sender.includes("product")) {
                agentClass = "agent-label-ux";
                borderCol = "var(--term-cyan)";
              } else if (sender.includes("performance") || sender.includes("perf")) {
                agentClass = "agent-label-perf";
                borderCol = "var(--term-green)";
              } else if (sender.includes("security") || sender.includes("sec")) {
                agentClass = "agent-label-sec";
                borderCol = "var(--term-rose)";
              }
            }

            return (
              <div key={i} className="console-line agent" style={{ borderColor: borderCol }}>
                <span className={`agent-label ${agentClass}`}>
                  {log.sender}
                </span>
                <span className="line-msg">{log.message}</span>
              </div>
            );
          })}
          
          {/* Error Message rendering */}
          {error && (
            <div className="console-line error-line" style={{ color: 'var(--term-rose)', marginTop: '10px', display: 'flex', flexDirection: 'column', gap: '10px', width: '100%', fontFamily: 'var(--font-mono)' }}>
              <div>[ERROR] Connection failed: {error}</div>
              <div style={{ color: 'var(--term-text-secondary)', fontSize: '0.8rem', lineHeight: '1.4' }}>
                The fallback analyzer has been disabled. Please verify that your local backend audit server is running (e.g. by executing 'cd backend; npm run dev' in your workspace environment) and has a valid GROQ_API_KEY environment variable.
              </div>
              <button 
                onClick={onBack} 
                style={{ 
                  marginTop: '10px', 
                  alignSelf: 'start',
                  background: 'rgba(244, 63, 94, 0.1)', 
                  border: '1px solid rgba(244, 63, 94, 0.3)', 
                  color: 'var(--term-rose)', 
                  padding: '6px 12px', 
                  borderRadius: 'var(--radius-sm)', 
                  cursor: 'pointer',
                  fontFamily: 'var(--font-mono)',
                  fontSize: '0.8rem',
                  transition: 'background 0.2s'
                }}
                onMouseOver={(e) => e.target.style.background = 'rgba(244, 63, 94, 0.2)'}
                onMouseOut={(e) => e.target.style.background = 'rgba(244, 63, 94, 0.1)'}
              >
                ↩️ Return to Landing
              </button>
            </div>
          )}

          {/* Shell cursor blinker simulation */}
          {visibleLogs.length < (projectData?.debate?.length || 0) && !error && (
            <div className="console-line">
              <span className="line-msg line-msg-cursor">▋</span>
            </div>
          )}
          <div ref={logsEndRef} />
        </div>
      </div>
    </section>
  );
}
