import React from 'react';
import { useNavigate } from 'react-router-dom';
import './MainScreen.css';

const MainScreen = ({ allTasks, getTaskProgress }) => {
  const navigate = useNavigate();

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
    // Navigate to chat interface with the message
    navigate('/chat', { state: { initialMessage: message } });
  };

  return (
    <div className="main-screen">
      {/* Header */}
      <header className="mobile-header">
        <h1 className="mobile-title">PLANNR</h1>
      </header>

      {/* Task Cards - Horizontal Layout */}
      <div className="task-cards-container">
        {/* Previous Task Card */}
        <div className="task-card task-card-previous">
          <div className="task-card-label">PREVIOUS</div>
          <div className="task-card-content">
            {previousTask ? (
              <>
                <div className="task-card-title">{previousTask.title}</div>
                <div className="task-card-progress">
                  {getTaskProgress(previousTask).completedSteps}/{getTaskProgress(previousTask).totalSteps} completed
                </div>
              </>
            ) : (
              <div className="task-card-empty">No completed tasks</div>
            )}
          </div>
        </div>

        {/* Current Task Card - Highlighted */}
        <div className="task-card task-card-current">
          <div className="task-card-label">CURRENT</div>
          <div className="task-card-content">
            {currentTask ? (
              <>
                <div className="task-card-title">{currentTask.title}</div>
                <div className="task-card-progress">
                  {getTaskProgress(currentTask).completedSteps}/{getTaskProgress(currentTask).totalSteps} steps
                </div>
                <div className="task-card-next-step">
                  Next: {currentTask.steps.find(step => !step.confirmed)?.text || 'All done!'}
                </div>
              </>
            ) : (
              <div className="task-card-empty">No task in progress</div>
            )}
          </div>
        </div>

        {/* Next Task Card */}
        <div className="task-card task-card-next">
          <div className="task-card-label">NEXT</div>
          <div className="task-card-content">
            {nextTask ? (
              <>
                <div className="task-card-title">{nextTask.title}</div>
                <div className="task-card-progress">
                  {getTaskProgress(nextTask).completedSteps}/{getTaskProgress(nextTask).totalSteps} steps ready
                </div>
              </>
            ) : (
              <div className="task-card-empty">All caught up!</div>
            )}
          </div>
        </div>
      </div>

      {/* CTA Button */}
      <button 
        className="view-tasks-button"
        onClick={() => navigate('/tasks')}
      >
        VIEW ALL TASKS
      </button>

      {/* Chat Input */}
      <div className="chat-input-section">
        <div className="chat-input-label">Ask AI to manage your tasks</div>
        <ChatInput onSubmit={handleChatSubmit} />
      </div>
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

export default MainScreen;