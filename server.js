// server.js
const express = require('express');
const nodemailer = require('nodemailer');
const bodyParser = require('body-parser');
const cors = require('cors'); // Import cors
const fs = require('fs');
const path = require('path');

const app = express();


app.use(cors({
  origin: '*',  // Allows requests from any origin
}));
app.use(express.json()); // For parsing application/json
app.use(bodyParser.json());

let otpStore = {};
// Nodemailer configuration
const transporter = nodemailer.createTransport({
  service: 'gmail',
  host: 'smtp.gmail.com',
  auth: {
      user: 'satyaprakashroy28@gmail.com',
      pass: 'sdfe hlyc nsnd nfaw'
  }
});

const usersFilePath = path.join(__dirname, 'user.json');
const jobFilePath = path.join(__dirname,'job.json');

 
// Route to send OTP
app.post('/send-otp', (req, res) => {
  const email = req.body.email;
  const otp = Math.floor(100000 + Math.random() * 900000).toString(); // 6-digit OTP

  otpStore[email] = otp;

  const mailOptions = {
      from: {
        name: 'QuantumCodex',
        address: 'satyaprakashroy28@gmail.com'
      },
      to: email,
      subject: 'Your OTP Code',
      text: `Your OTP code is ${otp}`
  };

  transporter.sendMail(mailOptions, (error, info) => {
      if (error) {
          return res.json({ success: false, message: 'Error sending OTP' });
      } else {
          return res.json({ success: true, message: 'OTP sent' });
      }
  });
});

// Route to verify OTP
app.post('/verify-otp', (req, res) => {
  const { email, otp } = req.body;
  
  if (otpStore[email] && otpStore[email] === otp) {
    // OTP is valid
    delete otpStore[email]; // Clear the OTP after verification
    return res.json({ success: true, message: 'OTP verified successfully' });
  } else {
    // OTP is invalid or expired
    return res.json({ success: false, message: 'Invalid or expired OTP' });
  }
});


// Read users data
app.get('/users', (req, res) => {
  fs.readFile(usersFilePath, 'utf8', (err, data) => {
    if (err) {
      return res.status(500).send('Error reading user data.');
    }
    res.send(JSON.parse(data));
  });
});
// Read Job data
app.get('/jobs', (req, res) => {
    fs.readFile(jobFilePath, 'utf8', (err, data) => {
      if (err) {
        return res.status(500).send('Error reading user data.');
      }
      res.send(JSON.parse(data));
    });
  });

// Add a new user
app.post('/users', (req, res) => {
  fs.readFile(usersFilePath, 'utf8', (err, data) => {
    if (err) {
      return res.status(500).send('Error reading user data.');
    }
    const users = JSON.parse(data);
    const newUser = req.body;
    users.push(newUser);
    fs.writeFile(usersFilePath, JSON.stringify(users, null, 2), (err) => {
      if (err) {
        return res.status(500).send('Error saving user data.');
      }
      res.status(201).send('User added.');
    });
  });
});

// Add a new job
app.post('/jobs', (req, res) => {
  fs.readFile(jobFilePath, 'utf8', (err, data) => {
      if (err) {
          return res.status(500).json({ message: 'Error reading job data.' });
      }
      const jobs = JSON.parse(data);
      const newJob = req.body;
      jobs.push(newJob);
      fs.writeFile(jobFilePath, JSON.stringify(jobs, null, 2), (err) => {
          if (err) {
              return res.status(500).json({ message: 'Error saving job data.' });
          }
          res.status(201).json({ message: 'Job added successfully.' });
      });
  });
});


// Route to update user by email
app.put('/users/:email', (req, res) => {
  const userEmail = req.params.email;
  const updatedUser = req.body;

  // Read the existing users from the user.json file
  fs.readFile(usersFilePath, 'utf8', (err, data) => {
      if (err) {
          return res.status(500).send('Error reading user data.');
      }

      const users = JSON.parse(data);
      // Find the index of the user with the matching email
      const userIndex = users.findIndex(user => user.email === userEmail);

      if (userIndex === -1) {
          return res.status(404).send('User not found.');
      }

      // Update the user information
      users[userIndex] = { ...users[userIndex], ...updatedUser };

      // Write the updated users back to the user.json file
      fs.writeFile(usersFilePath, JSON.stringify(users, null, 2), (err) => {
          if (err) {
              return res.status(500).send('Error saving updated user data.');
          }
          res.send('User updated successfully.');
      });
  });
});


// Update a job
app.put('/jobs/:jobID', (req, res) => {
  const jobID = parseInt(req.params.jobID);
  const updatedJob = req.body;

  fs.readFile(jobFilePath, 'utf8', (err, data) => {
      if (err) {
          return res.status(500).json({ message: 'Error reading job data.' });
      }

      let jobs = JSON.parse(data);
      const jobIndex = jobs.findIndex(job => job.jobID === jobID);

      if (jobIndex === -1) {
          return res.status(404).json({ message: 'Job not found.' });
      }

      // Update job data
      jobs[jobIndex] = { ...jobs[jobIndex], ...updatedJob };

      fs.writeFile(jobFilePath, JSON.stringify(jobs, null, 2), (err) => {
          if (err) {
              return res.status(500).json({ message: 'Error saving job data.' });
          }
          res.status(200).json({ message: 'Job updated successfully.' });
      });
  });
});

const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
  console.log(`Server is running on http://localhost:${PORT}`);
});
