import './App.css';
import React, { useState } from "react";

// Mock data for AI-generated steps
const getStepsForGoal = (goal) => {
  const stepMap = {
    'learn to play guitar': [
      'Research guitar basics',
      'Buy a guitar',
      'Take online lessons',
      'Practice daily for 30 minutes',
      'Join a local music group'
    ],
    'get fit': [
      'Set fitness goals',
      'Create workout schedule',
      'Join a gym or set up home gym',
      'Start with basic exercises',
      'Track progress weekly'
    ],
    'learn programming': [
      'Choose a programming language',
      'Set up development environment',
      'Complete online tutorials',
      'Build practice projects',
      'Join coding community'
    ],
    'start a business': [
      'Identify business idea',
      'Conduct market research',
      'Create business plan',
      'Secure funding',
      'Launch minimum viable product'
    ],
    'learn spanish': [
      'Install language learning app',
      'Study basic grammar',
      'Practice daily vocabulary',
      'Watch Spanish movies with subtitles',
      'Find conversation partner'
    ]
  };
  
  return stepMap[goal.toLowerCase()] || [
    'Break down the goal into smaller tasks',
    'Research best practices',
    'Create a timeline',
    'Start with the basics',
    'Practice regularly'
  ];
};

// Simple SVG icons
const CheckIcon = () => (
  <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" className="icon">
    <path d="M20 6L9 17l-5-5" />
  </svg>
);

const XIcon = () => (
  <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" className="icon">
    <path d="M18 6L6 18" />
    <path d="M6 6L18 18" />
  </svg>
);

const ChevronRightIcon = () => (
  <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" className="expand-icon">
    <path d="M9 18l6-6-6-6" />
  </svg>
);

function App() {
  const [userInput, setUserInput] = useState("");
  const [taskStream, setTaskStream] = useState([]);
  const [allTasks, setAllTasks] = useState([]);
  const [expandedTasks, setExpandedTasks] = useState(new Set());

  const handleSubmit = (e) => {
    if (e) e.preventDefault();
    if (!userInput.trim()) return;

    const goalText = userInput.trim();
    
    // Add goal confirmation to task stream
    const goalConfirmation = {
      id: Date.now(),
      type: 'goal',
      text: `TASK: ${goalText}`,
      originalGoal: goalText,
      confirmed: false
    };
    
    setTaskStream(prev => [...prev, goalConfirmation]);
    setUserInput("");
  };

  const handleKeyPress = (e) => {
    if (e.key === 'Enter') {
      handleSubmit(e);
    }
  };

  const confirmGoal = (goalId, isConfirmed) => {
    if (isConfirmed) {
      const goalItem = taskStream.find(item => item.id === goalId);
      if (goalItem) {
        // Add confirmed task to all tasks with steps needing confirmation
        const steps = getStepsForGoal(goalItem.originalGoal);
        const newTask = {
          id: goalId,
          title: goalItem.originalGoal,
          steps: steps.map((step, index) => ({
            id: Date.now() + index + 1,
            text: step,
            confirmed: false
          })),
          completedSteps: []
        };
        
        setAllTasks(prev => [...prev, newTask]);
        
        // Remove goal from task stream and add confirmation message
        setTaskStream(prev => {
          const filtered = prev.filter(item => item.id !== goalId);
          return [...filtered, `AI: Task "${goalItem.originalGoal}" added! Please confirm each step in the schedule.`];
        });
      }
    } else {
      // Remove goal from task stream
      setTaskStream(prev => prev.filter(item => item.id !== goalId));
    }
  };

  const confirmStep = (taskId, stepId, isConfirmed) => {
    setAllTasks(prev => prev.map(task => {
      if (task.id === taskId) {
        const updatedSteps = task.steps.map(step => 
          step.id === stepId 
            ? { ...step, confirmed: isConfirmed }
            : step
        );
        
        if (isConfirmed) {
          // Add to completed steps
          const stepIndex = task.steps.findIndex(s => s.id === stepId);
          const newCompletedSteps = [...task.completedSteps, stepIndex];
          return { ...task, steps: updatedSteps, completedSteps: newCompletedSteps };
        } else {
          // Remove the step entirely
          return { ...task, steps: updatedSteps.filter(s => s.id !== stepId) };
        }
      }
      return task;
    }));
  };

  const toggleTaskExpansion = (taskId) => {
    setExpandedTasks(prev => {
      const newSet = new Set(prev);
      if (newSet.has(taskId)) {
        newSet.delete(taskId);
      } else {
        newSet.add(taskId);
      }
      return newSet;
    });
  };

  const getTaskProgress = (task) => {
    const totalSteps = task.steps.length;
    const completedSteps = task.steps.filter(step => step.confirmed).length;
    return { totalSteps, completedSteps };
  };

  const getCurrentTask = () => {
    if (allTasks.length === 0) return "None";
    
    // Find tasks that have some steps completed but not all
    const inProgressTasks = allTasks.filter(task => {
      const { totalSteps, completedSteps } = getTaskProgress(task);
      return completedSteps > 0 && completedSteps < totalSteps;
    });
    
    if (inProgressTasks.length === 0) return "None";
    
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
    
    const taskIndex = allTasks.findIndex(t => t.id === currentTask.id);
    return `Task ${taskIndex + 1}: ${currentTask.title}`;
  };

  const getLastTask = () => {
    if (allTasks.length === 0) return "None";
    
    // Find tasks that have all steps completed
    const completedTasks = allTasks.filter(task => {
      const { totalSteps, completedSteps } = getTaskProgress(task);
      return completedSteps === totalSteps && totalSteps > 0;
    });
    
    if (completedTasks.length === 0) return "None";
    
    // Get the most recent completed task (highest ID)
    const lastTask = completedTasks.reduce((latest, current) => 
      current.id > latest.id ? current : latest
    );
    
    const taskIndex = allTasks.findIndex(t => t.id === lastTask.id);
    return `Task ${taskIndex + 1}: ${lastTask.title}`;
  };

  const getNextTask = () => {
    if (allTasks.length === 0) return "Start by entering a goal!";
    
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
      const taskIndex = allTasks.findIndex(t => t.id === nextTask.id);
      return `Task ${taskIndex + 1}: ${nextTask.title}`;
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
    
    const taskIndex = allTasks.findIndex(t => t.id === taskWithLeastProgress.id);
    return `Task ${taskIndex + 1}: ${taskWithLeastProgress.title}`;
  };

  return (
    <div className="app-container">
      {/* Header */}
      <header className="header">
        <h1 className="title">PLANNR</h1>
      </header>

      {/* Main Content Box */}
      <main className="main-content-box">
        {/* Top Row: Last Task, Current Task, Next Task */}
        <div className="top-row">
          <div className="nav-box">
            <div className="nav-label">PREVIOUS TASK</div>
            <div className="nav-task">{getLastTask()}</div>
          </div>
          <div className="nav-box">
            <div className="nav-label">CURRENT TASK</div>
            <div className="nav-task current">{getCurrentTask()}</div>
          </div>
          <div className="nav-box">
            <div className="nav-label">NEXT TASK</div>
            <div className="nav-task">{getNextTask()}</div>
          </div>
        </div>

        {/* Bottom Row: Left and Right Columns */}
        <div className="bottom-row">
          {/* Left Column */}
          <div className="left-column">
            {/* Task Stream */}
            <div className="section task-stream-section">
              <div className="section-title">user input stream</div>
              <div className="task-stream">
                {taskStream.map((message, index) => (
                  <div key={index} className="message-box">
                    {typeof message === 'string' ? message : message.text}
                    {typeof message === 'object' && message.id && (
                      <div className="confirmation-buttons">
                        <button 
                          onClick={() => confirmGoal(message.id, true)} 
                          className="confirm-button yes"
                        >
                          <CheckIcon />
                        </button>
                        <button 
                          onClick={() => confirmGoal(message.id, false)} 
                          className="confirm-button no"
                        >
                          <XIcon />
                        </button>
                      </div>
                    )}
                  </div>
                ))}
                {taskStream.length === 0 && (
                  <div className="message-box empty-state">
                    Enter a goal below to get started...
                  </div>
                )}
              </div>
            </div>

            {/* Input Form */}
            <div className="section input-form-section">
              <div className="section-title">user input</div>
              <div className="input-form">
                <input
                  type="text"
                  value={userInput}
                  onChange={(e) => setUserInput(e.target.value)}
                  onKeyPress={handleKeyPress}
                  placeholder="Enter your goal (e.g., learn to play guitar)..."
                  className="input-field"
                />
                <button onClick={handleSubmit} className="submit-button">
                  SUBMIT
                </button>
              </div>
            </div>
          </div>

          {/* Right Column */}
          <div className="right-column">
            {/* All Tasks */}
            <div className="section all-tasks-section">
              <div className="section-title">all user schedule output</div>
              <ul className="task-list">
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
                  <li key={task.id} className="task-item">
                    <div 
                      className="task-header" 
                      onClick={() => toggleTaskExpansion(task.id)}
                    >
                      <span>Task {allTasks.findIndex(t => t.id === task.id) + 1}: {task.title}</span>
                      <span className={`expand-icon ${expandedTasks.has(task.id) ? 'expanded' : ''}`}>
                        <ChevronRightIcon />
                      </span>
                    </div>
                    {expandedTasks.has(task.id) && (
                      <div className="task-steps">
                        {task.steps.map((step, stepIndex) => (
                          <div key={step.id} className="step-item">
                            <span 
                              className="step-text"
                              style={{ 
                                textDecoration: step.confirmed ? 'line-through' : 'none',
                                color: step.confirmed ? '#a0aec0' : '#4a5568'
                              }}
                            >
                              Step {stepIndex + 1}: {step.text}
                            </span>
                            {!step.confirmed && (
                              <div className="step-buttons">
                                <button 
                                  onClick={(e) => { 
                                    e.stopPropagation(); 
                                    confirmStep(task.id, step.id, true); 
                                  }}
                                  className="step-button yes"
                                >
                                  <CheckIcon />
                                </button>
                                <button 
                                  onClick={(e) => { 
                                    e.stopPropagation(); 
                                    confirmStep(task.id, step.id, false); 
                                  }}
                                  className="step-button no"
                                >
                                  <XIcon />
                                </button>
                              </div>
                            )}
                          </div>
                        ))}
                      </div>
                    )}
                  </li>
                ))}
                
                {/* History Section */}
                {(() => {
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
                    <li className="task-item">
                      <div 
                        className="task-header" 
                        onClick={() => toggleTaskExpansion('history')}
                        style={{ backgroundColor: '#f7fafc', fontStyle: 'italic' }}
                      >
                        <span>History ({historyTasks.length} completed tasks)</span>
                        <span className={`expand-icon ${expandedTasks.has('history') ? 'expanded' : ''}`}>
                          <ChevronRightIcon />
                        </span>
                      </div>
                      {expandedTasks.has('history') && (
                        <div className="task-steps">
                          {historyTasks.map((task) => (
                            <div key={task.id} className="step-item">
                              <div 
                                className="step-text"
                                style={{ 
                                  color: '#a0aec0',
                                  textDecoration: 'line-through',
                                  cursor: 'pointer'
                                }}
                                onClick={() => toggleTaskExpansion(task.id)}
                              >
                                Task {allTasks.findIndex(t => t.id === task.id) + 1}: {task.title}
                                {expandedTasks.has(task.id) && (
                                  <div style={{ marginTop: '0.5rem', paddingLeft: '1rem' }}>
                                    {task.steps.map((step, stepIndex) => (
                                      <div key={step.id} style={{ 
                                        fontSize: '0.8rem', 
                                        color: '#a0aec0',
                                        textDecoration: 'line-through',
                                        marginBottom: '0.25rem'
                                      }}>
                                        Step {stepIndex + 1}: {step.text}
                                      </div>
                                    ))}
                                  </div>
                                )}
                              </div>
                            </div>
                          ))}
                        </div>
                      )}
                    </li>
                  );
                })()}
                
                {allTasks.length === 0 && (
                  <li className="empty-state">
                    No confirmed tasks yet...
                  </li>
                )}
              </ul>
            </div>
          </div>
        </div>
      </main>
    </div>
  );
}

export default App;