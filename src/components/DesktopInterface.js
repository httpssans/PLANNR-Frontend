import React, { useState, useEffect } from 'react';
import Button from './ui/Button';
import Card from './ui/Card';
import '../styles/designSystem.css';
import './DesktopInterface.css';

// Premium Desktop Interface Component

const DesktopInterface = ({ 
  userInput, 
  setUserInput, 
  taskStream, 
  allTasks, 
  expandedTasks, 
  textareaRef, 
  inputContainerRef, 
  handleSubmit, 
  handleKeyPress, 
  confirmGoal, 
  confirmStep, 
  toggleTaskExpansion, 
  getTaskProgress, 
  getCurrentTask, 
  getLastTask, 
  getNextTask 
}) => {
  const [currentTime, setCurrentTime] = useState(new Date());
  const [greeting, setGreeting] = useState('');
  const [isTyping, setIsTyping] = useState(false);
  
  useEffect(() => {
    const timer = setInterval(() => setCurrentTime(new Date()), 1000);
    return () => clearInterval(timer);
  }, []);
  
  useEffect(() => {
    const hour = currentTime.getHours();
    if (hour < 12) setGreeting('Good morning');
    else if (hour < 17) setGreeting('Good afternoon');
    else setGreeting('Good evening');
  }, [currentTime]);
  
  const formatTime = (date) => {
    return date.toLocaleTimeString('en-US', { 
      hour: 'numeric', 
      minute: '2-digit',
      hour12: true 
    });
  };
  
  const formatDate = (date) => {
    return date.toLocaleDateString('en-US', { 
      weekday: 'long',
      month: 'long', 
      day: 'numeric' 
    });
  };
  
  const handlePremiumSubmit = (e) => {
    e.preventDefault();
    if (!userInput.trim()) return;
    
    setIsTyping(true);
    setTimeout(() => {
      handleSubmit(e);
      setIsTyping(false);
    }, 1000);
  };
  return (
    <div className="premium-desktop-container">
      {/* Premium Hero Header */}
      <header className="desktop-hero-header">
        <div className="hero-background">
          <div className="hero-gradient-overlay"></div>
        </div>
        <div className="hero-content-desktop">
          <div className="desktop-time-section">
            <div className="time-display-desktop">
              <span className="current-time-desktop">{formatTime(currentTime)}</span>
              <span className="current-date-desktop">{formatDate(currentTime)}</span>
            </div>
            <div className="greeting-section-desktop">
              <h1 className="greeting-text-desktop animate-slideInUp">{greeting}</h1>
              <p className="tagline-desktop animate-slideInUp">Let's make today productive</p>
            </div>
          </div>
          
          <div className="desktop-header-flow-cards">
            <DesktopTaskCard
              type="previous"
              label="COMPLETED"
              task={getLastTask()}
              icon={<CompletedIcon />}
              variant="success"
            />
            <DesktopTaskCard
              type="current"
              label="IN PROGRESS"
              task={getCurrentTask()}
              icon={<CurrentIcon />}
              variant="primary"
              featured={true}
            />
            <DesktopTaskCard
              type="next"
              label="UP NEXT"
              task={getNextTask()}
              icon={<NextIcon />}
              variant="outline"
            />
          </div>
        </div>
      </header>

      {/* Premium Main Content */}
      <main className="premium-main-content">
        {/* Desktop Layout: Left and Right Columns */}
        <div className="desktop-main-grid">
          {/* Left Column - AI Assistant */}
          <div className="desktop-left-column animate-slideInUp" style={{ animationDelay: '0.5s' }}>
            <Card variant="glass" className="ai-assistant-card">
              <Card.Header>
                <div className="ai-header">
                  <div className="ai-avatar-desktop">
                    <AIIcon />
                  </div>
                  <div>
                    <h3 className="ai-title">AI Assistant</h3>
                    <p className="ai-subtitle">{isTyping ? 'Processing...' : 'Ready to help you organize'}</p>
                  </div>
                </div>
              </Card.Header>
              
              <Card.Body>
                <div className="conversation-area">
                  {taskStream.length === 0 ? (
                    <div className="desktop-empty-conversation">
                      <div className="empty-conversation-content">
                        <div className="conversation-icon">💬</div>
                        <h4>Start a conversation</h4>
                        <p>Ask me to help you manage tasks, set goals, or organize your schedule.</p>
                      </div>
                    </div>
                  ) : (
                    <div className="desktop-message-stream">
                      {taskStream.map((message, index) => (
                        <DesktopMessage 
                          key={index}
                          message={message}
                          confirmGoal={confirmGoal}
                          index={index}
                        />
                      ))}
                      {isTyping && (
                        <div className="desktop-typing-indicator">
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
                    </div>
                  )}
                </div>
              </Card.Body>
              
              <Card.Footer>
                <form onSubmit={handlePremiumSubmit} className="desktop-input-form">
                  <div className="desktop-input-wrapper">
                    <textarea
                      ref={textareaRef}
                      value={userInput}
                      onChange={(e) => setUserInput(e.target.value)}
                      onKeyPress={handleKeyPress}
                      placeholder="Ask me anything about your tasks..."
                      className="desktop-input-field"
                      rows="1"
                      disabled={isTyping}
                    />
                    <Button
                      type="submit"
                      variant="primary"
                      size="md"
                      disabled={!userInput.trim() || isTyping}
                      loading={isTyping}
                      icon={<SendIcon />}
                      className="desktop-send-button"
                    >
                      Send
                    </Button>
                  </div>
                </form>
              </Card.Footer>
            </Card>
          </div>

          {/* Right Column - Task Management */}
          <div className="desktop-right-column animate-slideInUp" style={{ animationDelay: '0.6s' }}>
            <Card variant="elevated" className="task-management-card">
              <Card.Header>
                <div className="tasks-header">
                  <h3 className="tasks-title">Task Management</h3>
                  <p className="tasks-subtitle">Organize and track your progress</p>
                </div>
              </Card.Header>
              
              <Card.Body padding="none">
                <div className="desktop-task-list">
                  {allTasks.length === 0 ? (
                    <div className="desktop-empty-tasks">
                      <div className="empty-tasks-content">
                        <div className="tasks-icon">📋</div>
                        <h4>No tasks yet</h4>
                        <p>Start by asking the AI assistant to create your first task.</p>
                      </div>
                    </div>
                  ) : (
                    <div className="tasks-scroll-area">
                      {/* Active Tasks */}
                      {allTasks.filter(task => {
                        const { totalSteps, completedSteps } = getTaskProgress(task);
                        const isCurrentPreviousTask = (() => {
                          const completedTasks = allTasks.filter(t => {
                            const progress = getTaskProgress(t);
                            return progress.completedSteps === progress.totalSteps && progress.totalSteps > 0;
                          });
                          if (completedTasks.length === 0) return false;
                          const lastTask = completedTasks.reduce((latest, current) => 
                            current.id > latest.id ? current : latest
                          );
                          return task.id === lastTask.id;
                        })();
                        
                        return !(completedSteps === totalSteps && totalSteps > 0 && !isCurrentPreviousTask);
                      }).map((task, index) => (
                        <DesktopTaskItem
                          key={task.id}
                          task={task}
                          taskIndex={allTasks.findIndex(t => t.id === task.id) + 1}
                          isExpanded={expandedTasks.has(task.id)}
                          onToggleExpansion={() => toggleTaskExpansion(task.id)}
                          onConfirmStep={confirmStep}
                          getTaskProgress={getTaskProgress}
                          animationDelay={index * 0.1}
                        />
                      ))}
                      
                      {/* History Section */}
                      <DesktopHistorySection
                        allTasks={allTasks}
                        getTaskProgress={getTaskProgress}
                        expandedTasks={expandedTasks}
                        toggleTaskExpansion={toggleTaskExpansion}
                      />
                    </div>
                  )}
                </div>
              </Card.Body>
            </Card>
          </div>
        </div>
      </main>
    </div>
  );
};

// Desktop Task Card Component
const DesktopTaskCard = ({ type, label, task, icon, variant = 'default', featured = false }) => {
  const taskText = typeof task === 'string' ? task : 'No task available';
  const isTaskEmpty = taskText === 'None' || taskText.includes('No ') || taskText.includes('All caught up');
  
  return (
    <Card
      variant={variant}
      hover={true}
      padding="sm"
      className={`desktop-task-card desktop-task-card--${type} ${featured ? 'featured-card' : ''}`}
    >
      <div className="desktop-card-header">
        <div className="desktop-card-icon">{icon}</div>
        <span className="desktop-card-label">{label}</span>
      </div>
      
      <div className="desktop-card-content">
        {!isTaskEmpty ? (
          <div className="desktop-card-task">
            <h4 className="desktop-task-title">{taskText}</h4>
          </div>
        ) : (
          <div className="desktop-card-empty">
            <span className="empty-text">
              {type === 'previous' && 'No completed tasks yet'}
              {type === 'current' && 'No active tasks'}
              {type === 'next' && 'All caught up!'}
            </span>
          </div>
        )}
      </div>
    </Card>
  );
};

// Desktop Message Component
const DesktopMessage = ({ message, confirmGoal, index }) => {
  const isString = typeof message === 'string';
  const messageText = isString 
    ? message.replace(/^(AI:|USER:)\s*/, '') 
    : message.text;
  
  const isAIMessage = isString ? message.startsWith('AI:') : true;
  const isUserMessage = isString && !message.startsWith('AI:');

  return (
    <div 
      className={`desktop-message ${isUserMessage ? 'user-message-desktop' : 'ai-message-desktop'} animate-slideInUp`}
      style={{ animationDelay: `${index * 0.1}s` }}
    >
      {!isUserMessage && (
        <div className="message-avatar-desktop">
          <div className="ai-avatar-small">
            <AIIcon />
          </div>
        </div>
      )}
      
      <div className="message-content-desktop">
        <div className="message-bubble-desktop">
          <div className="message-text-desktop">{messageText}</div>
          
          {!isString && message.id && (
            <div className="desktop-message-actions">
              <div className="action-prompt-desktop">
                <span className="prompt-text-desktop">Should I add this to your task list?</span>
              </div>
              <div className="action-buttons-desktop">
                <Button
                  variant="success"
                  size="sm"
                  onClick={() => confirmGoal(message.id, true)}
                  icon={<CheckIcon />}
                  className="desktop-action-btn"
                >
                  Yes, add it
                </Button>
                <Button
                  variant="secondary"
                  size="sm"
                  onClick={() => confirmGoal(message.id, false)}
                  icon={<XIcon />}
                  className="desktop-action-btn"
                >
                  Skip
                </Button>
              </div>
            </div>
          )}
        </div>
      </div>
      
      {isUserMessage && (
        <div className="message-avatar-desktop">
          <div className="user-avatar-desktop">
            <UserIcon />
          </div>
        </div>
      )}
    </div>
  );
};

// Desktop Task Item Component
const DesktopTaskItem = ({ 
  task, 
  taskIndex, 
  isExpanded, 
  onToggleExpansion, 
  onConfirmStep, 
  getTaskProgress, 
  animationDelay 
}) => {
  const { totalSteps, completedSteps } = getTaskProgress(task);
  const progress = totalSteps > 0 ? (completedSteps / totalSteps) * 100 : 0;
  
  return (
    <div 
      className={`desktop-task-item`}
    >
      <Card
        variant="outline"
        hover={true}
        padding="md"
        className="task-item-card"
      >
        <div className="desktop-task-header" onClick={onToggleExpansion}>
          <div className="task-header-left">
            <h4 className="desktop-task-name">
              Task {taskIndex}: {task.title}
            </h4>
            <div className="desktop-progress-info">
              <div className="progress-bar-desktop">
                <div 
                  className="progress-fill-desktop"
                  style={{ width: `${progress}%` }}
                />
              </div>
              <span className="progress-text-desktop">
                {completedSteps}/{totalSteps} steps completed
              </span>
            </div>
          </div>
          <div className="task-header-right">
            <div className={`expand-icon-desktop ${isExpanded ? 'expanded' : ''}`}>
              <ChevronRightIcon />
            </div>
          </div>
        </div>
        
        {isExpanded && (
          <div className="desktop-task-steps">
            {task.steps.map((step, stepIndex) => (
              <div key={step.id} className="desktop-step-item">
                <div className="step-content-desktop">
                  <span 
                    className={`step-text-desktop ${step.confirmed ? 'completed' : ''}`}
                  >
                    Step {stepIndex + 1}: {step.text}
                  </span>
                </div>
                {!step.confirmed && (
                  <div className="step-actions-desktop">
                    <Button
                      variant="success"
                      size="xs"
                      onClick={(e) => { 
                        e.stopPropagation(); 
                        onConfirmStep(task.id, step.id, true); 
                      }}
                      icon={<CheckIcon />}
                      className="step-btn"
                    />
                    <Button
                      variant="secondary"
                      size="xs"
                      onClick={(e) => { 
                        e.stopPropagation(); 
                        onConfirmStep(task.id, step.id, false); 
                      }}
                      icon={<XIcon />}
                      className="step-btn"
                    />
                  </div>
                )}
              </div>
            ))}
          </div>
        )}
      </Card>
    </div>
  );
};

// Desktop History Section Component
const DesktopHistorySection = ({ allTasks, getTaskProgress, expandedTasks, toggleTaskExpansion }) => {
  const historyTasks = allTasks.filter(task => {
    const { totalSteps, completedSteps } = getTaskProgress(task);
    const isCurrentPreviousTask = (() => {
      const completedTasks = allTasks.filter(t => {
        const progress = getTaskProgress(t);
        return progress.completedSteps === progress.totalSteps && progress.totalSteps > 0;
      });
      if (completedTasks.length === 0) return false;
      const lastTask = completedTasks.reduce((latest, current) => 
        current.id > latest.id ? current : latest
      );
      return task.id === lastTask.id;
    })();
    
    return completedSteps === totalSteps && totalSteps > 0 && !isCurrentPreviousTask;
  });
  
  if (historyTasks.length === 0) return null;
  
  return (
    <div className="desktop-history-section">
      <Card
        variant="outline"
        hover={true}
        padding="md"
        className="history-section-card"
      >
        <div 
          className="desktop-history-header" 
          onClick={() => toggleTaskExpansion('history')}
        >
          <div className="history-header-left">
            <div className="history-icon">📚</div>
            <div>
              <h4 className="history-title">Task History</h4>
              <span className="history-count">{historyTasks.length} completed tasks</span>
            </div>
          </div>
          <div className="history-header-right">
            <div className={`expand-icon-desktop ${expandedTasks.has('history') ? 'expanded' : ''}`}>
              <ChevronRightIcon />
            </div>
          </div>
        </div>
        
        {expandedTasks.has('history') && (
          <div className="desktop-history-tasks">
            {historyTasks.map((task, index) => (
              <div key={task.id} className="desktop-history-item">
                <div 
                  className="history-task-header"
                  onClick={() => toggleTaskExpansion(task.id)}
                >
                  <span className="history-task-title">
                    Task {allTasks.findIndex(t => t.id === task.id) + 1}: {task.title}
                  </span>
                  <span className="history-task-status">✅ Completed</span>
                </div>
                {expandedTasks.has(task.id) && (
                  <div className="history-task-steps">
                    {task.steps.map((step, stepIndex) => (
                      <div key={step.id} className="history-step">
                        <span className="history-step-text">
                          Step {stepIndex + 1}: {step.text}
                        </span>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            ))}
          </div>
        )}
      </Card>
    </div>
  );
};

// Premium Icons (updated for desktop)
const CheckIcon = () => (
  <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <path d="M20 6L9 17l-5-5" />
  </svg>
);

const XIcon = () => (
  <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <path d="M18 6L6 18" />
    <path d="M6 6L18 18" />
  </svg>
);

const ChevronRightIcon = () => (
  <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <path d="M9 18l6-6-6-6" />
  </svg>
);

const CompletedIcon = () => (
  <svg width="32" height="32" viewBox="0 0 24 24" fill="none" className="task-icon-desktop">
    <circle cx="12" cy="12" r="10" fill="currentColor" fillOpacity="0.1"/>
    <path d="M9 12l2 2 4-4" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
  </svg>
);

const CurrentIcon = () => (
  <svg width="32" height="32" viewBox="0 0 24 24" fill="none" className="task-icon-desktop">
    <circle cx="12" cy="12" r="10" fill="currentColor" fillOpacity="0.1"/>
    <path d="M12 6v6l4 2" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
  </svg>
);

const NextIcon = () => (
  <svg width="32" height="32" viewBox="0 0 24 24" fill="none" className="task-icon-desktop">
    <circle cx="12" cy="12" r="10" fill="currentColor" fillOpacity="0.1"/>
    <path d="M9 18l6-6-6-6" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
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

const SendIcon = () => (
  <svg width="16" height="16" viewBox="0 0 24 24" fill="none">
    <path d="M22 2L11 13M22 2l-7 20-4-9-9-4 20-7z" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
  </svg>
);

export default DesktopInterface;