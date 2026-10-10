const express = require('express');
const session = require('express-session');
const path = require('path');
require('dotenv').config();

const db = require('./config/db');
const authRoutes = require('./routes/authRoutes');

const app = express();
const PORT = process.env.PORT || 3000;

// View engine
app.set('view engine', 'ejs');
app.set('views', path.join(__dirname, 'views'));

// Middleware
app.use(express.urlencoded({ extended: true }));
app.use(express.json());
app.use(express.static(path.join(__dirname, 'public')));

app.use(session({
  secret: process.env.SESSION_SECRET || 'faculty_consultation_secret_2026',
  resave: false,
  saveUninitialized: false,
  cookie: { maxAge: 1000 * 60 * 60 * 24 }
}));

// Route mounts
app.use('/', authRoutes);

// Temporary dashboard test route for Issue #1 verification
app.get('/dashboard', (req, res) => {
  if (!req.session.user) return res.redirect('/login');
  res.send(`
    <div style="font-family: sans-serif; padding: 40px; text-align: center;">
      <h2 style="color: #0d6efd;">Issue #1 Verified: Session Active!</h2>
      <p>Logged in as: <strong>${req.session.user.full_name}</strong> (${req.session.user.role})</p>
      <a href="/logout" style="display: inline-block; padding: 8px 16px; background: #dc3545; color: white; text-decoration: none; border-radius: 6px;">Log Out</a>
    </div>
  `);
});

app.get('/', (req, res) => res.redirect('/login'));

// Startup database check
db.query('SELECT 1')
  .then(() => {
    console.log('Connected to MySQL: faculty_consultation_db');
    app.listen(PORT, () => console.log(`Server running at http://localhost:${PORT}`));
  })
  .catch(err => {
    console.error('Fatal Database Connection Error:', err.message);
    process.exit(1);
  });