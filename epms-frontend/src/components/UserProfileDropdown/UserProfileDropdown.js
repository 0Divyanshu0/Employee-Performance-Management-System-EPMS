import React, { useState } from 'react';
import Menu from '@mui/material/Menu';
import MenuItem from '@mui/material/MenuItem';
import Divider from '@mui/material/Divider';
import Typography from '@mui/material/Typography';
import LogoutIcon from '@mui/icons-material/Logout';
import './UserProfileDropdown.css'; // Import the dedicated CSS

const getInitials = (name) => {
  // Simple check for safety, though name should be valid here
  if (!name) return 'J'; 
  return name.split(' ').map(n => n[0]).join('').toUpperCase();
};

const UserProfileDropdown = ({ userName, userRole, onLogout }) => {
  const [anchorEl, setAnchorEl] = useState(null);
  const open = Boolean(anchorEl);

  const handleClick = (event) => {
    setAnchorEl(event.currentTarget);
  };

  const handleClose = () => {
    setAnchorEl(null);
  };

  const handleLogout = () => {
    handleClose(); // Close the menu
    onLogout();    // Execute the logout function passed from App.js
  };

  return (
    <div className="user-profile-dropdown-container">
      {/* Clickable element for the dropdown trigger */}
      <div 
        className="profile-trigger"
        onClick={handleClick}
        aria-controls={open ? 'user-menu' : undefined}
        aria-haspopup="true"
        aria-expanded={open ? 'true' : undefined}
      >
        <div className="profile-avatar">{getInitials(userName)}</div>
        <div className="profile-info">
          <div className="profile-name">{userName}</div>
          <div className="profile-role">{userRole}</div>
        </div>
      </div>
      
      {/* MUI Menu Component */}
      <Menu
        id="user-menu"
        anchorEl={anchorEl}
        open={open}
        onClose={handleClose}
        MenuListProps={{
          'aria-labelledby': 'profile-trigger',
        }}
        // Positioning the menu relative to the trigger
        anchorOrigin={{ vertical: 'bottom', horizontal: 'right' }}
        transformOrigin={{ vertical: 'top', horizontal: 'right' }}
        
        // Customizing the wrapper (MuiPaper-root) to match the screenshot style
        sx={{
            '& .MuiPaper-root': {
                borderRadius: '8px',
                minWidth: '200px',
                boxShadow: '0 4px 12px rgba(0,0,0,0.15)',
                marginTop: '10px', // A little space from the header
            },
        }}
      >
        {/* 'My Account' Header */}
        <MenuItem disabled sx={{ opacity: 1, '&.Mui-disabled': { opacity: 1 } }}>
            <Typography variant="subtitle1" fontWeight="bold">
                {userName}
            </Typography>
        </MenuItem>
        
        <Divider />

        
        {/* Logout Option (styled red) */}
        <MenuItem onClick={handleLogout} className="logout-menu-item">
            <LogoutIcon sx={{ marginRight: 1 }} />
            Logout
        </MenuItem>
      </Menu>
    </div>
  );
};

export default UserProfileDropdown;