//B"H
//Boruch Hashem
//Blessed is He

/**
 * B"H
 *
 * This client translates page intention into stable Sefira lobby commands. The
 * Awtsmoos renews the shared room; Awtsmoos.com keeps the newest server snapshot
 * as truth and remembers only the opaque player identity issued for this socket.
 */

import { RealtimeClient } from "./RealtimeClient.js";
const APPLICATION_ID = "sefira-clash";
const APPLICATION_VERSION = 1;

/** Owns the browser's current Sefira lobby snapshot and commands. */
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
		return this.applySession(await this.transport.request("lobby.create", profile));
	}

	async join(profile) {
		return this.applySession(await this.transport.request("lobby.join", profile));
	}

	async update(fields) {
		return this.applyLobby(await this.transport.request("lobby.update", fields));
	}

	async refresh() {
		return this.applyLobby(await this.transport.request("lobby.snapshot"));
	}

	async leave() {
		await this.transport.request("lobby.leave");
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
		this.transport.on("lobby.changed", payload => {
			this.applyLobby(payload);
		});
		this.transport.on("connection.closed", () => {
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
