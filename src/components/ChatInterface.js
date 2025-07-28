import React, { useState, useRef, useEffect } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import Button from './ui/Button';
import Card from './ui/Card';
import '../styles/designSystem.css';
import './ChatInterface.css';

const ChatInterface = ({ userInput, setUserInput, taskStream, setTaskStream, handleSubmit, confirmGoal }) => {
  const navigate = useNavigate();
  const location = useLocation();
  const textareaRef = useRef(null);
  const messagesEndRef = useRef(null);
  const [isTyping, setIsTyping] = useState(false);
  const [messageInput, setMessageInput] = useState('');
  
  // Initialize with message from navigation state if present
  useEffect(() => {
    if (location.state?.initialMessage) {
      setMessageInput(location.state.initialMessage);
      setUserInput(location.state.initialMessage);
    }
  }, [location.state, setUserInput]);

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
      handleChatSubmit(e);
    }
  };
  
  const handleChatSubmit = (e) => {
    e.preventDefault();
    if (!messageInput.trim()) return;
    
    setUserInput(messageInput);
    setIsTyping(true);
    
    // Simulate AI response delay
    setTimeout(() => {
      handleSubmit(e);
      setIsTyping(false);
      setMessageInput('');
    }, 1000);
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
      {/* Premium Header */}
      <header className="premium-chat-header">
        <div className="header-left">
          <Button
            variant="ghost"
            size="sm"
            onClick={() => navigate('/')}
            icon={<BackIcon />}
            className="nav-button"
          />
        </div>
        
        <div className="header-center">
          <div className="ai-status">
            <div className="ai-avatar-mini">
              <AIIcon />
            </div>
            <div className="ai-info">
              <h1 className="chat-title">AI Assistant</h1>
              <span className="ai-status-text">
                {isTyping ? 'Thinking...' : 'Ready to help'}
              </span>
            </div>
          </div>
        </div>
        
        <div className="header-right">
          <Button
            variant="ghost"
            size="sm"
            onClick={() => navigate('/tasks')}
            icon={<ListIcon />}
            className="nav-button"
          />
        </div>
      </header>

      {/* Premium Messages Container */}
      <div className="premium-messages-container">
        {taskStream.length === 0 ? (
          <div className="premium-empty-state">
            <div className="empty-state-animation">
              <div className="ai-orb">
                <div className="orb-inner"></div>
                <div className="orb-pulse"></div>
              </div>
            </div>
            
            <div className="empty-state-content">
              <h2 className="empty-state-title">Ready to boost your productivity?</h2>
              <p className="empty-state-subtitle">
                I'm your AI-powered task assistant. Let's turn your goals into actionable plans.
              </p>
            </div>
            
            <div className="conversation-starters">
              <h3 className="starters-title">Try asking me:</h3>
              <div className="starters-grid">
                {[
                  { icon: '🎯', text: 'Add a task to learn Spanish', category: 'Goal Setting' },
                  { icon: '💪', text: 'Help me plan my workout routine', category: 'Health' },
                  { icon: '📚', text: 'What should I focus on today?', category: 'Productivity' },
                  { icon: '⏰', text: 'Show me my progress this week', category: 'Analytics' }
                ].map((starter, index) => (
                  <Card 
                    key={index}
                    variant="outline"
                    hover={true}
                    padding="sm"
                    className="starter-card animate-slideInUp"
                    style={{ animationDelay: `${index * 0.1}s` }}
                    onClick={() => setMessageInput(starter.text)}
                  >
                    <div className="starter-icon">{starter.icon}</div>
                    <div className="starter-content">
                      <span className="starter-category">{starter.category}</span>
                      <span className="starter-text">{starter.text}</span>
                    </div>
                  </Card>
                ))}
              </div>
            </div>
          </div>
        ) : (
          <div className="premium-messages-list">
            {taskStream.map((message, index) => (
              <MessageBubble 
                key={index}
                message={message}
                isUser={typeof message === 'string' && !message.startsWith('AI:')}
                confirmGoal={confirmGoal}
                index={index}
              />
            ))}
            
            {isTyping && (
              <div className="typing-indicator animate-slideInUp">
                <div className="ai-avatar-small">
                  <AIIcon />
                </div>
                <div className="typing-animation">
                  <div className="typing-dot"></div>
                  <div className="typing-dot"></div>
                  <div className="typing-dot"></div>
                </div>
              </div>
            )}
            
            <div ref={messagesEndRef} />
          </div>
        )}
      </div>

      {/* Premium Input Area */}
      <div className="premium-input-area">
        <Card variant="glass" padding="sm" className="input-card">
          <form onSubmit={handleChatSubmit} className="premium-input-form">
            <div className="input-wrapper">
              <textarea
                ref={textareaRef}
                value={messageInput}
                onChange={(e) => setMessageInput(e.target.value)}
                onKeyPress={handleKeyPress}
                placeholder="Ask me anything about your tasks..."
                className="premium-textarea"
                rows="1"
                disabled={isTyping}
              />
              <div className="input-actions">
                <Button
                  type="submit"
                  variant="primary"
                  size="sm"
                  disabled={!messageInput.trim() || isTyping}
                  loading={isTyping}
                  icon={<SendIcon />}
                  className="send-button-premium"
                >
                  Send
                </Button>
              </div>
            </div>
          </form>
        </Card>
      </div>
    </div>
  );
};

// Premium Message Bubble Component
const MessageBubble = ({ message, isUser, confirmGoal, index }) => {
  const isString = typeof message === 'string';
  const messageText = isString 
    ? message.replace(/^(AI:|USER:)\s*/, '') 
    : message.text;
  
  const isAIMessage = isString ? message.startsWith('AI:') : true;

  return (
    <div 
      className={`message-bubble ${isUser ? 'user-bubble' : 'ai-bubble'} animate-slideInUp`}
      style={{ animationDelay: `${index * 0.1}s` }}
    >
      {!isUser && (
        <div className="message-avatar">
          <div className="ai-avatar-small">
            <AIIcon />
          </div>
        </div>
      )}
      
      <Card 
        variant={isUser ? 'primary' : 'glass'}
        padding="md"
        className="message-card"
      >
        <div className="message-text">{messageText}</div>
        
        {!isString && message.id && (
          <div className="message-actions">
            <div className="action-prompt">
              <span className="prompt-text">Should I add this task to your list?</span>
            </div>
            <div className="action-buttons">
              <Button
                variant="success"
                size="sm"
                onClick={() => confirmGoal(message.id, true)}
                icon={<CheckIcon />}
                className="action-btn"
              >
                Yes, add it
              </Button>
              <Button
                variant="secondary"
                size="sm"
                onClick={() => confirmGoal(message.id, false)}
                icon={<XIcon />}
                className="action-btn"
              >
                Skip
              </Button>
            </div>
          </div>
        )}
      </Card>
      
      {isUser && (
        <div className="message-avatar">
          <div className="user-avatar">
            <UserIcon />
          </div>
        </div>
      )}
    </div>
  );
};

// Updated Icons
const BackIcon = () => (
  <svg width="18" height="18" viewBox="0 0 24 24" fill="none">
    <path d="M19 12H5m7 7l-7-7 7-7" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
  </svg>
);

const ListIcon = () => (
  <svg width="18" height="18" viewBox="0 0 24 24" fill="none">
    <path d="M8 6h13M8 12h13M8 18h13M3 6h.01M3 12h.01M3 18h.01" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
  </svg>
);

const CheckIcon = () => (
  <svg width="16" height="16" viewBox="0 0 24 24" fill="none">
    <path d="M20 6L9 17l-5-5" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
  </svg>
);

const XIcon = () => (
  <svg width="16" height="16" viewBox="0 0 24 24" fill="none">
    <path d="M18 6L6 18M6 6L18 18" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
  </svg>
);

const SendIcon = () => (
  <svg width="16" height="16" viewBox="0 0 24 24" fill="none">
    <path d="M22 2L11 13M22 2l-7 20-4-9-9-4 20-7z" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
  </svg>
);

const AIIcon = () => (
  <svg width="24" height="24" viewBox="0 0 24 24" fill="none">
    <circle cx="12" cy="12" r="10" fill="url(#aiGradient)" fillOpacity="0.1"/>
    <path d="M9 9h6v6h-6z" fill="url(#aiGradient)" fillOpacity="0.2"/>
    <path d="M9 9h.01M15 9h.01M9 15h.01M15 15h.01" stroke="currentColor" strokeWidth="2" strokeLinecap="round"/>
    <defs>
      <linearGradient id="aiGradient" x1="0%" y1="0%" x2="100%" y2="100%">
        <stop offset="0%" stopColor="var(--color-primary-500)"/>
        <stop offset="100%" stopColor="var(--color-primary-600)"/>
      </linearGradient>
    </defs>
  </svg>
);

const UserIcon = () => (
  <svg width="20" height="20" viewBox="0 0 24 24" fill="none">
    <path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
    <circle cx="12" cy="7" r="4" stroke="currentColor" strokeWidth="2"/>
  </svg>
);

export default ChatInterface;