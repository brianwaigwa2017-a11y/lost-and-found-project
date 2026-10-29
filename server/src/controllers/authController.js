const jwt = require('jsonwebtoken');
const { validationResult } = require('express-validator');

const User = require('../models/User');
const Log = require('../models/Log');

// Generate a JWT token after successful login.
const generateToken = (id) => {
if (!process.env.JWT_SECRET) {
throw new Error('JWT_SECRET is missing from the .env file');
}

return jwt.sign(
{ id },
process.env.JWT_SECRET,
{ expiresIn: '7d' }
);
};

// Register a new student without requiring email verification.
const registerUser = async (req, res) => {
try {
const errors = validationResult(req);


if (!errors.isEmpty()) {
  return res.status(400).json({
    message: 'Validation failed',
    errors: errors.array()
  });
}

const { name, email, password, studentId } = req.body;
const normalizedEmail = email.toLowerCase().trim();

// Prevent duplicate accounts.
const existingUser = await User.findOne({
  email: normalizedEmail
});

if (existingUser) {
  return res.status(400).json({
    message: 'User already exists'
  });
}

// Public registration always creates a student account.
// The email is marked verified because verification is disabled.
const user = await User.create({
  name,
  email: normalizedEmail,
  password,
  role: 'student',
  studentId: studentId || '',
  isEmailVerified: true,
  emailVerificationToken: null,
  emailVerificationExpires: null
});

// Record the registration.
await Log.create({
  user: user._id,
  action: 'register',
  details: 'User registered without email verification',
  ip: req.ip
});

// Return a token so the student can log in immediately.
return res.status(201).json({
  message: 'Registration successful. You can now log in.',
  token: generateToken(user._id),
  user: {
    _id: user._id,
    name: user.name,
    email: user.email,
    role: user.role,
    studentId: user.studentId,
    isActive: user.isActive,
    isEmailVerified: user.isEmailVerified
  }
});


} catch (error) {
console.error('Registration error:', error.message);


return res.status(500).json({
  message: 'Registration failed. Please try again.'
});


}
};

// Keep the verification endpoint for any old verification links.
// New registrations no longer require this endpoint.
const verifyEmail = async (req, res) => {
return res.json({
message: 'Email verification is disabled. You can log in directly.'
});
};

// Log in without requiring email verification.
const loginUser = async (req, res) => {
try {
const errors = validationResult(req);


if (!errors.isEmpty()) {
  return res.status(400).json({
    message: 'Validation failed',
    errors: errors.array()
  });
}

const { email, password } = req.body;

const user = await User.findOne({
  email: email.toLowerCase().trim()
});

// Verify the email and password credentials.
if (!user || !(await user.matchPassword(password))) {
  return res.status(401).json({
    message: 'Invalid email or password'
  });
}

// Prevent deactivated accounts from logging in.
if (!user.isActive) {
  return res.status(401).json({
    message: 'Account is deactivated'
  });
}

// Record the successful login.
await Log.create({
  user: user._id,
  action: 'login',
  details: 'User logged in',
  ip: req.ip
});

return res.json({
  token: generateToken(user._id),
  user: {
    _id: user._id,
    name: user.name,
    email: user.email,
    role: user.role,
    studentId: user.studentId,
    isActive: user.isActive,
    isEmailVerified: user.isEmailVerified
  }
});

} catch (error) {
console.error('Login error:', error.message);


return res.status(500).json({
  message: 'Login failed. Please try again.'
});


}
};

// Return the profile of the authenticated user.
const getProfile = async (req, res) => {
return res.json({
user: {
_id: req.user._id,
name: req.user.name,
email: req.user.email,
role: req.user.role,
studentId: req.user.studentId,
isActive: req.user.isActive,
isEmailVerified: req.user.isEmailVerified
}
});
};

// Update the user's profile.
const updateProfile = async (req, res) => {
try {
const { name, studentId } = req.body;


req.user.name = name || req.user.name;
req.user.studentId = studentId ?? req.user.studentId;

await req.user.save();

return res.json({
  user: {
    _id: req.user._id,
    name: req.user.name,
    email: req.user.email,
    role: req.user.role,
    studentId: req.user.studentId,
    isActive: req.user.isActive,
    isEmailVerified: req.user.isEmailVerified
  }
});


} catch (error) {
console.error('Profile update error:', error.message);


return res.status(500).json({
  message: 'Could not update profile.'
});


}
};

// Change the authenticated user's password.
const updatePassword = async (req, res) => {
try {
const { currentPassword, newPassword } = req.body;


const user = await User.findById(req.user._id);

if (!user || !(await user.matchPassword(currentPassword))) {
  return res.status(400).json({
    message: 'Current password is incorrect'
  });
}

user.password = newPassword;
await user.save();

await Log.create({
  user: user._id,
  action: 'change_password',
  details: 'Password changed',
  ip: req.ip
});

return res.json({
  message: 'Password updated successfully'
});


} catch (error) {
console.error('Password update error:', error.message);


return res.status(500).json({
  message: 'Could not update password.'
});


}
};

module.exports = {
registerUser,
verifyEmail,
loginUser,
getProfile,
updateProfile,
updatePassword
}

