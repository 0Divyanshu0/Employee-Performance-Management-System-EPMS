import React from 'react';
import './Header.css';
import UserProfileDropdown from '../UserProfileDropdown/UserProfileDropdown.js'; 

// ✅ Added "showMenuIcon = true" default prop
const Header = ({ userName, userRole, notifications, onLogout, onMenuClick, showMenuIcon = true }) => {
  return (
    <header className="header">
      <div className="header__left">
        {/* ✅ Show menu icon only if prop is true */}
        {showMenuIcon && (
          <span className="header__menu-icon" onClick={onMenuClick}>
            &#9776;
          </span>
        )}
        <h1 className="header__title">Employee Performance Management System</h1>
      </div>

      <div className="header__right">
        <UserProfileDropdown 
          userName={userName} 
          userRole={userRole} 
          onLogout={onLogout}
        />
      </div>
    </header>
  );
};

export default Header;
