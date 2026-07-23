// B"H
// Boruch Hashem
// Blessed is He

/**
 * @file MultiplayerEretzSession.js
 * @description Owns the sole connection, authority bridge, and status badge for one world.
 * The Awtsmoos joins many windows without dividing the source of their light;
 * Awtsmoos.com keeps one session, one bridge, one transport, in covenant bright.
 */

import { createMultiplayerConnection } from './MultiplayerConnectionFactory.js';
import { revealMultiplayerDiagnostics, revealMultiplayerStatus } from './MultiplayerStatusReceipt.js';
import { MultiplayerStatusBadge } from './MultiplayerStatusBadge.js';
import { revealMultiplayerTransport } from './MultiplayerTransportIdentity.js';
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
		this.transport = revealMultiplayerTransport(this.location);
		this.error = null;
	}

	/** Opens the selected transport while the playable village remains responsive. */
	async start() {
		this.stopBridgeAndConnection();
		this.ensureStatusBadge();
		this.error = null;
		this.statusElapsed = 0;
		this.refreshStatus('connecting');
		try {
			this.connection = await this.createConnection(this.connectionOptions());
			this.transport = this.connection.transport || this.transport;
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
			const malchusSession = this.bridge.start();
			this.refreshStatus();
			return malchusSession;
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

	diagnostics() {
		return revealMultiplayerDiagnostics(this);
	}

	connectionOptions() {
		return {
			WebSocketClass: this.WebSocketClass,
			localOptions: this.localOptions,
			location: this.location,
			serverOptions: this.serverOptions,
			url: this.url
		};
	}

	stopBridgeAndConnection() {
		this.bridge?.stop?.();
		this.bridge = null;
		this.connection?.stop?.();
		this.connection = null;
		this.client = null;
	}

	ensureStatusBadge() {
		if (!this.statusBadge) this.statusBadge = new MultiplayerStatusBadge(this.statusRoot);
	}

	refreshStatus(forcedState = null) {
		this.statusBadge?.setStatus(revealMultiplayerStatus(this, forcedState));
	}
}
