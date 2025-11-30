import React, { useState } from 'react';
import './ManagerFeedbackList.css';
import Button from '../../../../components/Button/Button';

// --- A Simple Modal Component (Internal to this file) ---
// We create it here to keep everything related to this list in one place.
const FeedbackViewModal = ({ feedback, onClose }) => {
    if (!feedback) return null;

    return (
        <div className="feedback-modal-overlay" onClick={onClose}>
            <div className="feedback-modal-content" onClick={(e) => e.stopPropagation()}>
                <button className="feedback-modal-close-btn" onClick={onClose}>
                    &times;
                </button>
                <h3 className="feedback-modal-title">
                    Feedback for {feedback.empName}
                </h3>
                <p className="feedback-modal-subtitle">
                    From: {feedback.managerName} | Dept: {feedback.department} | Score: {feedback.score}/10
                </p>
                <div className="feedback-modal-body">
                    <p>{feedback.feedbackText}</p>
                </div>
            </div>
        </div>
    );
};


// --- The Main List Component ---
const ManagerFeedbackList = ({ feedbackList }) => {
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [selectedFeedback, setSelectedFeedback] = useState(null);

    const handleViewClick = (feedback) => {
        setSelectedFeedback(feedback);
        setIsModalOpen(true);
    };

    const handleCloseModal = () => {
        setIsModalOpen(false);
        setSelectedFeedback(null);
    };

    return (
        <div className="feedback-list-container">
            {/* Table Header */}
            <div className="feedback-list-header">
                <span className="header-emp-name">Employee Name</span>
                <span className="header-manager-name">Manager Name</span>
                <span className="header-department">Department</span>
                <span className="header-score">Score</span>
                <span className="header-action">Feedback</span>
            </div>

            {/* Table Body/List */}
            <div className="feedback-list-body">
                {Array.isArray(feedbackList) && feedbackList.map((item) => (
                    <div className="feedback-list-item" key={item.id}>
                        <span className="item-emp-name">{item.empName}</span>
                        <span className="item-manager-name">{item.managerName}</span>
                        <span className="item-department">{item.department}</span>
                        <span className="item-score">{item.score}/10</span>
                        <span className="item-action">
                            <Button
                                size="sm"
                                color="primary"
                                onClick={() => handleViewClick(item)}
                            >
                                View
                            </Button>
                        </span>
                    </div>
                ))}
            </div>

            {/* Render the Modal */}
            <FeedbackViewModal
                feedback={selectedFeedback}
                onClose={handleCloseModal}
            />
        </div>
    );
};

export default ManagerFeedbackList;