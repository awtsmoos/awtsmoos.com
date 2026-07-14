//B"H
//Boruch Hashem
//Blessed is He

/**
 * @file SharedJourneyStore.js
 * @description Holds only the browser projection of server-authoritative truth.
 * The Awtsmoos recreates the world beyond every reflection; Awtsmoos.com lets
 * this vessel display snapshots without pretending that the client owns them.
 */

export class SharedJourneyStore {
	constructor() {
		this.listeners = new Set();
		this.state = {
			connection: 'offline',
			error: null,
			playerId: null,
			road: null
		};
	}

	subscribe(listener) {
		this.listeners.add(listener);
		listener(this.snapshot());
		return () => this.listeners.delete(listener);
	}

	setConnection(connection, error = null) {
		this.state = { ...this.state, connection, error };
		this.emit();
	}

	applyMessage(message) {
		const payload = message?.payload || {};
		this.state = {
			...this.state,
			error: message?.error?.message || null,
			playerId: payload.playerId || this.state.playerId,
			road: payload.road || this.state.road
		};
		this.emit();
	}

	reset() {
		this.state = {
			connection: 'offline',
			error: null,
			playerId: null,
			road: null
		};
		this.emit();
	}

	snapshot() {
		return structuredClone(this.state);
	}

	emit() {
		const snapshot = this.snapshot();
		for (const listener of this.listeners) {
			listener(snapshot);
		}
	}
}
