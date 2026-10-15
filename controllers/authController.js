const User = require('../models/User');

exports.showLogin = (req, res) => {
  if (req.session && req.session.user) {
    return res.redirect('/dashboard');
  }
  const registered = req.query.registered === 'true';
  res.render('auth/login', { error: null, registered });
};

exports.login = async (req, res) => {
  try {
    const { username, password } = req.body;
    if (!username || !password) {
      return res.render('auth/login', { error: 'Please enter both username and password.', registered: false });
    }

    const user = await User.findByUsername(username);
    if (!user) {
      return res.render('auth/login', { error: 'Invalid username or password.', registered: false });
    }

    const isMatch = await User.verifyPassword(password, user.password_hash);
    if (!isMatch) {
      return res.render('auth/login', { error: 'Invalid username or password.', registered: false });
    }

    req.session.user = {
      id: user.id,
      id_number: user.id_number,
      username: user.username,
      full_name: user.full_name,
      role: user.role,
      department: user.department
    };

    res.redirect('/dashboard');
  } catch (err) {
    console.error('Authentication Error:', err.message);
    res.render('auth/login', { error: 'An unexpected system error occurred.', registered: false });
  }
};

exports.showRegister = (req, res) => {
  if (req.session && req.session.user) {
    return res.redirect('/dashboard');
  }
  res.render('auth/register', { error: null, formData: {} });
};

exports.register = async (req, res) => {
  try {
    const { id_number, full_name, username, email, department, role, password, confirm_password } = req.body;
    const formData = { id_number, full_name, username, email, department, role };

    if (!id_number || !full_name || !username || !email || !role || !password || !confirm_password) {
      return res.render('auth/register', { error: 'Please fill in all required fields.', formData });
    }

    if (password !== confirm_password) {
      return res.render('auth/register', { error: 'Passwords do not match. Please try again.', formData });
    }

    if (password.length < 6) {
      return res.render('auth/register', { error: 'Password must be at least 6 characters long.', formData });
    }

    const existing = await User.checkExisting(username.trim(), email.trim(), id_number.trim());
    if (existing) {
      if (existing.username === username.trim()) {
        return res.render('auth/register', { error: 'Username is already taken.', formData });
      }
      if (existing.email === email.trim()) {
        return res.render('auth/register', { error: 'Email address is already registered.', formData });
      }
      if (existing.id_number === id_number.trim()) {
        return res.render('auth/register', { error: 'ID Number is already registered.', formData });
      }
    }

    await User.create({
      id_number: id_number.trim(),
      username: username.trim().toLowerCase(),
      email: email.trim().toLowerCase(),
      password,
      role: role === 'faculty' ? 'faculty' : 'student',
      full_name: full_name.trim(),
      department: department ? department.trim() : 'College of Computer Studies'
    });

    res.redirect('/login?registered=true');
  } catch (err) {
    console.error('Registration Error:', err.message);
    res.render('auth/register', { error: 'Failed to create account due to a database error.', formData: req.body });
  }
};

exports.logout = (req, res) => {
  req.session.destroy(() => {
    res.redirect('/login');
  });
};
