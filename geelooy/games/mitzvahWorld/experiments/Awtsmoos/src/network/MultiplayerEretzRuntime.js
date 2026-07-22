// B"H
// Boruch Hashem
// Blessed is He

/**
 * @file MultiplayerEretzRuntime.js
 * @description Returns the playable village before realtime authority finishes connecting.
 * The Awtsmoos lets the traveler enter while the wire seeks its companion; Awtsmoos.com
 * imports remote population rendering only after connection truth has been established.
 */

import { createMultiplayerConnection } from './MultiplayerConnectionFactory.js';
import { MultiplayerStatusBadge } from './MultiplayerStatusBadge.js';
import { runtimePlayerSnapshot } from './RuntimePlayerSnapshot.js';

const STATUS_REFRESH_SECONDS = 0.25;

export class MultiplayerEretzRuntime {
	constructor(options = {}) {
		this.runtime = options.runtime;
		this.url = options.url;
		this.displayName = options.displayName || 'Mountain Shliach';
		this.worldId = options.worldId || 'main-village';
		this.WebSocketClass = options.WebSocketClass;
		this.location = options.location || globalThis.location;
		this.localOptions = options.localOptions;
		this.serverOptions = options.serverOptions;
		this.createConnection = options.connectionFactory || createMultiplayerConnection;
		this.statusRoot = options.statusRoot || globalThis.document?.body;
		this.connection = null;
		this.client = null;
		this.bridge = null;
		this.statusBadge = null;
		this.statusElapsed = 0;
		this.transport = 'unknown';
		this.error = null;
	}

	async start() {
		this.stopBridgeAndConnection();
		this.ensureStatusBadge();
		this.error = null;
		this.statusElapsed = 0;
		this.refreshStatus('connecting');
		try {
			this.connection = await this.createConnection({
				WebSocketClass: this.WebSocketClass,
				localOptions: this.localOptions,
				location: this.location,
				serverOptions: this.serverOptions,
				url: this.url
			});
			this.transport = this.connection.transport || 'websocket';
			this.refreshStatus('connecting');
			this.client = await this.connection.start(
				this.displayName,
				this.worldId,
				runtimePlayerSnapshot(this.runtime)
			);
			const { AuthoritativeMultiplayerBridge } = await import(
				'./AuthoritativeMultiplayerBridge.js?v=20260722-stream-02'
			);
			this.bridge = new AuthoritativeMultiplayerBridge({
				client: this.client,
				runtime: this.runtime,
				transport: this.transport
			});
			const session = this.bridge.start();
			this.refreshStatus();
			return session;
		} catch (error) {
			this.error = error;
			console.warn('[MitzvahWorld] Multiplayer offline; continuing locally.', error);
			this.stopBridgeAndConnection();
			this.refreshStatus('error');
			return null;
		}
	}

	update(deltaSeconds) {
		this.bridge?.update(deltaSeconds);
		this.statusElapsed += deltaSeconds;
		if (this.statusElapsed < STATUS_REFRESH_SECONDS) return;
		this.statusElapsed %= STATUS_REFRESH_SECONDS;
		this.refreshStatus();
	}

	stop() {
		this.stopBridgeAndConnection();
		this.refreshStatus('stopped');
	}

	stopBridgeAndConnection() {
		this.bridge?.stop?.();
		this.bridge = null;
		this.connection?.stop?.();
		this.connection = null;
		this.client = null;
	}

	diagnostics() {
		const status = this.statusSnapshot();
		return {
			...status,
			badge: this.statusBadge?.snapshot?.() || null,
			bridge: this.bridge?.diagnostics?.() || null,
			playerAddress: this.client?.playerAddress || null,
			playerId: this.client?.playerId || null,
			players: this.client?.world?.players?.length || 0,
			worldId: this.worldId
		};
	}

	statusSnapshot(forcedState = null) {
		const players = this.client?.world?.players || [];
		return {
			error: this.error?.message || null,
			mode: 'multiplayer',
			peerCount: Math.max(0, players.length - (this.client?.playerId ? 1 : 0)),
			state: forcedState || this.connection?.state || (this.error ? 'error' : 'idle'),
			transport: this.transport
		};
	}

	ensureStatusBadge() {
		if (!this.statusBadge) this.statusBadge = new MultiplayerStatusBadge(this.statusRoot);
	}

	refreshStatus(forcedState = null) {
		this.statusBadge?.setStatus(this.statusSnapshot(forcedState));
	}
}

export async function createMultiplayerEretzRuntime(hosts, options = {}) {
	const runtimeFactory = options.runtimeFactory
		|| (await import('../app/createEretzRuntime.js?v=20260722-stream-02')).createEretzRuntime;
	const runtimeOptions = { ...options };
	delete runtimeOptions.runtimeFactory;
	options.onProgress?.({ message: 'Building the playable shared village…', progress: 0.1 });
	const diagnostics = await runtimeFactory(hosts, runtimeOptions);
	const runtime = diagnostics.runtime;
	if (!runtime) throw new Error('Multiplayer runtime requires diagnostics.runtime.');
	const multiplayer = new MultiplayerEretzRuntime({ ...options, runtime });
	runtime.multiplayerBridge = multiplayer;
	diagnostics.multiplayer = multiplayer;
	diagnostics.multiplayerDiagnostics = () => multiplayer.diagnostics();
	diagnostics.multiplayerSession = null;
	diagnostics.sessionMode = 'multiplayer-connecting';
	diagnostics.multiplayerReady = multiplayer.start().then(session => {
		diagnostics.multiplayerSession = session;
		diagnostics.sessionMode = session ? 'multiplayer' : 'multiplayer-offline';
		return session;
	});
	options.onProgress?.({ message: 'World ready; realtime is connecting in the background…', progress: 1 });
	return diagnostics;
}

export default createMultiplayerEretzRuntime;
