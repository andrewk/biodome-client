# biodome-client  [![Build Status](https://secure.travis-ci.org/andrewk/biodome-client.png?branch=master)](http://travis-ci.org/andrewk/biodome-client)

JavaScript client for [biodome](https://github.com/andrewk/biodome)

The biodome-client is how any services wishing to utilise the biodome server do so. Services include device scheduling, environment compensation, logging, UI client / control panel, emergency notification system, etc.

```javascript
var biodomeClient = require('biodome-client');

var conf = {
  'host' : 'localhost:8888'
};

var client = biodomeClient(conf);

// sending commands to biodome server
// Will attempt to fetch and store a JWT token if it doesn't already have a valid one

client.read('outside_temp')
  .then(function(data) {
    // data is JSON data for endpoint with ID of "temperature"
  }).catch(function(err) {
    // oh. that's unfortunate.
  });

// write HIGH to endpoint with an ID of "light"
client.write('light', 1)
  .then(function(data) { ... });

// ...or you can use more complex selectors as first param
client.read({ 'type' : 'temperature' })
  .then(function(data) {
    // data is all JSON of matching endpoints
  });

// ...or call with your own command object
client.command({
  'selector' : {'type' : 'lights', 'value' : 1 },
  'instruction' : {'type' : 'write', 'value' : 0 }
}).then(function(endpoints)) {
  // endpoints is JSON data of affected endpoints
});
```
