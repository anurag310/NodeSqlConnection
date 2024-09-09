const express = require('express');
const app = express();
const port = 3000;
const mongoose = require('mongoose');

// Department Schema
const departmentSchema = new mongoose.Schema({
    name: { type: String, required: true }
});

// Manager Schema
const managerSchema = new mongoose.Schema({
    name: { type: String, required: true }
});

// User Schema
const userSchema = new mongoose.Schema({
    name: { type: String, required: [true, "Please enter a name"] },
    age: { type: Number, min: [18, "Age must be 18 or greater"], max: [90, "Age must be 90 or less"] },
    department: { type: mongoose.Schema.Types.ObjectId, ref: 'Department', required: true },
    managerId: { type: mongoose.Schema.Types.ObjectId, ref: 'Manager', required: true }
});

// Models
const Department = mongoose.model('Department', departmentSchema);
const Manager = mongoose.model('Manager', managerSchema);
const User = mongoose.model('User', userSchema);

// Connect to MongoDB
mongoose.connect('mongodb://0.0.0.0:27017/MultiTable', {
    useNewUrlParser: true,
    useUnifiedTopology: true
});

async function createData() {
    try {
        // Insert multiple departments
        const departments = await Department.insertMany([
            { name: 'IT' },
            { name: 'HR' }
        ]);

        // Insert multiple managers
        const managers = await Manager.insertMany([
            { name: 'John' },
            { name: 'Smith' }
        ]);

        // Check if departments and managers were inserted properly
        if (departments.length > 0 && managers.length > 0) {
            // Create a new user
            const user = new User({
                name: 'John',
                age: 23,
                department: departments[1]._id, // HR department
                managerId: managers[0]._id      // John as the manager
            });

            // Save the user
            await user.save();

            console.log('Data created successfully');
        } else {
            console.log('No departments or managers found');
        }
    } catch (error) {
        console.error('Error creating data:', error);
    }
}

// Create data
createData();

app.listen(port, () => {
    console.log(`Server running at http://localhost:${port}/`);
});
