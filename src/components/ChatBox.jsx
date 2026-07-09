import React, { useState, useRef, useEffect } from 'react';
import './ChatBox.css';

export default function ChatBox({ qaData, onClose }) {
  const [messages, setMessages] = useState([
    {
      sender: 'bot',
      text: 'Hello! I am the Broker Agent coordinating the Dev Consilium review team. What would you like to know about this repository\'s structure, user flow quality, or launch viability?'
    }
  ]);
  const [inputVal, setInputVal] = useState('');
  const [isTyping, setIsTyping] = useState(false);
  const chatEndRef = useRef(null);

  useEffect(() => {
    if (chatEndRef.current) {
      chatEndRef.current.scrollIntoView({ behavior: 'smooth' });
    }
  }, [messages, isTyping]);

  const triggerBotResponse = (queryText) => {
    setIsTyping(true);

    setTimeout(() => {
      setIsTyping(false);
      let reply = '';
      
      const normalizedQuery = queryText.toLowerCase();
      const matchedReply = qaData && qaData[queryText];

      if (matchedReply) {
        reply = matchedReply;
      } else {
        if (normalizedQuery.includes("impress")) {
          reply = "Looking closely at the code structures, this repository demonstrates key programming ideas nicely. However, to impress strict recruiters, we recommend adding structural integration testing and ensuring zero secrets are left in files.";
        } else if (normalizedQuery.includes("debt") || normalizedQuery.includes("refactor")) {
          reply = "The primary technical debt lies in the integration bindings. Separating backend services from component rendering states should be your first task.";
        } else if (normalizedQuery.includes("scale") || normalizedQuery.includes("bottle")) {
          reply = "The main bottleneck will occur during database connection peaks or component rerendering waterfalls. Introducing async pools and state pagination will resolve this.";
        } else if (normalizedQuery.includes("state") || normalizedQuery.includes("missing")) {
          reply = "The visual components are missing robust fallback views. Implementing suspense loaders and explicit empty states is highly recommended to improve overall UX score.";
        } else {
          reply = "Our agents reviewed the files matching this query context. We suggest abstracting system-wide fetches into module gateways to minimize refactoring overhead.";
        }
      }

      setMessages(prev => [...prev, { sender: 'bot', text: reply }]);
    }, 1000);
  };

  const handleSend = () => {
    const text = inputVal.trim();
    if (!text) return;

    setMessages(prev => [...prev, { sender: 'user', text }]);
    setInputVal('');
    triggerBotResponse(text);
  };

  const handleKeyPress = (e) => {
    if (e.key === 'Enter') handleSend();
  };

  const handlePillClick = (question) => {
    setMessages(prev => [...prev, { sender: 'user', text: question }]);
    triggerBotResponse(question);
  };

  return (
    <div className="terminal-window chat-container">
      <div className="terminal-titlebar">
        <div className="terminal-dots">
          <span className="terminal-dot dot-close" onClick={onClose} style={{ cursor: 'pointer' }}></span>
          <span className="terminal-dot dot-min"></span>
          <span className="terminal-dot dot-max"></span>
        </div>
        <span className="terminal-title">interactive-chat-session.sh</span>
        <span className="terminal-action-lbl">port: 8080</span>
      </div>

      <div className="terminal-body chat-terminal-body">
        
        {/* Predefined query pills */}
        <div className="chat-options-pills">
          <button className="chat-opt-pill" onClick={() => handlePillClick("How can we scale this system?")}>
            📈 How can we scale this system?
          </button>
          <button className="chat-opt-pill" onClick={() => handlePillClick("What are the opportunities for monetization or revenue?")}>
            💰 What are the opportunities for monetization or revenue?
          </button>
          <button className="chat-opt-pill" onClick={() => handlePillClick("What technical debt should I fix first?")}>
            🏛️ What technical debt should I fix first?
          </button>
          <button className="chat-opt-pill" onClick={() => handlePillClick("What features or states are missing?")}>
            🎨 What features or states are missing?
          </button>
        </div>

        <div className="chat-messages chat-messages-container">
          {messages.map((msg, i) => (
            <div key={i} className={`chat-bubble ${msg.sender}`}>
              <p>{msg.text}</p>
            </div>
          ))}
          {isTyping && (
            <div className="chat-bubble bot" id="chat-typing-indicator">
              <div className="typing-indicator">
                <span className="typing-dot"></span>
                <span className="typing-dot"></span>
                <span className="typing-dot"></span>
              </div>
            </div>
          )}
          <div ref={chatEndRef} />
        </div>

        <div className="chat-input-area">
          <span className="chat-caret">$</span>
          <input
            type="text"
            value={inputVal}
            onChange={(e) => setInputVal(e.target.value)}
            onKeyDown={handleKeyPress}
            placeholder="ask-broker --query='your custom question'..."
          />
          <button onClick={handleSend} className="chat-send-btn">
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="var(--term-bg-darker)" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round">
              <line x1="22" y1="2" x2="11" y2="13"></line>
              <polygon points="22 2 15 22 11 13 2 9 22 2"></polygon>
            </svg>
          </button>
        </div>
      </div>
    </div>
  );
}
