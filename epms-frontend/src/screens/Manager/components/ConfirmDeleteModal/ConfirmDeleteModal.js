import React from 'react';
import Button from '../../../../components/Button/Button.js';

// Import the shared modal CSS
import '../Modals.css';

function ConfirmDeleteModal({ onClose, onConfirm }) {

  return (
    <div className="modal-overlay">
      <div className="modal-content feedback-modal">
        <button className="modal-close-btn" onClick={onClose}>
          &times;
        </button>
        <h2 className="modal-title">Confirm Deletion</h2>
        
        <div className="feedback-form-group">
          <p className="modal-subtitle" style={{margin: 0}}>
            Are you sure you want to permanently remove this goal? This action cannot be undone.
          </p>
        </div>

        <div className="modal-actions">
          <Button type="button" size="md" color="secondary" onClick={onClose}>
            Cancel
          </Button>
          {/* This button will use the "danger" style from your Button.css */}
          <Button type="button" size="md" color="danger" onClick={onConfirm}>
            Delete Goal
          </Button>
        </div>

      </div>
    </div>
  );
}

export default ConfirmDeleteModal;