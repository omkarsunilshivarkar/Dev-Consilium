import React from 'react';
import './CertificateModal.css';

export default function CertificateModal({ isActive, onClose, repoName, scores }) {
  if (!isActive) return null;

  return (
    <div className={`modal-overlay ${isActive ? 'active' : ''}`} onClick={onClose}>
      <div className="terminal-window modal-content cert-modal-window" onClick={(e) => e.stopPropagation()}>
        <div className="terminal-titlebar cert-modal-titlebar">
          <div className="terminal-dots">
            <span className="terminal-dot dot-close cert-close-dot" onClick={onClose}></span>
          </div>
          <span className="terminal-title">certification-panel.app</span>
        </div>
        
        <div className="terminal-body cert-modal-body">
          <div className="modal-icon-success">🏆</div>
          <h3>Dev Consilium Quality Certified</h3>
          <p>Congratulations! Your repository score falls in the top quartile of assessed projects. Share this achievement with partners and investors.</p>
          
          {/* Preview Card */}
          <div className="badge-card-container">
            <div className="badge-card-header">DEV CONSILIUM VERIFIED READY</div>
            <h4 className="cert-repo-heading">
              {repoName}
            </h4>
            
            <div className="badge-card-scores">
              <div className="badge-score-item">
                <span className="badge-score-val cert-score-item-value">{scores?.overall || '--'}</span>
                <span className="badge-score-lbl">Overall</span>
              </div>
              <div className="badge-score-item">
                <span className="badge-score-val">{scores?.arch || '--'}</span>
                <span className="badge-score-lbl">Arch</span>
              </div>
              <div className="badge-score-item">
                <span className="badge-score-val">{scores?.ux || '--'}</span>
                <span className="badge-score-lbl">UX/UI</span>
              </div>
            </div>
          </div>
          
          <button className="btn-primary cert-primary-btn" onClick={onClose}>
            Share to LinkedIn &amp; Close
          </button>
        </div>
      </div>
    </div>
  );
}
