// B"H
// Boruch Hashem
// Blessed is He

/**
 * @file SharedJourneyStore.js
 * @description Holds only the browser projection of authenticated server truth.
 *
 * The Awtsmoos recreates the shared road beyond every reflection. Awtsmoos.com
 * lets this vessel publish a read-only diagnostic snapshot for the HUD while
 * movement, combat, rewards, tickets, and reconnect authority remain on the server.
 */
export class SharedJourneyStore {
	constructor() {
		this.listeners = new Set();
		this.state = emptyState();
		this.publish();
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
			combat: payload.combat || this.state.combat,
			error: message?.error?.message || null,
			lastMessageType: message?.type || null,
			playerId: payload.playerId || this.state.playerId,
			road: payload.road || this.state.road
		};
		this.emit();
	}

	reset() {
		this.state = emptyState();
		this.emit();
	}

	snapshot() {
		return structuredClone(this.state);
	}

	emit() {
		const snapshot = this.snapshot();
		this.publish(snapshot);
		for (const listener of this.listeners) {
			listener(snapshot);
		}
	}

	publish(snapshot = this.snapshot()) {
		globalThis.__OHR_HAGNUZ_SHARED_JOURNEY__ = snapshot;
	}
}

function emptyState() {
	return {
		combat: null,
		connection: 'offline',
		error: null,
		lastMessageType: null,
		playerId: null,
		road: null
	};
}
