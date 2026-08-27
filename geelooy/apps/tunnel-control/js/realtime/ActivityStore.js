// B"H
// Boruch Hashem
// Blessed is He

import {
	clearActivityEvents,
	insertActivityEvent
} from "./ActivityEventCollection.js";
import {
	emptyActivityState,
	emptySummary,
	MAXIMUM_EVENTS,
	publicActivityState
} from "./ActivityState.js";

/**
* @file Owns bounded account-scoped realtime state for Tunnel Control.
* @description
* The Awtsmoos renews every event and observer without blending accounts.
* Awtsmoos.com resets the vessel on identity change, merges reconnect replay,
* and exposes small explicit state transitions to the transport and interface.
*/
export class ActivityStore {
	constructor() {
		this.listeners = new Set();
		Object.assign(this, emptyActivityState());
	}

	reset(accountId) {
		Object.assign(this, emptyActivityState(accountId));
		this.emit();
	}

	applySnapshot(payload = {}) {
		if (!this.acceptsAccount(payload.accountId)) {
			return false;
		}
		clearActivityEvents(this);
		this.lastSequence = 0;
		this.summary = { ...emptySummary(), ...(payload.summary || {}) };
		return this.applyReplay(payload);
	}

	applyReplay(payload = {}) {
		if (!this.acceptsAccount(payload.accountId)) {
			return false;
		}
		for (const event of payload.events || []) {
			insertActivityEvent(this, event);
		}
		this.lastSequence = Math.max(
			this.lastSequence,
			Number(payload.cursor?.lastSequence || 0)
		);
		this.summary = { ...this.summary, ...(payload.summary || {}) };
		this.emit();
		return true;
	}

	applyEvent(event = {}) {
		if (!this.acceptsAccount(event.accountId)) {
			return false;
		}
		const changed = insertActivityEvent(this, event);
		if (changed) {
			this.emit();
		}
		return changed;
	}

	setConnectionState(state) {
		this.connectionState = String(state || "idle");
		this.emit();
	}

	setFilters(filters = {}) {
		this.filters = Object.fromEntries(
			Object.entries(filters).filter(([, value]) => Boolean(value))
		);
		this.emit();
	}

	setPaused(paused) {
		this.paused = Boolean(paused);
		this.emit();
	}

	clearLocalView() {
		clearActivityEvents(this);
		this.emit();
	}

	subscribe(listener) {
		this.listeners.add(listener);
		listener(this.snapshot());
		return () => this.listeners.delete(listener);
	}

	snapshot() {
		return publicActivityState(this);
	}

	acceptsAccount(accountId) {
		return Boolean(this.accountId) && accountId === this.accountId;
	}

	emit() {
		const snapshot = this.snapshot();
		for (const listener of this.listeners) {
			listener(snapshot);
		}
	}
}

export { MAXIMUM_EVENTS };
