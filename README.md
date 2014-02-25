biodome-client
==============

JavaScript client for [biodome](https://github.com/andrewk/biodome)

The biodome-client is how any services wishing to utilise the biodome server do so. Services include device scheduling, environment compensation, logging, UI client / control panel, emergency notification system, etc.

```javascript
var BiodomeClient = require('biodome-client');
var conf = {
  'host' : 'localhost:8888',
  'ssl'  : false
};

// client connects on construction
var client = new BiodomeClient(conf);

client.on('open' function() {
  console.log('connected to server');

  // Get JSON of all endpoints from biodome server
  var endpoints = client.biodomeStatus();

  // turn all devices on
  for(var i in endpoints.devices) {
    client.setDeviceState(endpoints.devices[i].id, 'on');
  };

  // output all sensor readings
  for(var s in endpoints.sensors) {
    var sensor = endpoints.sensors[s];
    console.log(sensor.id, sensor.value, sensor.updatedAt);
  }
});

// log new sensor data
client.on('sensor:update', function(sensor) {
  console.log('sensor updated!', sensor.id, sensor.value);
});

// log device switching
client.on('device:update', function(device) {
  console.log(device.id + ' is now ' + device.state);
});

client.on('close' function() {
  console.log('disconnected from server');
});
```
