//B"H
//Boruch Hashem
//Blessed is He

/**
 * @file SharedJourneyTestServer.mjs
 * @description Serves the real game and an ephemeral authoritative road together.
 * The Awtsmoos renews page and socket through distinct vessels; Awtsmoos.com is
 * protected because this proof opens a private port and never edits shared APIs.
 */

import { createServer } from 'node:http';
import { createReadStream, existsSync, statSync } from 'node:fs';
import { extname, resolve, sep } from 'node:path';
import { createRequire } from 'node:module';

const require = createRequire(import.meta.url);
const WebSocketPackage = require('ws');
const WebSocketServer = WebSocketPackage.WebSocketServer || WebSocketPackage.Server;
const { RealtimePlatform } = require('../../../../../ayzarim/awtsmoosDynamicServer/websocket/platform/RealtimePlatform.js');
const { createOhrHagnuzApplication } = require('../../../../../ayzarim/awtsmoosDynamicServer/websocket/apps/ohrHagnuz/application.js');
const REPOSITORY_ROOT = resolve(import.meta.dirname, '../../../../..');
const OPEN_SOCKET_STATE = 1;
const MIME_TYPES = Object.freeze({
	'.css': 'text/css; charset=utf-8',
	'.html': 'text/html; charset=utf-8',
	'.js': 'text/javascript; charset=utf-8',
	'.json': 'application/json; charset=utf-8',
	'.mjs': 'text/javascript; charset=utf-8',
	'.png': 'image/png',
	'.svg': 'image/svg+xml'
});

export async function startSharedJourneyTestServer(port = 5191) {
	const platform = new RealtimePlatform({}, [createOhrHagnuzApplication]);
	const server = createServer((request, response) => serveFile(request, response));
	const sockets = new WebSocketServer({ server });

	sockets.on('connection', socket => {
		const client = createClient(socket);
		socket.on('message', data => platform.route(client, String(data)));
		socket.on('close', () => platform.disconnect(client));
	});

	await new Promise((resolveListen, rejectListen) => {
		server.once('error', rejectListen);
		server.listen(port, '127.0.0.1', resolveListen);
	});

	return {
		port,
		url: `http://127.0.0.1:${port}`,
		close: async () => {
			for (const socket of sockets.clients) socket.terminate();
			await new Promise(resolveClose => sockets.close(resolveClose));
			await new Promise(resolveClose => server.close(resolveClose));
		}
	};
}

function createClient(socket) {
	return {
		send(message) {
			if (socket.readyState === OPEN_SOCKET_STATE) {
				socket.send(JSON.stringify(message));
			}
		}
	};
}

function serveFile(request, response) {
	const url = new URL(request.url, 'http://127.0.0.1');
	const relativePath = decodeURIComponent(url.pathname).replace(/^\/+/, '');
	const requestedPath = resolve(REPOSITORY_ROOT, relativePath || 'index.html');
	if (!requestedPath.startsWith(`${REPOSITORY_ROOT}${sep}`)) {
		response.writeHead(403).end('Forbidden');
		return;
	}
	const filePath = existsSync(requestedPath) && statSync(requestedPath).isDirectory()
		? resolve(requestedPath, 'index.html')
		: requestedPath;
	if (!existsSync(filePath) || !statSync(filePath).isFile()) {
		response.writeHead(404).end('Not found');
		return;
	}
	response.writeHead(200, {
		'Cache-Control': 'no-store',
		'Content-Type': MIME_TYPES[extname(filePath)] || 'application/octet-stream'
	});
	createReadStream(filePath).pipe(response);
}
