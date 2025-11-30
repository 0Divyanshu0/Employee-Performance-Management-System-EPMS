// epms-backend/controllers/authController.js

const bcrypt = require('bcryptjs');
const { poolPromise, sql } = require('../db');
// NOTE: bcrypt is imported here because it's used in this logic block

exports.loginUser = async (req, res) => {
    const { email: userId, password } = req.body;

    if (!userId || !password) {
        return res.status(400).json({ message: 'User ID and password are required.' });
    }

    try {
        const pool = await poolPromise;

        const query = `
            SELECT 
                UserID, 
                PasswordHash, 
                UserRole, 
                FirstName, 
                LastName 
            FROM [MU-SIGMA\\MR.Anish].[Users]
            WHERE UserID = @userId
        `;

        const result = await pool.request()
            .input('userId', sql.NVarChar, userId)
            .query(query);

        const user = result.recordset[0];

        if (!user) {
            return res.status(401).json({ message: 'Invalid User ID or password.' });
        }

        const isMatch = await bcrypt.compare(password, user.PasswordHash);

        if (isMatch) {
            return res.status(200).json({
                message: 'Login successful!',
                user: {
                    id: user.UserID,
                    role: user.UserRole,
                    firstName: user.FirstName,
                    lastName: user.LastName
                }
            });
        } else {
            return res.status(401).json({ message: 'Invalid User ID or password.' });
        }

    } catch (err) {
        console.error('💥 SQL Error Details:', err);
        return res.status(500).json({
            message: 'An internal server error occurred.',
            error: err.originalError?.info?.message || err.message
        });
    }
};