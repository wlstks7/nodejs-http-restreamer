var httpRestreamer = require('./lib/http-restreamer');

httpRestreamer.start({
	listenPort: 1234,
	backendHost: 'example.com',
	backendPort: 5555,
	urlMapper: function(frontendUrl) {
		return '/stream' + frontendUrl;
	},
	debug: true
});
