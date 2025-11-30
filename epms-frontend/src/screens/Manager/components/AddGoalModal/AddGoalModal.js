import React, { useState, useEffect } from 'react';
import Button from '../../../../components/Button/Button.js';

// Import the shared modal CSS
import '../Modals.css';

function AddGoalModal({ employee, onClose, onSubmit }) {
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');

  const formatEmpName = (emp) => {
    const first = emp?.FirstName ?? emp?.firstName ?? '';
    const last = emp?.LastName ?? emp?.lastName ?? '';
    const name = `${first} ${last}`.trim();
    return name || emp?.UserID || emp?.userId || 'Unknown';
  };

  useEffect(() => {
    setTitle('');
    setDescription('');
  }, [employee]);

  const submit = (e) => {
    e.preventDefault();
    if (!title.trim()) return;
    onSubmit(employee.EmpID, title.trim(), description.trim());
  };

  return (
    <div className="modal-overlay">
      <div className="modal-content feedback-modal">
        <button className="modal-close-btn" onClick={onClose}>
          &times;
        </button>
        <h2 className="modal-title">Add Goal for {formatEmpName(employee)}</h2>

        <form onSubmit={submit}>
          <div className="feedback-form-group">
            <label className="feedback-label">Goal Title</label>
            <input className="feedback-input" value={title} onChange={(e) => setTitle(e.target.value)} placeholder="Goal title" required />
          </div>

          <div className="feedback-form-group">
            <label className="feedback-label">Description</label>
            <textarea className="feedback-textarea" value={description} onChange={(e) => setDescription(e.target.value)} placeholder="Describe goal..." />
          </div>

          <div className="modal-actions">
            <Button type="button" size="md" color="secondary" onClick={onClose}>
              Cancel
            </Button>
            <Button type="submit" size="md" color="primary">
              Save Goal
            </Button>
          </div>
        </form>
      </div>
    </div>
  );
}

export default AddGoalModal;