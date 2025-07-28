import React, { useState, useRef, useEffect } from "react";
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import MainScreen from './components/MainScreen';
import TaskListScreen from './components/TaskListScreen';
import ChatInterface from './components/ChatInterface';
import DesktopInterface from './components/DesktopInterface';
import './App.css';

// Mock data for AI-generated steps
const getStepsForGoal = (goal) => {
  const stepMap = {
    '1': [
      'Research guitar basics',
      'Buy a guitar',
      'Take online lessons',
      'Practice daily for 30 minutes',
      'Join a local music group'
    ],
    '2': [
      'Set fitness goals',
      'Create workout schedule',
      'Join a gym or set up home gym',
      'Start with basic exercises',
      'Track progress weekly'
    ],
    '3': [
      'Choose a programming language',
      'Set up development environment',
      'Complete online tutorials',
      'Build practice projects',
      'Join coding community'
    ],
    '4': [
      'Identify business idea',
      'Conduct market research',
      'Create business plan',
      'Secure funding',
      'Launch minimum viable product'
    ],
    '5': [
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
  const [isMobile, setIsMobile] = useState(window.innerWidth <= 768);
  const textareaRef = useRef(null);
  const inputContainerRef = useRef(null);

  // Handle window resize to detect mobile/desktop
  useEffect(() => {
    const handleResize = () => {
      setIsMobile(window.innerWidth <= 768);
    };

    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, []);

  // Auto-resize textarea
  useEffect(() => {
    const textarea = textareaRef.current;
    const container = inputContainerRef.current;
    
    if (textarea && container) {
      // Reset height to calculate scrollHeight
      textarea.style.height = 'auto';
      
      // Get the container height and current content height
      const containerHeight = container.clientHeight;
      const titleHeight = 30; // Approximate height of section title
      const buttonHeight = 44; // Height of submit button
      const padding = 32; // Total padding
      const gap = 12; // Gap between elements
      
      const availableHeight = containerHeight - titleHeight - buttonHeight - padding - gap;
      const contentHeight = textarea.scrollHeight;
      
      // Set height to content or max available space
      if (contentHeight <= availableHeight) {
        textarea.style.height = `${Math.max(contentHeight, 44)}px`;
        textarea.style.overflowY = 'hidden';
      } else {
        textarea.style.height = `${availableHeight}px`;
        textarea.style.overflowY = 'auto';
      }
    }
  }, [userInput]);

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
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
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

  // Render mobile interface with routing
  if (isMobile) {
    return (
      <Router>
        <div className="app-container">
          <Routes>
            <Route 
              path="/" 
              element={
                <MainScreen 
                  allTasks={allTasks}
                  getTaskProgress={getTaskProgress}
                />
              } 
            />
            <Route 
              path="/tasks" 
              element={
                <TaskListScreen 
                  allTasks={allTasks}
                  getTaskProgress={getTaskProgress}
                  confirmStep={confirmStep}
                  toggleTaskExpansion={toggleTaskExpansion}
                  expandedTasks={expandedTasks}
                />
              } 
            />
            <Route 
              path="/chat" 
              element={
                <ChatInterface 
                  userInput={userInput}
                  setUserInput={setUserInput}
                  taskStream={taskStream}
                  setTaskStream={setTaskStream}
                  handleSubmit={handleSubmit}
                  confirmGoal={confirmGoal}
                />
              } 
            />
          </Routes>
        </div>
      </Router>
    );
  }

  // Render desktop interface (original layout)
  return (
    <div className="app-container">
      <DesktopInterface 
        userInput={userInput}
        setUserInput={setUserInput}
        taskStream={taskStream}
        allTasks={allTasks}
        expandedTasks={expandedTasks}
        textareaRef={textareaRef}
        inputContainerRef={inputContainerRef}
        handleSubmit={handleSubmit}
        handleKeyPress={handleKeyPress}
        confirmGoal={confirmGoal}
        confirmStep={confirmStep}
        toggleTaskExpansion={toggleTaskExpansion}
        getTaskProgress={getTaskProgress}
        getCurrentTask={getCurrentTask}
        getLastTask={getLastTask}
        getNextTask={getNextTask}
      />
    </div>
  );
}

export default App;