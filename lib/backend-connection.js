var http = require('http');

module.exports = function(options, manager, key) {
	var self = this;
	var TAG = '[BE:' + key + ']';
	var frontends = {};
	var response;
	
	function getResponseData() {
		if (!response) {
			console.log(TAG, 'Attempting to read response, but still not connected');
			return;
		}
		
		return {
			statusCode: response.statusCode,
			headers: response.headers
		}
	}
	
	function forEachFrontend(callback) {
		Object.keys(frontends).forEach(function(frontendKey) {
			callback.call(this, frontends[frontendKey]);
		});
	}

	function addFrontend(frontend) {
		var frontendKey = frontend.getKey();
		
		if (frontendKey in frontends) {
			return;
		}
		
		frontends[frontendKey] = frontend;
	}
	
	function deleteFrontend(frontend) {
		var frontendKey = frontend.getKey();
		
		console.log(TAG, 'Disconnecting frontend', frontendKey);
		
		frontend.end();
		
		if (!(frontendKey in frontends)) {
			return;
		}
		
		delete frontends[frontendKey];
		
		if (Object.keys(frontends).length === 0) {
			console.log(TAG, 'No clients remaining, removing connection');
			selfDestruct();
		}
	}
	
	function disconnect() {
		if (!response) {
			console.log(TAG, 'Attempting to disconnect, but still not connected');
			return;
		}
		
		var socket = response.socket;
		socket.end();
		socket.destroy();
	}
	
	function selfDestruct() {
		manager.deleteBackend(key);
	}

	// construct
	var backendRequest = http.get({
		host: options.backendHost,
		port: options.backendPort,
		path: options.urlMapper(key),
	}, function (backendResponse) {
		console.log(TAG, 'Connection successful');
		
		response = backendResponse;
		
		forEachFrontend(function(frontend) {
			console.log(TAG, 'Sending headers to frontend', frontend.getKey());
			frontend.writeHead(backendResponse.statusCode, backendResponse.headers);
		});
		
		backendResponse.addListener('data', function(chunk) {
			if (options.debug) {
				process.stdout.write('B');
			}
			
			forEachFrontend(function(frontend) {
				if (options.debug) {
					process.stdout.write('F');
				}
				
				frontend.write(chunk, 'binary');
			});
		});
		
		backendResponse.addListener('end', function() {
			console.log(TAG, 'Connection closed, cleaning up');
			forEachFrontend(deleteFrontend);
			selfDestruct();
		});
	});
	
	return {
		getResponseData: getResponseData,
		addFrontend: addFrontend,
		deleteFrontend: deleteFrontend,
		disconnect: disconnect
	}
};
