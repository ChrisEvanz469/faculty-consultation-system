const User = require('../models/User');

exports.showLogin = (req, res) => {
  if (req.session && req.session.user) {
    return res.redirect('/dashboard');
  }
  res.render('auth/login', { error: null });
};

exports.login = async (req, res) => {
  try {
    const { username, password } = req.body;
    if (!username || !password) {
      return res.render('auth/login', { error: 'Please enter both username and password.' });
    }

    const user = await User.findByUsername(username);
    if (!user) {
      return res.render('auth/login', { error: 'Invalid username or password.' });
    }

    const isMatch = await User.verifyPassword(password, user.password_hash);
    if (!isMatch) {
      return res.render('auth/login', { error: 'Invalid username or password.' });
    }

    // Save session payload
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
    res.render('auth/login', { error: 'An unexpected system error occurred.' });
  }
};

exports.logout = (req, res) => {
  req.session.destroy(() => {
    res.redirect('/login');
  });
};