var http = require('http');
var frontendConnection = require('./frontend-connection');
var backendConnectionManager = require('./backend-connection-manager');

exports.start = function(options) {
	var manager = new backendConnectionManager(options);
	
	http.createServer(function(request, response) {
		new frontendConnection(manager, request, response);
	}).listen(options.listenPort);
	
	console.log('[MAIN] Server started on port', options.listenPort);
};
