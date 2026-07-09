import React, { useState } from 'react';
import './Playbook.css';

export default function Playbook({ tickets, scope = 'all' }) {
  const [filter, setFilter] = useState(scope === 'all' ? 'all' : scope);
  const [collapsedDiffs, setCollapsedDiffs] = useState({});

  const toggleDiff = (id) => {
    setCollapsedDiffs(prev => ({
      ...prev,
      [id] : !prev[id]
    }));
  };

  const filteredTickets = tickets.filter(ticket => {
    if (scope && scope !== 'all') return true;
    const activeFilter = scope === 'all' ? filter : scope;
    if (activeFilter === 'all') return true;
    
    const agentName = ticket.agent ? ticket.agent.toLowerCase() : '';
    const icon = ticket.agentIcon ? ticket.agentIcon.toLowerCase() : '';

    if (activeFilter === 'arch' || activeFilter === 'architecture') {
      return agentName.includes('architecture') || agentName.includes('arch') || icon.includes('arch');
    }
    if (activeFilter === 'ux' || activeFilter === 'product & ux') {
      return agentName.includes('ux') || agentName.includes('product') || icon.includes('ux') || icon.includes('dx');
    }
    if (activeFilter === 'perf' || activeFilter === 'performance') {
      return agentName.includes('performance') || agentName.includes('perf') || icon.includes('perf');
    }
    if (activeFilter === 'sec' || activeFilter === 'security') {
      return agentName.includes('security') || agentName.includes('sec') || icon.includes('sec');
    }
    return false;
  });

  const formatDiff = (diffText) => {
    return diffText.split('\n').map((line, idx) => {
      if (line.startsWith('-') && !line.startsWith('---')) {
        return <span key={idx} className="diff-line del">{line}</span>;
      } else if (line.startsWith('+') && !line.startsWith('+++')) {
        return <span key={idx} className="diff-line add">{line}</span>;
      } else {
        return <span key={idx} className="diff-line context">{line}</span>;
      }
    });
  };

  return (
    <div className="playbook-container">
      <div className="playbook-header">
        <div className="section-title playbook-section-title">
          <span className="section-icon">📋</span>
          <span>Actionable Quality Playbook</span>
        </div>
        {scope === 'all' && (
          <div className="playbook-filters" style={{ flexWrap: 'wrap' }}>
            <button
              className={`filter-btn ${filter === 'all' ? 'active' : ''}`}
              onClick={() => setFilter('all')}
            >
              All Logs
            </button>
            <button
              className={`filter-btn ${filter === 'architecture' ? 'active' : ''}`}
              onClick={() => setFilter('architecture')}
            >
              🏛️ Architecture
            </button>
            <button
              className={`filter-btn ${filter === 'product & ux' ? 'active' : ''}`}
              onClick={() => setFilter('product & ux')}
            >
              🎨 Product &amp; UX
            </button>
            <button
              className={`filter-btn ${filter === 'performance' ? 'active' : ''}`}
              onClick={() => setFilter('performance')}
            >
              ⚡ Performance
            </button>
            <button
              className={`filter-btn ${filter === 'security' ? 'active' : ''}`}
              onClick={() => setFilter('security')}
            >
              🛡️ Security
            </button>
          </div>
        )}
      </div>

      <div className="playbook-list">
        {filteredTickets.length === 0 ? (
          <div className="terminal-window playbook-empty-view">
            [SUCCESS] No outstanding issues matching this agent scope.
          </div>
        ) : (
          filteredTickets.map(ticket => {
            const isCollapsed = collapsedDiffs[ticket.id];
            const titleLabel = `${ticket.agent.toLowerCase().replace(' & ', '-')}-check.log`;
            
            return (
              <div key={ticket.id} className="terminal-window ticket-card">
                <div className="terminal-titlebar">
                  <div className="terminal-dots">
                    <span className="terminal-dot dot-close"></span>
                  </div>
                  <span className="terminal-title">{titleLabel}</span>
                  <span className="terminal-action-lbl">ticket: #{ticket.id}</span>
                </div>
                
                <div className="terminal-body playbook-ticket-body">
                  <div className="ticket-header">
                    <div className="ticket-header-left">
                      <span className={`severity-pill ${ticket.severity}`}>{ticket.severity}</span>
                      <span className="agent-tag">
                        <span>{ticket.agentIcon}</span>
                        <span>{ticket.agent} Agent</span>
                      </span>
                    </div>
                    <div className="ticket-meta-right">
                      <span>Priority: <strong>{ticket.severity === 'critical' ? 'High' : 'Medium'}</strong></span>
                    </div>
                  </div>
                  
                  <div className="ticket-title">{ticket.title}</div>
                  <div className="ticket-desc">{ticket.desc}</div>

                  {ticket.analysis && (() => {
                    let borderCol = "var(--term-magenta)";
                    const icon = ticket.agentIcon ? ticket.agentIcon.toUpperCase() : '';
                    if (icon.includes("UX")) borderCol = "var(--term-cyan)";
                    else if (icon.includes("PERF")) borderCol = "var(--term-green)";
                    else if (icon.includes("SEC")) borderCol = "var(--term-rose)";

                    return (
                      <div className="ticket-analysis-box" style={{ 
                        marginTop: '12px',
                        padding: '10px 14px',
                        background: 'rgba(255, 255, 255, 0.015)',
                        borderLeft: `3px solid ${borderCol}`,
                        fontSize: '0.78rem',
                        fontFamily: 'var(--font-mono)',
                        lineHeight: '1.5',
                        color: 'var(--term-text-secondary)',
                        borderRadius: '0 4px 4px 0'
                      }}>
                        <div style={{ color: 'var(--term-text-muted)', fontSize: '0.68rem', fontWeight: 'bold', textTransform: 'uppercase', marginBottom: '4px', letterSpacing: '0.5px' }}>
                          🕵️ Sub-Agent Code Review Critique
                        </div>
                        "{ticket.analysis}"
                      </div>
                    );
                  })()}
                </div>
              </div>
            );
          })
        )}
      </div>
    </div>
  );
}
