var ws = require('ws')
  , http = require('http')

//
//  Mock of Biodome Server for client testing
//
module.exports = function(port, socketListeners, connectedCallback) {
  var listeners = socketListeners || {};
  var server = new http.Server();
  server.socketServer = null;
  server.listen(port, function() {
    server.socketServer = new ws.Server({server : server});
    for (var i in listeners) {
      server.socketServer.on(i, listeners[i]);
    }

    connectedCallback(server);
  });
};
