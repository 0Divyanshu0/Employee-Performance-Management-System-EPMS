// epms-backend/server.js
// epms-backend/server.js
const express = require('express');
const cors = require('cors');
require('dotenv').config();
require('./db'); // start DB connection
require('./db'); // start DB connection

const authRoutes = require('./routes/authRoutes');
const userRoutes = require('./routes/userRoutes');
const employeeRoute = require('./routes/employeeroute');
const hrRoutes = require('./routes/hrRoutes'); // optional
const managerRoute = require("./routes/managerroute")


const app = express();
const PORT = process.env.PORT || 5000;

const corsOptions = {
  origin: process.env.FRONTEND_URL || 'http://localhost:3000',
  optionsSuccessStatus: 200,
};

app.use(cors(corsOptions));
app.use(express.json());

// Route mounting
// Route mounting
app.use('/api/auth', authRoutes);
app.use('/api/users', userRoutes);
app.use('/api/employee', employeeRoute);
if (hrRoutes) app.use('/api/hr', hrRoutes);
// Manager Routes
app.use('/api/manager', managerRoute);
app.listen(PORT, () => {
  console.log(`✅ Server running on http://localhost:${PORT}`);
});
