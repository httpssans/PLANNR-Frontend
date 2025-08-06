import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import Button from './ui/Button';
import Card from './ui/Card';
import GoogleAuth from './GoogleAuth';
import '../styles/designSystem.css';
import './MainScreen.css';

const MainScreen = ({ allTasks, getTaskProgress }) => {
  const navigate = useNavigate();
  const [currentTime, setCurrentTime] = useState(new Date());
  const [greeting, setGreeting] = useState('');
  
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

  const getCurrentTask = () => {
    if (allTasks.length === 0) return null;
    
    // Find tasks that have some steps completed but not all
    const inProgressTasks = allTasks.filter(task => {
      const { totalSteps, completedSteps } = getTaskProgress(task);
      return completedSteps > 0 && completedSteps < totalSteps;
    });
    
    if (inProgressTasks.length === 0) return null;
    
    // If multiple in-progress tasks, get the most recent one with most steps completed
    const currentTask = inProgressTasks.reduce((best, current) => {
      const bestProgress = getTaskProgress(best);
      const currentProgress = getTaskProgress(current);
      
      // Compare by number of completed steps, then by recency (higher ID = more recent)
      if (currentProgress.completedSteps > bestProgress.completedSteps) {
        return current;
      } else if (currentProgress.completedSteps === bestProgress.completedSteps) {
        return current.id > best.id ? current : best;
      }
      return best;
    });
    
    return currentTask;
  };

  const getPreviousTask = () => {
    if (allTasks.length === 0) return null;
    
    // Find tasks that have all steps completed
    const completedTasks = allTasks.filter(task => {
      const { totalSteps, completedSteps } = getTaskProgress(task);
      return completedSteps === totalSteps && totalSteps > 0;
    });
    
    if (completedTasks.length === 0) return null;
    
    // Get the most recent completed task (highest ID)
    const lastTask = completedTasks.reduce((latest, current) => 
      current.id > latest.id ? current : latest
    );
    
    return lastTask;
  };

  const getNextTask = () => {
    if (allTasks.length === 0) return null;
    
    // Find tasks with no steps completed
    const notStartedTasks = allTasks.filter(task => {
      const { completedSteps } = getTaskProgress(task);
      return completedSteps === 0;
    });
    
    if (notStartedTasks.length > 0) {
      // Get the most recent task with no steps completed
      const nextTask = notStartedTasks.reduce((latest, current) => 
        current.id > latest.id ? current : latest
      );
      return nextTask;
    }
    
    // If no tasks with 0 steps, get the task with least steps completed
    const taskWithLeastProgress = allTasks.reduce((least, current) => {
      const leastProgress = getTaskProgress(least);
      const currentProgress = getTaskProgress(current);
      
      // Skip fully completed tasks
      if (currentProgress.completedSteps === currentProgress.totalSteps) return least;
      if (leastProgress.completedSteps === leastProgress.totalSteps) return current;
      
      // Compare by number of completed steps, then by recency
      if (currentProgress.completedSteps < leastProgress.completedSteps) {
        return current;
      } else if (currentProgress.completedSteps === leastProgress.completedSteps) {
        return current.id > least.id ? current : least;
      }
      return least;
    });
    
    return taskWithLeastProgress;
  };

  const previousTask = getPreviousTask();
  const currentTask = getCurrentTask();
  const nextTask = getNextTask();

  const handleChatSubmit = (message) => {
    navigate('/chat', { state: { initialMessage: message } });
  };
  
  const getTaskStatusColor = (task) => {
    if (!task) return 'neutral';
    const { totalSteps, completedSteps } = getTaskProgress(task);
    const progress = completedSteps / totalSteps;
    if (progress === 1) return 'success';
    if (progress > 0.5) return 'warning';
    if (progress > 0) return 'primary';
    return 'neutral';
  };
  
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

  return (
    <div className="main-screen">
      {/* Premium Header with Time & Greeting */}
      <header className="hero-header">
        <div className="header-top-bar">
          <div className="auth-section">
            <GoogleAuth />
          </div>
        </div>
        <div className="hero-content">
          <div className="time-display">
            <span className="current-time">{formatTime(currentTime)}</span>
            <span className="current-date">{formatDate(currentTime)}</span>
          </div>
          <div className="greeting-section">
            <h1 className="greeting-text animate-slideInUp">{greeting}</h1>
            <p className="tagline animate-slideInUp">Ready to conquer your day?</p>
          </div>
        </div>
        <div className="hero-gradient"></div>
      </header>

      {/* Premium Task Flow Cards */}
      <div className="task-flow-section">
        
        <div className="task-flow-container">
          {/* Previous Task Card */}
          <TaskFlowCard
            type="previous"
            label="COMPLETED"
            task={previousTask}
            progress={previousTask ? getTaskProgress(previousTask) : null}
            icon={<CompletedIcon />}
            variant="glass"
            className="animate-slideInUp"
            style={{ animationDelay: '0.1s' }}
          />

          {/* Current Task Card - Hero */}
          <TaskFlowCard
            type="current"
            label="IN PROGRESS"
            task={currentTask}
            progress={currentTask ? getTaskProgress(currentTask) : null}
            icon={<CurrentIcon />}
            variant="primary"
            className="animate-slideInUp task-card-hero"
            style={{ animationDelay: '0.2s' }}
            nextStep={currentTask?.steps.find(step => !step.confirmed)?.text}
          />

          {/* Next Task Card */}
          <TaskFlowCard
            type="next"
            label="UP NEXT"
            task={nextTask}
            progress={nextTask ? getTaskProgress(nextTask) : null}
            icon={<NextIcon />}
            variant="primary"
            className="animate-slideInUp"
            style={{ animationDelay: '0.3s' }}
          />
        </div>
        
        {/* View All Tasks Button - Moved after task cards */}
        <div className="view-all-tasks-section animate-slideInUp" style={{ animationDelay: '0.4s' }}>
          <Button
            variant="secondary"
            size="lg"
            onClick={() => navigate('/tasks')}
            icon={<TasksIcon />}
            className="view-all-tasks-button"
          >
            View All Tasks
          </Button>
        </div>
      </div>

      {/* Action Center */}
      <div className="action-center animate-slideInUp" style={{ animationDelay: '0.4s' }}>
        <div className="quick-actions">
          <Button
            variant="ghost"
            size="md"
            onClick={() => handleChatSubmit('Add a new task')}
            icon={<PlusIcon />}
            className="quick-action"
          >
            Add Task
          </Button>
          
          <Button
            variant="ghost"
            size="md"
            onClick={() => handleChatSubmit('Show me my progress')}
            icon={<ProgressIcon />}
            className="quick-action"
          >
            Progress
          </Button>
        </div>
      </div>

      {/* AI Assistant Prompt */}
      <Card variant="glass" className="ai-prompt-card animate-slideInUp" style={{ animationDelay: '0.5s' }}>
        <div className="ai-prompt-header">
          <div className="ai-avatar">
            <AIIcon />
          </div>
          <div>
            <h3 className="ai-prompt-title">AI Assistant</h3>
            <p className="ai-prompt-subtitle">I'm here to help you stay organized</p>
          </div>
        </div>
        <PremiumChatInput onSubmit={handleChatSubmit} />
      </Card>
    </div>
  );
};

// Simple chat input component
const ChatInput = ({ onSubmit }) => {
  const [message, setMessage] = React.useState('');

  const handleSubmit = (e) => {
    e.preventDefault();
    if (message.trim()) {
      onSubmit(message.trim());
      setMessage('');
    }
  };

  return (
    <form onSubmit={handleSubmit} className="chat-input-form">
      <input
        type="text"
        value={message}
        onChange={(e) => setMessage(e.target.value)}
        placeholder="Type your message..."
        className="chat-input-field"
      />
      <button type="submit" className="chat-send-button">
        <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" className="send-icon">
          <path d="M22 2L11 13" />
          <path d="M22 2L15 22L11 13L2 9L22 2Z" />
        </svg>
      </button>
    </form>
  );
};

// Premium Task Flow Card Component
const TaskFlowCard = ({ 
  type, 
  label, 
  task, 
  progress, 
  icon, 
  variant = 'default',
  className = '',
  style = {},
  nextStep 
}) => {
  return (
    <Card 
      variant={variant}
      hover={true}
      padding="lg"
      className={`task-flow-card task-flow-card--${type} ${className}`}
      style={style}
    >
      <div className="task-flow-header">
        <div className="task-flow-icon">{icon}</div>
        <span className="task-flow-label">{label}</span>
      </div>
      
      <div className="task-flow-content">
        {task ? (
          <>
            <h3 className="task-flow-title">{task.title}</h3>
            {progress && (
              <div className="task-flow-progress">
                <div className="progress-bar">
                  <div 
                    className="progress-fill"
                    style={{ width: `${(progress.completedSteps / progress.totalSteps) * 100}%` }}
                  />
                </div>
                <span className="progress-text">
                  {progress.completedSteps}/{progress.totalSteps} steps
                </span>
              </div>
            )}
            {nextStep && (
              <div className="next-step">
                <span className="next-step-label">Next:</span>
                <span className="next-step-text">{nextStep}</span>
              </div>
            )}
          </>
        ) : (
          <div className="task-flow-empty">
            <span className="empty-icon">✨</span>
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

// Premium Chat Input Component
const PremiumChatInput = ({ onSubmit }) => {
  const [message, setMessage] = React.useState('');
  const [isExpanded, setIsExpanded] = React.useState(false);

  const handleSubmit = (e) => {
    e.preventDefault();
    if (message.trim()) {
      onSubmit(message.trim());
      setMessage('');
      setIsExpanded(false);
    }
  };

  const suggestions = [
    "Add a new project task",
    "Show me today's priorities", 
    "Help me plan my week",
    "What should I focus on?"
  ];

  return (
    <div className="premium-chat-input">
      <form onSubmit={handleSubmit} className="chat-form">
        <div className={`chat-input-wrapper ${isExpanded ? 'expanded' : ''}`}>
          <input
            type="text"
            value={message}
            onChange={(e) => setMessage(e.target.value)}
            onFocus={() => setIsExpanded(true)}
            onBlur={() => setTimeout(() => setIsExpanded(false), 200)}
            placeholder="Ask me anything about your tasks..."
            className="chat-input"
          />
          <Button
            type="submit"
            variant="primary"
            size="sm"
            disabled={!message.trim()}
            className="chat-submit"
          >
            <SendIcon />
          </Button>
        </div>
      </form>
      
      {isExpanded && (
        <div className="chat-suggestions animate-fadeIn">
          {suggestions.map((suggestion, index) => (
            <button
              key={index}
              type="button"
              className="suggestion-pill"
              onClick={() => {
                setMessage(suggestion);
                setIsExpanded(false);
              }}
            >
              {suggestion}
            </button>
          ))}
        </div>
      )}
    </div>
  );
};

// Premium Icons
const CompletedIcon = () => (
  <svg width="24" height="24" viewBox="0 0 24 24" fill="none" className="task-icon">
    <circle cx="12" cy="12" r="10" fill="currentColor" fillOpacity="0.1"/>
    <path d="M9 12l2 2 4-4" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
  </svg>
);

const CurrentIcon = () => (
  <svg width="24" height="24" viewBox="0 0 24 24" fill="none" className="task-icon">
    <circle cx="12" cy="12" r="10" fill="currentColor" fillOpacity="0.1"/>
    <path d="M12 6v6l4 2" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
  </svg>
);

const NextIcon = () => (
  <svg width="24" height="24" viewBox="0 0 24 24" fill="none" className="task-icon">
    <circle cx="12" cy="12" r="10" fill="currentColor" fillOpacity="0.1"/>
    <path d="M9 18l6-6-6-6" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
  </svg>
);

const TasksIcon = () => (
  <svg width="20" height="20" viewBox="0 0 24 24" fill="none">
    <path d="M8 6h13M8 12h13M8 18h13M3 6h.01M3 12h.01M3 18h.01" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
  </svg>
);

const PlusIcon = () => (
  <svg width="16" height="16" viewBox="0 0 24 24" fill="none">
    <path d="M12 5v14M5 12h14" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
  </svg>
);

const ProgressIcon = () => (
  <svg width="16" height="16" viewBox="0 0 24 24" fill="none">
    <path d="M22 12h-4l-3 9L9 3l-3 9H2" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
  </svg>
);

const AIIcon = () => (
  <svg width="32" height="32" viewBox="0 0 24 24" fill="none" className="ai-icon">
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

const SendIcon = () => (
  <svg width="16" height="16" viewBox="0 0 24 24" fill="none">
    <path d="M22 2L11 13M22 2l-7 20-4-9-9-4 20-7z" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
  </svg>
);

export default MainScreen;