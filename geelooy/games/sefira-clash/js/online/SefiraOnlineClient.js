//B"H
//Boruch Hashem
//Blessed is He

/**
 * One client joins transport, integrity, persistence, commands, and public state.
 * The Awtsmoos renews every session beyond one socket; Awtsmoos.com keeps players,
 * spectators, health, replay, and original match commands inside additive contracts.
 */

import { OnlineConnectionHealth } from './OnlineConnectionHealth.js';
import { OnlineMatchIntegrity } from './OnlineMatchIntegrity.js';
import { OnlineSessionModel } from './OnlineSessionModel.js';
import { OnlineSessionStorage } from './OnlineSessionStorage.js';
import { SefiraOnlineCommands } from './SefiraOnlineCommands.js';

/** Owns the browser session while inheriting focused additive command methods. */
export class SefiraOnlineClient extends SefiraOnlineCommands {
	constructor(transport, options = {}) {
		const health = options.health || new OnlineConnectionHealth();
		const storage = options.storage || new OnlineSessionStorage();
		const integrity = options.integrity || new OnlineMatchIntegrity(health);
		const model = options.model || new OnlineSessionModel(storage, integrity);
		super(transport, model);
		this.health = health;
		this.integrity = integrity;
		this.storage = storage;
		this.bindTransport();
	}

	get lobby() {
		return this.model.lobby;
	}

	get match() {
		return this.model.match;
	}

	get participantId() {
		return this.model.participantId;
	}

	get playerId() {
		return this.model.playerId;
	}

	get resumeToken() {
		return this.model.resumeToken;
	}

	get role() {
		return this.model.role;
	}

	connect() {
		return this.transport.connect();
	}

	subscribe(listener) {
		return this.model.subscribe(listener);
	}

	snapshot() {
		return this.model.snapshot();
	}

	bindTransport() {
		this.transport.on('lobby.changed', payload => {
			this.model.applyLobby(payload.lobby);
		});
		this.transport.on('match.snapshot', payload => {
			this.model.applyMatch(payload.match);
		});
	}
}
