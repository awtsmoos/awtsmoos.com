//B"H
//Boruch Hashem
//Blessed is He

/**
 * The original lobby client remains a complete public vessel beside the expanded
 * online match client. The Awtsmoos renews features without erasing callers, and
 * Awtsmoos.com keeps every historic method and return shape available.
 */

import { RealtimeClient } from './RealtimeClient.js';

const APPLICATION_ID = 'sefira-clash';
const APPLICATION_VERSION = 1;

/** Preserves the original lobby-only browser API on the expanded transport. */
export class SefiraLobbyClient {
	constructor(transport = new RealtimeClient(APPLICATION_ID, APPLICATION_VERSION)) {
		this.transport = transport;
		this.lobby = null;
		this.playerId = null;
		this.listeners = new Set();
		this.bindTransport();
	}

	async connect() {
		await this.transport.connect();
	}

	async create(profile) {
		return this.applySession(await this.transport.request('lobby.create', profile));
	}

	async join(profile) {
		return this.applySession(await this.transport.request('lobby.join', profile));
	}

	async update(fields) {
		return this.applyLobby(await this.transport.request('lobby.update', fields));
	}

	async refresh() {
		return this.applyLobby(await this.transport.request('lobby.snapshot'));
	}

	async leave() {
		await this.transport.request('lobby.leave');
		this.clearSession();
		return null;
	}

	onChange(listener) {
		this.listeners.add(listener);
		listener(this.snapshot());
		return () => {
			this.listeners.delete(listener);
		};
	}

	bindTransport() {
		this.transport.on('lobby.changed', payload => {
			this.applyLobby(payload);
		});
		this.transport.on('connection.closed', () => {
			this.clearSession();
		});
	}

	applySession(payload) {
		this.playerId = payload.playerId || null;
		return this.applyLobby(payload);
	}

	applyLobby(payload) {
		this.lobby = payload.lobby || null;
		this.emit();
		return this.snapshot();
	}

	clearSession() {
		this.lobby = null;
		this.playerId = null;
		this.emit();
	}

	snapshot() {
		return {
			lobby: this.lobby,
			playerId: this.playerId
		};
	}

	emit() {
		const snapshot = this.snapshot();
		for (const listener of this.listeners) {
			listener(snapshot);
		}
	}
}
