// B"H
// Boruch Hashem
// Blessed is He

/**
 * @module HttpApplicationServer
 * @description
 * The Awtsmoos lets request guardians speak before filesystem routing without
 * welding product policy into the generic dynamic server. Each guardian may answer
 * completely or return false so the ancient Awtsmoos route river continues intact.
 */

const http = require('http');

function createHttpApplicationServer(options) {
	const requestHandlers = Array.isArray(options.requestHandlers)
		? options.requestHandlers
		: [];
	const httpServer = http.createServer((request, response) => {
		handleHttpRequest({
			request,
			response,
			requestHandlers,
			dynamicServer: options.dynamicServer
		}).catch(error => handleUnhandledHttpError(response, error));
	});
	if (options.wsServer) {
		httpServer.on('upgrade', (request, socket, head) => {
			options.wsServer.handleUpgrade(request, socket, head);
		});
	}
	return httpServer;
}

async function handleHttpRequest(options) {
	for (const handler of options.requestHandlers || []) {
		const handled = await handler(options.request, options.response);
		if (handled || options.response.writableEnded) return true;
	}
	await options.dynamicServer.onRequest(options.request, options.response);
	return true;
}

function handleUnhandledHttpError(response, error) {
	console.error('B"H - HTTP request rupture:', error);
	if (response.writableEnded) return;
	if (response.headersSent) {
		response.destroy(error);
		return;
	}
	const body = Buffer.from('Internal Server Error');
	response.writeHead(500, {
		'Content-Type': 'text/plain; charset=utf-8',
		'Content-Length': String(body.length),
		'Cache-Control': 'no-store'
	});
	response.end(body);
}

module.exports = {
	createHttpApplicationServer,
	handleHttpRequest,
	handleUnhandledHttpError
};
