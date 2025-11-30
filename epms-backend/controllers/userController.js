// epms-backend/controllers/userController.js

const bcrypt = require('bcryptjs');
const { poolPromise, sql } = require('../db'); 

// GET All Users
exports.getAllUsers = async (req, res) => {
    try {
        const pool = await poolPromise;
        const query = `
            SELECT 
                UserID, 
                UserRole, 
                FirstName, 
                LastName,
                Email 
            FROM [MU-SIGMA\\MR.Anish].[Users]
        `;

        const result = await pool.request().query(query);

        const users = result.recordset.map(user => ({
            UserID: user.UserID, 
            UserRole: user.UserRole,
            FirstName: user.FirstName,
            LastName: user.LastName,
            Email: user.Email
        }));
        
        return res.status(200).json(users);

    } catch (err) {
        console.error('💥 SQL Error fetching users:', err);
        return res.status(500).json({ 
            message: 'Failed to fetch user list from the database.',
            error: err.originalError?.info?.message || err.message
        });
    }
};

// POST Add New User
exports.createUser = async (req, res) => {
    const { UserID, FirstName, LastName, UserRole, Password, Email } = req.body;

    if (!UserID || !FirstName || !LastName || !UserRole || !Password) {
        return res.status(400).json({ message: 'All fields are required.' });
    }
    
    try {
        const pool = await poolPromise;
        
        const salt = await bcrypt.genSalt(10);
        const passwordHash = await bcrypt.hash(Password, salt);

        const query = `
            INSERT INTO [MU-SIGMA\\MR.Anish].[Users] 
                (UserID, PasswordHash, UserRole, FirstName, LastName, Email)
            OUTPUT inserted.UserID, inserted.UserRole, inserted.FirstName, inserted.LastName, inserted.LastName
            VALUES 
                (@UserID, @PasswordHash, @UserRole, @FirstName, @LastName, @Email)
        `;

        const result = await pool.request()
            .input('UserID', sql.NVarChar, UserID)
            .input('PasswordHash', sql.NVarChar, passwordHash)
            .input('UserRole', sql.NVarChar, UserRole)
            .input('FirstName', sql.NVarChar, FirstName)
            .input('LastName', sql.NVarChar, LastName)
            .input('Email', sql.NVarChar, Email)
            .query(query);

        const newUser = result.recordset[0];
        
        return res.status(201).json(newUser);

    } catch (err) {
        if (err.message.includes('Violation of UNIQUE KEY constraint')) {
            return res.status(409).json({ message: 'User ID already exists.' });
        }
        
        console.error('💥 SQL Error saving new user:', err);
        return res.status(500).json({ 
            message: 'An internal server error occurred while adding the user.',
            error: err.originalError?.info?.message || err.message
        });
    }
};

// PUT Update Existing User
exports.updateUser = async (req, res) => {
    const { userId } = req.params; 
    const { FirstName, LastName, UserRole, Password } = req.body;

    if (!FirstName || !LastName || !UserRole) {
        return res.status(400).json({ message: 'First Name, Last Name, and Role are required for update.' });
    }

    try {
        const pool = await poolPromise;
        let passwordUpdate = '';
        let request = pool.request();
        
        if (Password) {
            const salt = await bcrypt.genSalt(10);
            const passwordHash = await bcrypt.hash(Password, salt);
            passwordUpdate = ', PasswordHash = @PasswordHash';
            request.input('PasswordHash', sql.NVarChar, passwordHash);
        }

        const query = `
            UPDATE [MU-SIGMA\\MR.Anish].[Users]
            SET 
                FirstName = @FirstName,
                LastName = @LastName,
                UserRole = @UserRole
                ${passwordUpdate}
            OUTPUT inserted.UserID, inserted.UserRole, inserted.FirstName, inserted.LastName
            WHERE UserID = @UserID
        `;
        
        request.input('UserID', sql.NVarChar, userId);
        request.input('FirstName', sql.NVarChar, FirstName);
        request.input('LastName', sql.NVarChar, LastName);
        request.input('UserRole', sql.NVarChar, UserRole);

        const result = await request.query(query);
        
        if (result.rowsAffected[0] === 0) {
            return res.status(404).json({ message: 'User not found.' });
        }

        const updatedUser = result.recordset[0];
        return res.status(200).json(updatedUser);

    } catch (err) {
        console.error('💥 SQL Error updating user:', err);
        return res.status(500).json({ 
            message: 'An internal server error occurred while updating the user.',
            error: err.originalError?.info?.message || err.message
        });
    }
};

// DELETE User
exports.deleteUser = async (req, res) => {
    const { userId } = req.params;

    try {
        const pool = await poolPromise;

        const query = `
            DELETE FROM [MU-SIGMA\\MR.Anish].[Users]
            WHERE UserID = @UserID
        `;

        const result = await pool.request()
            .input('UserID', sql.NVarChar, userId)
            .query(query);
        
        if (result.rowsAffected[0] === 0) {
            return res.status(404).json({ message: 'User not found.' });
        }

        return res.status(204).send(); 

    } catch (err) {
        console.error('💥 SQL Error deleting user:', err);
        return res.status(500).json({ 
            message: 'An internal server error occurred while deleting the user.',
            error: err.originalError?.info?.message || err.message
        });
    }
};