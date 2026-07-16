// B"H
// Boruch Hashem
// Blessed is He

/**
 * @file MultiplayerEretzRuntime.js
 * @description Connects the live Eretz runtime to local-tab or websocket authority.
 * The Awtsmoos recreates every traveler and transport each instant; Awtsmoos.com lets
 * localhost tabs share one village while public worlds retain their remote authority.
 */

import { AuthoritativeMultiplayerBridge } from './AuthoritativeMultiplayerBridge.js';
import { createMultiplayerConnection } from './MultiplayerConnectionFactory.js';

export class MultiplayerEretzRuntime {
	constructor(options = {}) {
		this.runtime = options.runtime;
		this.url = options.url;
		this.displayName = options.displayName || 'Mountain Shliach';
		this.worldId = options.worldId || 'main-village';
		this.WebSocketClass = options.WebSocketClass;
		this.location = options.location || globalThis.location;
		this.localOptions = options.localOptions;
		this.connection = null;
		this.client = null;
		this.bridge = null;
		this.transport = 'none';
		this.error = null;
	}

	async start() {
		this.stop();
		try {
			this.connection = createMultiplayerConnection({
				url: this.url,
				WebSocketClass: this.WebSocketClass,
				location: this.location,
				localOptions: this.localOptions
			});
			this.transport = this.connection.transport || 'websocket';
			this.client = await this.connection.start(this.displayName, this.worldId);
			this.bridge = new AuthoritativeMultiplayerBridge({
				client: this.client,
				runtime: this.runtime,
				transport: this.transport
			});
			this.error = null;
			return this.bridge.start();
		} catch (error) {
			this.error = error;
			console.warn('[MitzvahWorld] Multiplayer offline; continuing locally.', error);
			this.stopConnection();
			return null;
		}
	}

	update(deltaSeconds) {
		this.bridge?.update(deltaSeconds);
	}

	stop() {
		this.bridge?.stop?.();
		this.bridge = null;
		this.stopConnection();
	}

	stopConnection() {
		this.connection?.stop?.();
		this.connection = null;
		this.client = null;
	}

	diagnostics() {
		return {
			transport: this.transport,
			state: this.connection?.state || (this.error ? 'error' : 'idle'),
			worldId: this.worldId,
			playerId: this.client?.playerId || null,
			playerAddress: this.client?.playerAddress || null,
			players: this.client?.world?.players?.length || 0,
			bridge: this.bridge?.diagnostics?.() || null,
			error: this.error?.message || null
		};
	}
}

export async function createMultiplayerEretzRuntime(hosts, options = {}) {
	const runtimeFactory = options.runtimeFactory
		|| (await import('../app/createEretzRuntime.js')).createEretzRuntime;
	const runtimeOptions = { ...options };
	delete runtimeOptions.runtimeFactory;
	const diagnostics = await runtimeFactory(hosts, runtimeOptions);
	const runtime = diagnostics.runtime;
	if (!runtime) {
		throw new Error('Multiplayer runtime requires diagnostics.runtime.');
	}
	const multiplayer = new MultiplayerEretzRuntime({
		...options,
		runtime
	});
	runtime.multiplayerBridge = multiplayer;
	const session = await multiplayer.start();
	diagnostics.multiplayer = multiplayer;
	diagnostics.multiplayerSession = session;
	diagnostics.multiplayerDiagnostics = () => multiplayer.diagnostics();
	return diagnostics;
}

export default createMultiplayerEretzRuntime;
