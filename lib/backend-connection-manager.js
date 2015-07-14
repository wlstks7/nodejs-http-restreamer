var backendConnection = require('./backend-connection');

module.exports = function(options) {
	var self = this;
	var backends = {};
	
	function createBackend(key) {
		var backend = new backendConnection(options, self, key);
		backends[key] = backend;
		return backend;
	}
	
	function getBackend(key) {
		if (key in backends) {
			return backends[key];
		}
		
		return null;
	}
	
	this.deleteBackend = function(key) {
		var backend = getBackend(key);
		
		if (!backend) {
			return;
		}
		
		backend.disconnect();
		delete backends[key];
	};

	this.addFrontend = function(key, frontend) {
		var backend = getBackend(key);
		
		if (backend) {
			var backendResponseData = backend.getResponseData();
			
			// XXX race condition
			if (backendResponseData) {
				frontend.writeHead(backendResponseData.statusCode, backendResponseData.headers);
			}
		}
		else {
			backend = createBackend(key);
		}
		
		backend.addFrontend(frontend);
	};
	
	this.deleteFrontend = function(key, frontend) {
		var backend = getBackend(key);
		
		if (!backend) {
			return;
		}
		
		backend.deleteFrontend(frontend);
	};
};
