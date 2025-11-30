import React, { useState, useEffect } from 'react';
import Button from '../../../../components/Button/Button.js';

// Import the shared modal CSS
import '../Modals.css';

function ProvideFeedbackModal({ employee, onClose, onSubmit }) {
  const [rating, setRating] = useState(8);
  const [text, setText] = useState('');

  // local helper to format name
  const formatEmpName = (emp) => {
    const first = emp?.FirstName ?? emp?.firstName ?? '';
    const last = emp?.LastName ?? emp?.lastName ?? '';
    const name = `${first} ${last}`.trim();
    return name || emp?.UserID || emp?.userId || 'Unknown';
  };

  useEffect(() => {
    setRating(8);
    setText('');
  }, [employee]);

  // --- UPDATED: This formula is now correct for a 1-10 range ---
  // It calculates how far the (rating - min) is through the (max - min) range.
  const progressPercent = ((rating - 1) / (10 - 1)) * 100;

  return (
    <div className="modal-overlay">
      <div className="modal-content feedback-modal">
        <button className="modal-close-btn" onClick={onClose}>
          &times;
        </button>
        <h2 className="modal-title">Provide Feedback for {formatEmpName(employee)}</h2>

        <form
          onSubmit={(e) => {
            e.preventDefault();
            onSubmit(employee.EmpID, Number(rating), text);
          }}
        >
          <div className="feedback-form-group">
            <label className="feedback-label">Rating: {rating}/10</label>
            {/* The style prop now receives the correct percentage */}
            <input 
              className="feedback-rating-slider" 
              type="range" 
              min="1" 
              max="10" 
              value={rating} 
              onChange={(e) => setRating(e.target.value)} 
              style={{ '--progress': `${progressPercent}%` }}
            />
          </div>

          <div className="feedback-form-group">
            <label className="feedback-label">Feedback</label>
            <textarea className="feedback-textarea" value={text} onChange={(e) => setText(e.target.value)} placeholder="Write feedback..." />
          </div>

          <div className="modal-actions">
            <Button type="button" size="md" color="secondary" onClick={onClose}>
              Cancel
            </Button>
            <Button type="submit" size="md" color="primary">
              Submit Feedback
            </Button>
          </div>
        </form>
      </div>
    </div>
  );
}

export default ProvideFeedbackModal;