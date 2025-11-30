// src/components/KPI Card/KpiCard.js

import React from 'react';
import './KpiCard.css';

// FIX: Accept IconComponent prop and rename the old 'icon' prop
const KpiCard = ({ title, content, details, IconComponent }) => {
  return (
    <div className="kpi-card">
      <div className="kpi-card__header">
        <h3 className="kpi-card__title">{title}</h3>
        {/* FIX: Render the MUI Icon component */}
        <span className="kpi-card__icon">
          {IconComponent && <IconComponent fontSize="medium" />}
        </span>
      </div>
      <div className="kpi-card__content">
        <p className="kpi-card__content-main">{content}</p>
        <p className="kpi-card__content-details">{details}</p>
      </div>
    </div>
  );
};

export default KpiCard;