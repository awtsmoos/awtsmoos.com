// B"H
// Boruch Hashem
// Blessed is He
/**
	* @file MultiplayerEretzSession.js
	* @description Owns one connection, authority bridge, optional shared UI, and truthful lifecycle.
	* The Awtsmoos joins distant windows without delaying the first local step; Awtsmoos.com
	* mounts conversation only after connection and destroys it for offline, stopped, or replaced worlds.
	*/
import { createMultiplayerConnection } from './MultiplayerConnectionFactory.js';
import { MultiplayerOptionalUi } from './MultiplayerOptionalUi.js';
import {
	multiplayerConnectionOptions,
	stopMultiplayerResources
} from './MultiplayerEretzSessionLifecycle.js';
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
		this.environment = options.environment || globalThis;
		this.location = options.location || this.environment.location;
		this.localOptions = options.localOptions;
		this.serverOptions = options.serverOptions;
		this.createConnection = options.connectionFactory || createMultiplayerConnection;
		this.statusRoot = options.statusRoot || this.environment.document?.body;
		this.optionalUi = options.optionalUi || new MultiplayerOptionalUi({
			environment: this.environment
		});
		this.connection = null;
		this.client = null;
		this.bridge = null;
		this.statusBadge = null;
		this.statusElapsed = 0;
		this.transport = revealMultiplayerTransport(this.location);
		this.state = 'idle';
		this.error = null;
	}
	async start() {
		stopMultiplayerResources(this);
		this.ensureStatusBadge();
		this.error = null;
		this.statusElapsed = 0;
		this.refreshStatus('connecting');
		try {
			this.connection = await this.createConnection(multiplayerConnectionOptions(this));
			this.transport = this.connection.transport || this.transport;
			this.refreshStatus('connecting');
			this.client = await this.connection.start(
				this.displayName,
				this.worldId,
				runtimePlayerSnapshot(this.runtime)
			);
			if (!this.client) {
				stopMultiplayerResources(this);
				this.refreshStatus('offline-local');
				return null;
			}
			const { AuthoritativeMultiplayerBridge } = await import(
				'./AuthoritativeMultiplayerBridge.js?v=20260722-stream-02'
			);
			this.bridge = new AuthoritativeMultiplayerBridge({
				client: this.client,
				runtime: this.runtime,
				transport: this.transport
			});
			const session = this.bridge.start();
			this.refreshStatus('connected');
			this.optionalUi.start(this.client, this.transport);
			return session;
		} catch (error) {
			this.error = error;
			this.environment.console?.warn?.(
				'[MitzvahWorld] Multiplayer offline; continuing locally.',
				error
			);
			stopMultiplayerResources(this);
			this.refreshStatus('offline-local');
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
		stopMultiplayerResources(this);
		this.refreshStatus('stopped');
	}
	diagnostics() {
		return {
			...revealMultiplayerDiagnostics(this),
			optionalUi: this.optionalUi.diagnostics()
		};
	}
	ensureStatusBadge() {
		if (!this.statusBadge) this.statusBadge = new MultiplayerStatusBadge(this.statusRoot);
	}
	refreshStatus(forcedState = null) {
		if (forcedState) this.state = forcedState;
		else if (this.connection?.state) this.state = this.connection.state;
		this.statusBadge?.setStatus(revealMultiplayerStatus(this));
	}
}
