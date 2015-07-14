module.exports = function(backendConnectionManager, frontendRequest, frontendResponse) {
	var self = this;
	var frontendSocket = frontendRequest.socket;
	var frontendKey = frontendSocket.remoteAddress + ':' + frontendSocket.remotePort;
	var TAG = '[FE:' + frontendKey + ']';
	
	console.log(TAG, 'Client connected and requesting', frontendRequest.url);
	
	var backendKey = frontendRequest.url;
	
	this.getKey = function() {
		return frontendKey;
	};
	
	this.writeHead = function() {
		frontendResponse.writeHead.apply(frontendResponse, arguments);
	};
	
	this.write = function() {
		frontendResponse.write.apply(frontendResponse, arguments);
	};
	
	this.end = function() {
		frontendResponse.end();
	};

	// construct
	frontendRequest.socket.addListener('close', function() {
		console.log(TAG, 'Client disconnected');
		backendConnectionManager.deleteFrontend(backendKey, self);
	});
	
	console.log(TAG, 'Adding to clients for backend', backendKey);
	backendConnectionManager.addFrontend(backendKey, self);
};
