import React, { useState, useEffect } from 'react';
import Button from '../../../../components/Button/Button.js';

// Import the shared modal CSS
import '../Modals.css';

function ViewFeedbackModal({ employee, onClose, fetchFeedback }) {
  const [feedbackList, setFeedbackList] = useState([]);
  const [loading, setLoading] = useState(true);

  const formatEmpName = (emp) => {
    const first = emp?.FirstName ?? emp?.firstName ?? '';
    const last = emp?.LastName ?? emp?.lastName ?? '';
    const name = `${first} ${last}`.trim();
    return name || emp?.UserID || emp?.userId || 'Unknown';
  };

  useEffect(() => {
    let mounted = true;
    (async () => {
      setLoading(true);
      try {
        const list = await fetchFeedback(employee.EmpID);
        if (!mounted) return;
        setFeedbackList(list || []);
      } catch (err) {
        console.error('Error fetching feedback list:', err);
        setFeedbackList([]);
      } finally {
        if (mounted) setLoading(false);
      }
    })();
    return () => {
      mounted = false;
    };
  }, [employee, fetchFeedback]);

  return (
    <div className="modal-overlay">
      <div className="modal-content feedback-modal">
        <button className="modal-close-btn" onClick={onClose}>
          &times;
        </button>
        <h2 className="modal-title">Feedback History for {formatEmpName(employee)}</h2>

        <div className="feedback-list-container">
          {loading ? (
            <div style={{ padding: 12 }}>Loading...</div>
          ) : feedbackList.length ? (
            <ul className="feedback-list">
              {feedbackList.map((fb) => (
                <li key={fb.FeedbackID ?? fb.id} className="feedback-list-item">
                  <strong>Rating: {fb.Score ?? fb.rating ?? 'N/A'}/10</strong>
                  <p>{fb.Comments ?? fb.text ?? ''}</p>
                  <small style={{ color: '#666' }}>{fb.CreatedAt ? new Date(fb.CreatedAt).toLocaleString() : ''}</small>
                </li>
              ))}
            </ul>
          ) : (
            <div className="no-feedback-message">No feedback available.</div>
          )}
        </div>

        <div className="modal-actions">
          <Button size="md" color="primary" onClick={onClose}>
            Close
          </Button>
        </div>
      </div>
    </div>
  );
}

export default ViewFeedbackModal;