//B"H
//Boruch Hashem
//Blessed is He

/**
 * @file SharedJourneyTestServer.mjs
 * @description Serves strict tickets, trusted sockets, persistence, and game files.
 * The Awtsmoos renews page, identity, and socket as distinct vessels;
 * Awtsmoos.com proves their covenant on one private ephemeral test origin.
 */

import { createServer } from 'node:http';
import { createRequire } from 'node:module';
import { serveRepositoryFile } from './SharedJourneyStaticFiles.mjs';
import {
	createVerifiedTestClient,
	serveTestTicket
} from './SharedJourneyTestTickets.mjs';

const require = createRequire(import.meta.url);
const WebSocketPackage = require('ws');
const WebSocketServer = WebSocketPackage.WebSocketServer
	|| WebSocketPackage.Server;
const {
	RealtimePlatform
} = require('../../../../../ayzarim/awtsmoosDynamicServer/websocket/platform/RealtimePlatform.js');
const {
	createOhrHagnuzApplication
} = require('../../../../../ayzarim/awtsmoosDynamicServer/websocket/apps/ohrHagnuz/application.js');
const {
	MemoryCharacterRepository
} = require('../../../../../ayzarim/awtsmoosDynamicServer/websocket/apps/ohrHagnuz/persistence/MemoryCharacterRepository.js');
const {
	clearGameTickets
} = require('../../../../api/ohr-hagnuz/auth/GameTicketStore.js');

export async function startSharedJourneyTestServer(port = 0) {
	clearGameTickets();
	const repository = new MemoryCharacterRepository();
	const ticketCounts = new Map();
	const platform = createPlatform(repository);
	const server = createServer((request, response) => {
		serveRequest(request, response, ticketCounts);
	});
	const sockets = new WebSocketServer({ server });
	bindSockets(sockets, platform);
	await listen(server, port);
	const actualPort = Number(server.address()?.port);
	return {
		port: actualPort,
		repository,
		ticketCount(slot) {
			return ticketCounts.get(slot) || 0;
		},
		url: `http://127.0.0.1:${actualPort}`,
		close: () => closeServer(server, sockets)
	};
}

function createPlatform(repository) {
	return new RealtimePlatform({}, [() => createOhrHagnuzApplication({
		repositoryProvider: () => repository
	})]);
}

function bindSockets(sockets, platform) {
	sockets.on('connection', socket => {
		const client = createVerifiedTestClient(socket);
		socket.on('message', data => platform.route(client, String(data)));
		socket.on('close', () => platform.disconnect(client));
	});
}

function serveRequest(request, response, ticketCounts) {
	const url = new URL(request.url, `http://${request.headers.host}`);
	if (url.pathname === '/api/ohr-hagnuz/realtime-ticket') {
		serveTestTicket(url, response, ticketCounts);
		return;
	}
	serveRepositoryFile(request, response);
}

function listen(server, port) {
	return new Promise((resolveListen, rejectListen) => {
		server.once('error', rejectListen);
		server.listen(port, '127.0.0.1', resolveListen);
	});
}

async function closeServer(server, sockets) {
	for (const socket of sockets.clients) socket.terminate();
	await new Promise(resolveClose => sockets.close(resolveClose));
	await new Promise(resolveClose => server.close(resolveClose));
	clearGameTickets();
}
