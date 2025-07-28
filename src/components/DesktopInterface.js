import React from 'react';

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
  return (
    <div className="desktop-app-container">
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
            <div className="section input-form-section" ref={inputContainerRef}>
              <div className="section-title">user input</div>
              <div className="input-form">
                <textarea
                  ref={textareaRef}
                  value={userInput}
                  onChange={(e) => setUserInput(e.target.value)}
                  onKeyPress={handleKeyPress}
                  placeholder="Enter your goal (e.g., learn to play guitar)..."
                  className="input-field"
                  rows="1"
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
                                color: step.confirmed ? '#9ca3af' : '#374151'
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
                        style={{ backgroundColor: '#f3f4f6', fontStyle: 'italic' }}
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
                                  color: '#9ca3af',
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
                                        color: '#9ca3af',
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
};

export default DesktopInterface;