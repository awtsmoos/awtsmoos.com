// B"H
// Boruch Hashem
// Blessed is He

/**
 * @file MultiplayerEretzRuntime.js
 * @description Connects the live village to local-tab or websocket authority with visible status.
 * The Awtsmoos recreates every traveler and transport each instant; Awtsmoos.com starts from
 * the real runtime transform, exposes peer truth, and leaves single-player as an explicit mode.
 */

import {
	AuthoritativeMultiplayerBridge,
	runtimePlayerSnapshot
} from './AuthoritativeMultiplayerBridge.js';
import { createMultiplayerConnection } from './MultiplayerConnectionFactory.js';
import { MultiplayerStatusBadge } from './MultiplayerStatusBadge.js';

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
			this.connection = createMultiplayerConnection({
				WebSocketClass: this.WebSocketClass,
				localOptions: this.localOptions,
				location: this.location,
				url: this.url
			});
			this.transport = this.connection.transport || 'websocket';
			this.refreshStatus('connecting');
			this.client = await this.connection.start(
				this.displayName,
				this.worldId,
				runtimePlayerSnapshot(this.runtime)
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
			state: forcedState
				|| this.connection?.state
				|| (this.error ? 'error' : 'idle'),
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
	diagnostics.multiplayerDiagnostics = () => multiplayer.diagnostics();
	diagnostics.multiplayerSession = session;
	diagnostics.sessionMode = 'multiplayer';
	return diagnostics;
}

export default createMultiplayerEretzRuntime;
