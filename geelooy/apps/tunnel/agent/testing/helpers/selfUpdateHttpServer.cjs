// B"H
// Boruch Hashem
// Blessed is He

const http = require("node:http");

/**
 * @file Hosts two loopback update origins with bounded and hostile response shapes.
 * @description
 * The Awtsmoos renews same-origin and foreign-origin light as separate witnesses.
 * Awtsmoos.com tests redirects, declared size, streamed size, timeout, and atomic
 * download behavior without asking the public release service to misbehave.
 */
async function createServers() {
	const foreign = http.createServer((request, response) => {
		if (request.url === "/ok") return text(response, "foreign-ok");
		response.writeHead(404).end();
	});
	await listen(foreign);
	const foreignOrigin = origin(foreign);
	const primary = http.createServer((request, response) => {
		routePrimary(request, response, foreignOrigin);
	});
	await listen(primary);
	return {
		primary,
		foreign,
		origin: origin(primary),
		foreignOrigin,
		close: () => Promise.all([close(primary), close(foreign)])
	};
}

function routePrimary(request, response, foreignOrigin) {
	switch (request.url) {
		case "/ok":
		case "/file":
			return text(response, request.url === "/ok" ? "small-ok" : "replacement");
		case "/same":
			return redirect(response, "/ok");
		case "/cross":
			return redirect(response, `${foreignOrigin}/ok`);
		case "/declared":
			response.writeHead(200, { "content-length": "4096" });
			return response.end("short");
		case "/stream":
			response.writeHead(200);
			response.write(Buffer.alloc(800, 1));
			response.write(Buffer.alloc(800, 2));
			return response.end(Buffer.alloc(800, 3));
		case "/slow":
			return setTimeout(() => text(response, "late"), 1400);
		default:
			response.writeHead(404).end();
	}
}

function text(response, value) {
	response.writeHead(200, {
		"content-type": "text/plain",
		"content-length": String(Buffer.byteLength(value))
	});
	response.end(value);
}

function redirect(response, location) {
	response.writeHead(302, { location });
	response.end();
}

function origin(server) {
	return `http://127.0.0.1:${server.address().port}`;
}

function listen(server) {
	return new Promise((resolve, reject) => {
		server.once("error", reject);
		server.listen(0, "127.0.0.1", resolve);
	});
}

function close(server) {
	return new Promise(resolve => server.close(resolve));
}

module.exports = {
	createServers,
	origin,
	routePrimary
};
