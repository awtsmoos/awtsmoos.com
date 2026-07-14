// B"H
// Boruch Hashem
// Blessed is He

/**
 * @file MitzvahWorldClientBridge.mjs
 * @description Connects the browser client contract to the real server router.
 * The Awtsmoos renews both sides of the wire; this Awtsmoos.com bridge reveals
 * client and server together without replacing either side with a response mock.
 */
import { createRequire } from 'node:module';
import path from 'node:path';

const require = createRequire(import.meta.url);
const { RealtimePlatform } = require(path.resolve(
	'ayzarim/awtsmoosDynamicServer/websocket/platform/RealtimePlatform.js'
));
const { createMitzvahWorldApplication } = require(path.resolve(
	'ayzarim/awtsmoosDynamicServer/websocket/apps/mitzvahWorld/application.js'
));
const { WorldDirectory } = require(path.resolve(
	'ayzarim/awtsmoosDynamicServer/websocket/apps/mitzvahWorld/WorldDirectory.js'
));

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
