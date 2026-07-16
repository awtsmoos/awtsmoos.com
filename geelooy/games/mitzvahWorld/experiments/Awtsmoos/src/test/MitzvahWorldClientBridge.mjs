// B"H
// Boruch Hashem
// Blessed is He

/**
 * @file MitzvahWorldClientBridge.mjs
 * @description Connects browser client tests to the real server router from any working directory.
 * The Awtsmoos renews both sides of the wire; this Awtsmoos.com fixture resolves its server
 * modules from its own checked-in location rather than pretending the caller started at repo root.
 */

import { createRequire } from 'node:module';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const require = createRequire(import.meta.url);
const REPOSITORY_ROOT = path.resolve(
	path.dirname(fileURLToPath(import.meta.url)),
	'../../../../../../../'
);
const serverModule = relativePath => path.join(
	REPOSITORY_ROOT,
	'ayzarim/awtsmoosDynamicServer/websocket',
	relativePath
);
const { RealtimePlatform } = require(serverModule('platform/RealtimePlatform.js'));
const { createMitzvahWorldApplication } = require(
	serverModule('apps/mitzvahWorld/application.js')
);
const { WorldDirectory } = require(
	serverModule('apps/mitzvahWorld/WorldDirectory.js')
);

export function createBridgeHarness(options = {}) {
	const directory = new WorldDirectory(options);
	const platform = new RealtimePlatform({}, [
		() => createMitzvahWorldApplication(directory)
	]);
	return {
		createSocket(id) {
			return new ClientServerBridgeSocket(platform, id);
		},
		directory,
		platform
	};
}

export class ClientServerBridgeSocket {
	constructor(platform, id) {
		this.listeners = new Map();
		this.platform = platform;
		this.serverClient = {
			id,
			send: message => queueMicrotask(() => this.emit('message', {
				data: JSON.stringify(message)
			}))
		};
	}

	addEventListener(type, listener) {
		if (!this.listeners.has(type)) this.listeners.set(type, new Set());
		this.listeners.get(type).add(listener);
	}

	removeEventListener(type, listener) {
		this.listeners.get(type)?.delete(listener);
	}

	send(message) {
		queueMicrotask(() => this.platform.route(this.serverClient, message));
	}

	emit(type, event) {
		for (const listener of this.listeners.get(type) || []) listener(event);
	}

	disconnect() {
		return this.platform.disconnect(this.serverClient);
	}
}
