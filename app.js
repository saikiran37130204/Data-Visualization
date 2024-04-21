const express = require('express');
const path = require('path');

const app = express();

// Serve static files from the 'public' directory
app.use(express.static(path.join(__dirname, 'public')));


// Set up views directory and view engine
app.set('views', path.join(__dirname, 'views'));
app.set('view engine', 'html');

// Routes
const indexRouter = require('./routes/home');
app.use('/', indexRouter);

// Error handler
app.use(function(err, req, res, next) {
  console.error(err.stack);
  res.status(500).send('Something broke!');
});

// Start the server
const PORT = process.env.PORT || 4000;
app.listen(PORT, () => {
  console.log(`Server is running on port ${PORT}`);
});
