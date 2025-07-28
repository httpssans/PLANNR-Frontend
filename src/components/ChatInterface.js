import React, { useState, useRef, useEffect } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import './ChatInterface.css';

const ChatInterface = ({ userInput, setUserInput, taskStream, setTaskStream, handleSubmit, confirmGoal }) => {
  const navigate = useNavigate();
  const location = useLocation();
  const textareaRef = useRef(null);
  const messagesEndRef = useRef(null);
  
  // Initialize with message from navigation state if present
  useEffect(() => {
    if (location.state?.initialMessage && !userInput) {
      setUserInput(location.state.initialMessage);
    }
  }, [location.state, userInput, setUserInput]);

  // Auto-scroll to bottom when new messages arrive
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [taskStream]);

  // Auto-resize textarea
  useEffect(() => {
    const textarea = textareaRef.current;
    if (textarea) {
      textarea.style.height = 'auto';
      textarea.style.height = `${Math.min(textarea.scrollHeight, 120)}px`;
    }
  }, [userInput]);

  const handleKeyPress = (e) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSubmit(e);
    }
  };

  const BackIcon = () => (
    <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" className="back-icon">
      <path d="M19 12H5" />
      <path d="M12 19l-7-7 7-7" />
    </svg>
  );

  const SendIcon = () => (
    <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" className="send-icon">
      <path d="M22 2L11 13" />
      <path d="M22 2L15 22L11 13L2 9L22 2Z" />
    </svg>
  );

  const CheckIcon = () => (
    <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" className="confirm-icon">
      <path d="M20 6L9 17l-5-5" />
    </svg>
  );

  const XIcon = () => (
    <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" className="confirm-icon">
      <path d="M18 6L6 18" />
      <path d="M6 6L18 18" />
    </svg>
  );

  const ListIcon = () => (
    <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" className="list-icon">
      <path d="M8 6h13" />
      <path d="M8 12h13" />
      <path d="M8 18h13" />
      <path d="M3 6h.01" />
      <path d="M3 12h.01" />
      <path d="M3 18h.01" />
    </svg>
  );

  return (
    <div className="chat-interface">
      {/* Header */}
      <header className="chat-header">
        <button className="back-button" onClick={() => navigate('/')}>
          <BackIcon />
        </button>
        <h1 className="chat-title">AI Assistant</h1>
        <button className="list-button" onClick={() => navigate('/tasks')}>
          <ListIcon />
        </button>
      </header>

      {/* Messages Container */}
      <div className="messages-container">
        {taskStream.length === 0 ? (
          <div className="chat-empty-state">
            <div className="empty-state-icon">🤖</div>
            <div className="empty-state-title">AI Task Assistant</div>
            <div className="empty-state-subtitle">
              Ask me to help manage your tasks, create new goals, or organize your schedule
            </div>
            <div className="example-prompts">
              <div className="example-prompt">💡 "Add a task to learn Spanish"</div>
              <div className="example-prompt">💡 "Help me organize my workout routine"</div>
              <div className="example-prompt">💡 "What should I work on next?"</div>
            </div>
          </div>
        ) : (
          <div className="messages-list">
            {taskStream.map((message, index) => (
              <div key={index} className="message-wrapper">
                {typeof message === 'string' ? (
                  <div className={`message ${message.startsWith('AI:') ? 'ai-message' : 'user-message'}`}>
                    <div className="message-content">
                      {message.replace(/^(AI:|USER:)\s*/, '')}
                    </div>
                  </div>
                ) : (
                  <div className="message ai-message">
                    <div className="message-content">
                      {message.text}
                    </div>
                    {message.id && (
                      <div className="confirmation-actions">
                        <button 
                          onClick={() => confirmGoal(message.id, true)} 
                          className="confirm-button confirm-yes"
                        >
                          <CheckIcon />
                          <span>Yes, add this task</span>
                        </button>
                        <button 
                          onClick={() => confirmGoal(message.id, false)} 
                          className="confirm-button confirm-no"
                        >
                          <XIcon />
                          <span>No, skip this</span>
                        </button>
                      </div>
                    )}
                  </div>
                )}
              </div>
            ))}
            <div ref={messagesEndRef} />
          </div>
        )}
      </div>

      {/* Input Area */}
      <div className="chat-input-area">
        <div className="input-container">
          <textarea
            ref={textareaRef}
            value={userInput}
            onChange={(e) => setUserInput(e.target.value)}
            onKeyPress={handleKeyPress}
            placeholder="Type your message here..."
            className="chat-textarea"
            rows="1"
          />
          <button 
            onClick={handleSubmit} 
            className="send-button"
            disabled={!userInput.trim()}
          >
            <SendIcon />
          </button>
        </div>
      </div>
    </div>
  );
};

export default ChatInterface;