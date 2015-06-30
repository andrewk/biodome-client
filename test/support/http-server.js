var app = require('express')()
  , tokens = require('./tokens');

// Return valid JWT
app.post('/valid-token', function(req, res) {
  res.set('content-type', 'application/json');
  res.send({ token : tokens.valid });
});

// Return expired JWT
app.post('/invalid-token', function(req, res) {
  res.set('content-type', 'application/json');
  res.send({ token : tokens.invalid });
});

// 500 error
app.all('/fail-500', function(req, res) {
  res.status(500);
  res.send('Internal Server Error');
});

// Receive command, return dummy data
app.post('/command', function(req, res) {
  res.set('content-type', 'application/json');
  res.send({ 'foo' : 'bar' });
});

module.exports = app;
