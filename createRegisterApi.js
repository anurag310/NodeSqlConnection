const { Sequelize, DataTypes } = require('sequelize');
const express = require('express');
const bcrypt = require('bcrypt');
const app = express();

// Initialize Sequelize with your database connection settings
const sequelize = new Sequelize('BlogsDB', 'prapti', 'prapti@123', {
    host: 'localhost',
    dialect: 'mssql',  // Change this if you're using a different SQL dialect
    dialectOptions: {
        options: {
            encrypt: true  // For Azure SQL Database
        }
    }
});

app.use(express.json());

// Define the Register model
const Register = sequelize.define('Register', {
    Id: {
        type: DataTypes.INTEGER,
        primaryKey: true,
        autoIncrement: true
    },
    userName: {
        type: DataTypes.STRING,
        allowNull: false
    },
    Email: {
        type: DataTypes.STRING,
        allowNull: false,
        validate: {
            isEmail: true
        }
    },
    Password: {
        type: DataTypes.STRING,
        allowNull: false
    }
}, {
    tableName: 'Register',
    timestamps: false
});

// Sync database (create table if not exists)
sequelize.sync()
    .then(() => console.log('Database synced'))
    .catch(err => console.error('Failed to sync database:', err));

// Register route
app.post('/register', async (req, res) => {
    const { userName, Email, Password } = req.body;

    // Validate input
    if (!userName || !Email || !Password) {
        return res.status(400).json({ message: 'Please fill in all fields' });
    }

    try {
        // Check if email already exists
        const existingUser = await Register.findOne({ where: { Email } });
        if (existingUser) {
            return res.status(400).json({ message: 'Email already in use' });
        }

        // Hash the password before saving
        const hashedPassword = await bcrypt.hash(Password, 10);

        // Insert user into the database
        const newUser = await Register.create({
            userName,
            Email,
            Password: hashedPassword,
        });

        res.status(201).json({
            message: 'User registered successfully',
            user: { id: newUser.Id, userName: newUser.userName, Email: newUser.Email }
        });
    } catch (error) {
        console.error(error.message);
        res.status(500).json({ message: 'Internal Server Error' });
    }
});

const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
    console.log(`Server is running on port ${PORT}`);
});
