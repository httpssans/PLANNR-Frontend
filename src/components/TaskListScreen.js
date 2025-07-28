import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import './TaskListScreen.css';

const TaskListScreen = ({ allTasks, getTaskProgress, confirmStep, toggleTaskExpansion, expandedTasks }) => {
  const navigate = useNavigate();

  // Simple SVG icons
  const CheckIcon = () => (
    <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" className="step-icon">
      <path d="M20 6L9 17l-5-5" />
    </svg>
  );

  const XIcon = () => (
    <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" className="step-icon">
      <path d="M18 6L6 18" />
      <path d="M6 6L18 18" />
    </svg>
  );

  const ChevronRightIcon = () => (
    <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" className="expand-icon">
      <path d="M9 18l6-6-6-6" />
    </svg>
  );

  const BackIcon = () => (
    <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" className="back-icon">
      <path d="M19 12H5" />
      <path d="M12 19l-7-7 7-7" />
    </svg>
  );

  return (
    <div className="task-list-screen">
      {/* Header with back button */}
      <header className="task-list-header">
        <button className="back-button" onClick={() => navigate('/')}>
          <BackIcon />
        </button>
        <h1 className="task-list-title">All Tasks</h1>
        <div className="header-spacer"></div>
      </header>

      {/* Task List */}
      <div className="task-list-container">
        {allTasks.length === 0 ? (
          <div className="empty-state">
            <div className="empty-state-icon">📋</div>
            <div className="empty-state-title">No tasks yet</div>
            <div className="empty-state-subtitle">Go back to create your first task</div>
            <button className="create-task-button" onClick={() => navigate('/')}>
              Create Task
            </button>
          </div>
        ) : (
          <ul className="mobile-task-list">
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
            }).map((task, index) => {
              const { totalSteps, completedSteps } = getTaskProgress(task);
              const isExpanded = expandedTasks.has(task.id);
              
              return (
                <li key={task.id} className="mobile-task-item">
                  <div 
                    className="mobile-task-header" 
                    onClick={() => toggleTaskExpansion(task.id)}
                  >
                    <div className="task-info">
                      <div className="task-title">
                        Task {allTasks.findIndex(t => t.id === task.id) + 1}: {task.title}
                      </div>
                      <div className="task-progress">
                        {completedSteps}/{totalSteps} steps completed
                      </div>
                    </div>
                    <div className={`expand-icon ${isExpanded ? 'expanded' : ''}`}>
                      <ChevronRightIcon />
                    </div>
                  </div>
                  
                  {isExpanded && (
                    <div className="mobile-task-steps">
                      {task.steps.map((step, stepIndex) => (
                        <div key={step.id} className="mobile-step-item">
                          <div className="step-info">
                            <div 
                              className="step-text"
                              style={{ 
                                textDecoration: step.confirmed ? 'line-through' : 'none',
                                color: step.confirmed ? '#9ca3af' : '#374151'
                              }}
                            >
                              Step {stepIndex + 1}: {step.text}
                            </div>
                          </div>
                          {!step.confirmed && (
                            <div className="step-actions">
                              <button 
                                onClick={(e) => { 
                                  e.stopPropagation(); 
                                  confirmStep(task.id, step.id, true); 
                                }}
                                className="step-button step-button-yes"
                              >
                                <CheckIcon />
                              </button>
                              <button 
                                onClick={(e) => { 
                                  e.stopPropagation(); 
                                  confirmStep(task.id, step.id, false); 
                                }}
                                className="step-button step-button-no"
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
              );
            })}
            
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
                <li className="mobile-task-item history-section">
                  <div 
                    className="mobile-task-header history-header" 
                    onClick={() => toggleTaskExpansion('history')}
                  >
                    <div className="task-info">
                      <div className="task-title">
                        History ({historyTasks.length} completed tasks)
                      </div>
                      <div className="task-progress">
                        All steps completed
                      </div>
                    </div>
                    <div className={`expand-icon ${expandedTasks.has('history') ? 'expanded' : ''}`}>
                      <ChevronRightIcon />
                    </div>
                  </div>
                  
                  {expandedTasks.has('history') && (
                    <div className="mobile-task-steps">
                      {historyTasks.map((task) => (
                        <div key={task.id} className="mobile-step-item history-task">
                          <div 
                            className="step-text completed-task"
                            onClick={() => toggleTaskExpansion(task.id)}
                          >
                            Task {allTasks.findIndex(t => t.id === task.id) + 1}: {task.title}
                            {expandedTasks.has(task.id) && (
                              <div className="completed-task-steps">
                                {task.steps.map((step, stepIndex) => (
                                  <div key={step.id} className="completed-step">
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
          </ul>
        )}
      </div>
    </div>
  );
};

export default TaskListScreen;