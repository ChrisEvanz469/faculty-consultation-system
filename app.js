const express = require('express');
const session = require('express-session');
const path = require('path');
require('dotenv').config();

const db = require('./config/db');
const Notification = require('./models/Notification');
const authRoutes = require('./routes/authRoutes');
const facultyRoutes = require('./routes/facultyRoutes');
const consultationRoutes = require('./routes/consultationRoutes');

const app = express();
const PORT = process.env.PORT || 3000;

app.set('view engine', 'ejs');
app.set('views', path.join(__dirname, 'views'));

app.use(express.urlencoded({ extended: true }));
app.use(express.json());
app.use(express.static(path.join(__dirname, 'public')));

app.use(session({
  secret: process.env.SESSION_SECRET || 'faculty_consultation_secret_2026',
  resave: false,
  saveUninitialized: false,
  cookie: { maxAge: 1000 * 60 * 60 * 24 }
}));

// Global Template Middleware (Greeting, Date & Notifications across all pages)
app.use(async (req, res, next) => {
  res.locals.greeting = 'Good Day';
  res.locals.todayFormatted = new Date().toLocaleDateString('en-US', {
    weekday: 'long',
    year: 'numeric',
    month: 'long',
    day: 'numeric'
  });

  if (req.session && req.session.user) {
    try {
      const notifs = await Notification.getByUser(req.session.user.id);
      res.locals.notificationsList = notifs;
      res.locals.unreadNotifCount = notifs.filter(n => !n.is_read).length;
    } catch (err) {
      res.locals.notificationsList = [];
      res.locals.unreadNotifCount = 0;
    }
  } else {
    res.locals.notificationsList = [];
    res.locals.unreadNotifCount = 0;
  }
  next();
});

app.use('/', authRoutes);
app.use('/', facultyRoutes);
app.use('/', consultationRoutes);

app.get('/', (req, res) => res.redirect('/login'));

db.query('SELECT 1')
  .then(() => {
    console.log('Connected to MySQL: faculty_consultation_db');
    app.listen(PORT, () => console.log(`Server running at http://localhost:${PORT}`));
  })
  .catch(err => {
    console.error('Fatal Database Connection Error:', err.message);
    process.exit(1);
  });
