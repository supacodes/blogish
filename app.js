const path = require('path');

const dotenv = require('dotenv');
const express = require('express');
const morgan = require('morgan');
const helmet = require('helmet');
const hpp = require('hpp');
const rateLimit = require('express-rate-limit');
const mongoSanitize = require('express-mongo-sanitize');
const xss = require('xss-clean');

const viewRoutes = require('./routes/view');
const userRoutes = require('./routes/user');
const postRoutes = require('./routes/post');
const commentRoutes = require('./routes/comment');
const errorHandler = require('./controllers/error');

dotenv.config({
  path: './config.env'
});

const app = express();

// Set view engine
app.set('view engine', 'ejs');

// Set assets/public folder
app.use(express.static(path.join(`${__dirname}/public`)));

app.use(express.json());

// Prevent parameter pollution
app.use(hpp());

// Helmet
app.use(helmet());

if (process.env.NODE_ENV === 'development') {
  // Log dev requests
  app.use(morgan('dev'));
}

// Rate Limiter
const limiter = rateLimit({
  windowMs: 30 * 60 * 1000,
  max: 100
});

app.use(limiter);

// Sanitize mongo data
app.use(mongoSanitize());

// XSS Attacls
app.use(xss());

// Mount app routes
app.use(viewRoutes);
app.use('/api/v1/users', userRoutes);
app.use('/api/v1/post', postRoutes);
app.use('/api/v1/comment', commentRoutes);

// Fallback URL
app.all('*', (req, res, next) => {
  res.status(404).json({
    status: 'fail',
    message: `${req.originalUrl} was not found on this server`
  });
});

// Global Error Handler
app.use(errorHandler);

module.exports = app;
