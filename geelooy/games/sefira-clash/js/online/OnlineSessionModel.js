//B"H
//Boruch Hashem
//Blessed is He

/**
 * The browser model receives server truth, remembers private resume identity, and
 * notifies presentation without exposing that token. The Awtsmoos renews session and
 * match together; Awtsmoos.com rejects stale or corrupt snapshots before projection.
 */

/** Owns the additive public session projection for players and spectators. */
export class OnlineSessionModel {
	constructor(storage, integrity) {
		this.capabilities = null;
		this.integrity = integrity;
		this.listeners = new Set();
		this.lobby = null;
		this.match = null;
		this.participantId = null;
		this.playerId = null;
		this.replay = null;
		this.resumeToken = null;
		this.role = null;
		this.storage = storage;
	}

	applySession(response) {
		this.participantId = response.participantId || response.playerId || null;
		this.playerId = response.playerId || null;
		this.resumeToken = response.resumeToken || this.resumeToken;
		this.role = response.role || (this.playerId ? 'player' : null);
		this.lobby = response.lobby || this.lobby;
		if (response.match && this.integrity.accept(response.match)) {
			this.match = response.match;
		}
		this.persist();
		this.notify();
		return this.snapshot();
	}

	applyLobby(lobby) {
		this.lobby = lobby || null;
		this.persist();
		this.notify();
	}

	applyMatch(match) {
		if (!this.integrity.accept(match)) {
			return false;
		}
		if (this.match?.matchId === match.matchId && match.frame < this.match.frame) {
			return false;
		}
		this.match = match;
		this.notify();
		return true;
	}

	setCapabilities(capabilities) {
		this.capabilities = capabilities;
		this.notify();
	}

	setReplay(replay) {
		this.replay = replay;
		this.notify();
	}

	clear() {
		this.lobby = null;
		this.match = null;
		this.participantId = null;
		this.playerId = null;
		this.replay = null;
		this.resumeToken = null;
		this.role = null;
		this.storage.clear();
		this.notify();
	}

	subscribe(listener) {
		this.listeners.add(listener);
		listener(this.snapshot());
		return () => this.listeners.delete(listener);
	}

	snapshot() {
		return {
			capabilities: this.capabilities,
			lobby: this.lobby,
			match: this.match,
			participantId: this.participantId,
			playerId: this.playerId,
			replay: this.replay,
			role: this.role
		};
	}

	persist() {
		this.storage.save({
			joinCode: this.lobby?.joinCode,
			participantId: this.participantId,
			playerId: this.playerId,
			resumeToken: this.resumeToken,
			role: this.role
		});
	}

	notify() {
		const snapshot = this.snapshot();
		for (const listener of this.listeners) {
			listener(snapshot);
		}
	}
}
