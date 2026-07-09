import React, { useState } from 'react';
import Landing from './components/Landing';
import Scanning from './components/Scanning';
import Dashboard from './components/Dashboard';

import { auditGitHubRepository } from './utils/githubAuditor';

export default function App() {
  const [currentView, setCurrentView] = useState('landing'); // 'landing' | 'scanning' | 'dashboard'
  const [repoUrl, setRepoUrl] = useState('');
  const [activeRepoName, setActiveRepoName] = useState('');
  const [projectData, setProjectData] = useState(null);
  const [scanError, setScanError] = useState(null);
  const [activeScope, setActiveScope] = useState('all');

  const startAnalysis = async (targetUrl, scope = 'all') => {
    if (!targetUrl.trim()) return;

    // Extract repository display name
    let cleanName = targetUrl.trim().replace(/^https?:\/\/(www\.)?github\.com\//, "");
    if (cleanName.endsWith(".git")) cleanName = cleanName.slice(0, -4);
    
    setActiveRepoName(cleanName);
    setActiveScope(scope);
    setCurrentView('scanning');

    try {
      setScanError(null);
      console.log(`[DevConsilium] Querying backend analysis server for: ${targetUrl} [focus: ${scope}]`);
      const apiBaseUrl = import.meta.env.VITE_API_BASE_URL || 'http://localhost:3000';
      const response = await fetch(`${apiBaseUrl}/api/audit`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({ repoUrl: targetUrl, scope })
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.details || errorData.error || 'Backend failed');
      }

      const data = await response.json();
      console.log("[DevConsilium] Real LLM audit data received from backend:", data);
      setProjectData(data);

    } catch (err) {
      console.error("[DevConsilium] Audit analysis failed:", err);
      setScanError(err.message || "Failed to contact local analysis server.");
    }
  };

  const handleScanningFinished = () => {
    setCurrentView('dashboard');
  };

  const handleReanalyze = () => {
    setRepoUrl('');
    setProjectData(null);
    setScanError(null);
    setCurrentView('landing');
  };

  return (
    <div id="app-root">
      
      {/* Top Header Navigation */}
      <header>
        <div className="logo-container" onClick={handleReanalyze} style={{ cursor: 'pointer' }}>
          <svg className="logo-svg" viewBox="0 0 100 100" fill="none" xmlns="http://www.w3.org/2000/svg">
            <defs>
              <linearGradient id="logoGrad" x1="0%" y1="0%" x2="100%" y2="100%">
                <stop offset="0%" stopColor="#10B981" />
                <stop offset="100%" stopColor="#06B6D4" />
              </linearGradient>
              <filter id="glow" x="-20%" y="-20%" width="140%" height="140%">
                <feGaussianBlur stdDeviation="5" result="blur" />
                <feComposite in="SourceGraphic" in2="blur" operator="over" />
              </filter>
            </defs>
            <polygon points="50,8 88,30 88,70 50,92 12,70 12,30" 
                     stroke="url(#logoGrad)" 
                     strokeWidth="6" 
                     strokeLinejoin="round" 
                     fill="#0a0e17" />
            <line x1="50" y1="22" x2="30" y2="42" stroke="#10B981" strokeWidth="4" strokeLinecap="round" />
            <line x1="50" y1="22" x2="70" y2="42" stroke="#06B6D4" strokeWidth="4" strokeLinecap="round" />
            <line x1="30" y1="42" x2="30" y2="58" stroke="#10B981" strokeWidth="4" strokeLinecap="round" />
            <line x1="70" y1="42" x2="70" y2="58" stroke="#06B6D4" strokeWidth="4" strokeLinecap="round" />
            <line x1="30" y1="58" x2="50" y2="78" stroke="#10B981" strokeWidth="4" strokeLinecap="round" />
            <line x1="70" y1="58" x2="50" y2="78" stroke="#06B6D4" strokeWidth="4" strokeLinecap="round" />
            <line x1="30" y1="50" x2="70" y2="50" stroke="url(#logoGrad)" strokeWidth="4" strokeDasharray="3 5" strokeLinecap="round" />
            <circle cx="50" cy="50" r="8" fill="url(#logoGrad)" filter="url(#glow)" />
            <path d="M 34,45 L 28,50 L 34,55" stroke="#10B981" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round" />
            <path d="M 66,45 L 72,50 L 66,55" stroke="#06B6D4" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round" />
          </svg>
          <div className="logo-text">
            <h1>Dev Consilium</h1>
            <span>Product &amp; Architecture Auditor</span>
          </div>
        </div>
        <div className="header-meta">
          <div className="status-badge">
            <span className="status-dot"></span>
            <span>Engine Online</span>
          </div>
        </div>
      </header>

      {/* Main View Manager Router */}
      <main className="view-container">
        {currentView === 'landing' && (
          <Landing 
            url={repoUrl} 
            setUrl={setRepoUrl} 
            onAnalyze={startAnalysis} 
          />
        )}

        {currentView === 'scanning' && (
          <Scanning 
            repoName={activeRepoName} 
            projectData={projectData} 
            error={scanError}
            scope={activeScope}
            onScanningFinished={handleScanningFinished} 
            onBack={handleReanalyze}
          />
        )}

        {currentView === 'dashboard' && (
          <Dashboard 
            repoName={activeRepoName} 
            projectData={projectData} 
            scope={activeScope}
            onReanalyze={handleReanalyze} 
          />
        )}
      </main>

    </div>
  );
}
