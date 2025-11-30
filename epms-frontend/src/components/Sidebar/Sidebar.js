import React from 'react';
import Drawer from '@mui/material/Drawer';
import List from '@mui/material/List';
import ListItem from '@mui/material/ListItem';
import ListItemButton from '@mui/material/ListItemButton';
import ListItemIcon from '@mui/material/ListItemIcon';
import ListItemText from '@mui/material/ListItemText';
import Typography from '@mui/material/Typography';
import Divider from '@mui/material/Divider';
import { IconButton } from '@mui/material';

// --- MUI ICON IMPORTS ---
import DashboardIcon from '@mui/icons-material/Dashboard';
import TrackChangesIcon from '@mui/icons-material/TrackChanges';
import AssignmentIcon from '@mui/icons-material/Assignment';
import CloseIcon from '@mui/icons-material/Close';
// ------------------------

import './Sidebar.css'; // Import the dedicated CSS

// Maps the label string (from navItems) to the actual MUI Icon component
const ICON_MAP = {
  Dashboard: DashboardIcon,
  "Goals & Feedback": TrackChangesIcon,
  "Self Assessment": AssignmentIcon,
};

const Sidebar = ({ open, onClose, navItems, onNavigate }) => {
  const drawerWidth = 260;

  // Renders a single list item
  const renderItem = (item) => {
    // Get the icon component dynamically
    const IconComponent = ICON_MAP[item.label];

    return (
      <ListItem key={item.label} disablePadding>
        <ListItemButton
          onClick={() => {
            onClose();
            onNavigate(item.path);
          }}
          className="sidebar-list-item"
        >
          <ListItemIcon>
            {/* Render the specific icon or a fallback DashboardIcon */}
            {IconComponent ? <IconComponent color="primary" /> : <DashboardIcon color="primary" />}
          </ListItemIcon>
          <ListItemText primary={item.label} />
        </ListItemButton>
      </ListItem>
    );
  };

  return (
    <Drawer
      variant="temporary"
      anchor="left"
      open={open}
      onClose={onClose}
      ModalProps={{
        keepMounted: true,
      }}
      sx={{
        width: drawerWidth,
        '& .MuiDrawer-paper': {
          width: drawerWidth,
          boxSizing: 'border-box',
        },
      }}
    >
      <div className="sidebar-header">
        <Typography variant="h6" color="primary" fontWeight="bold">
          EPMS
        </Typography>
        <IconButton onClick={onClose} size="small">
          <CloseIcon />
        </IconButton>
      </div>

      <Divider />

      <List>
        {navItems.map(renderItem)}
      </List>
    </Drawer>
  );
};

export default Sidebar;