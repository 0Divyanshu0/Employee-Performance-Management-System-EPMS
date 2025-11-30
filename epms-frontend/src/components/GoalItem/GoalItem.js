import React from 'react';
import './GoalItem.css';

const GoalItem = ({ title, progress }) => {
  const status = progress === 100 ? 'Completed' : 'In Progress';
  const statusClass = progress === 100 ? 'goal-item__status--completed' : 'goal-item__status--in-progress';

  return (
    <div className="goal-item">
      <div className="goal-item__info">
        <h4 className="goal-item__title">{title}</h4>
        <div className="goal-item__progress-bar-container">
          <div 
            className="goal-item__progress-bar" 
            style={{ width: `${progress}%` }}
          ></div>
        </div>
        <p className="goal-item__percentage">{progress}% complete</p>
      </div>
      <div className={`goal-item__status ${statusClass}`}>
        {status}
      </div>
    </div>
  );
};

export default GoalItem;