var app = require('express')()
  , tokens = require('./tokens');

// Test server
app.post('/valid-token', function(req, res) { 
  res.set('content-type', 'application/json');
  res.send({ token : tokens.valid });
});

app.post('/invalid-token', function(req, res) {
  res.set('content-type', 'application/json');
  res.send({ token : tokens.invalid });
});

app.all('/fail-500', function(req, res) {
  res.status(500);
  res.send('Internal Server Error');
});

module.exports = app;
