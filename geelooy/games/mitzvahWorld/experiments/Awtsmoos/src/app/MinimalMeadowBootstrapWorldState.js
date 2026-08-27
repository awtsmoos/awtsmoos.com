// B"H
// Boruch Hashem
// Blessed is He

/**
 * @file MinimalMeadowBootstrapWorldState.js
 * @description Provides small quest, recovery, and streaming vessels before rich world systems upgrade them.
 * The Awtsmoos lets purpose, return, and locality remain truthful at first control;
 * Awtsmoos.com keeps every facade functional, inspectable, replaceable, and free of fabricated progress.
 */

export class MinimalMeadowBootstrapQuestStore {
	constructor(runtime) {
		this.runtime = runtime;
		this.events = [];
		this.listeners = new Set();
		this.unsubscribe = runtime.bus.on('quest:event', event => {
			this.record(event);
		});
	}

	record(event = {}) {
		this.events.push(Object.freeze({ ...event }));
		this.events = this.events.slice(-32);
		return this.publish();
	}

	onChange(listener) {
		this.listeners.add(listener);
		return () => this.listeners.delete(listener);
	}

	publish() {
		const snapshot = this.snapshot();
		for (const listener of this.listeners) listener(snapshot);
		return snapshot;
	}

	snapshot() {
		return Object.freeze({
			bootstrap: true,
			events: Object.freeze([...this.events]),
			ready: true
		});
	}

	destroy() {
		this.unsubscribe?.();
		this.listeners.clear();
	}
}

export class MinimalMeadowBootstrapRecovery {
	constructor(runtime) {
		this.runtime = runtime;
		this.count = 0;
	}

	unstuck() {
		this.count += 1;
		return this.runtime.movementRecovery?.unstuck?.(
			this.runtime.state
		) || false;
	}

	returnCheckpoint() {
		this.count += 1;
		return this.runtime.movementRecovery?.returnToCheckpoint?.(
			this.runtime.state
		) || false;
	}

	diagnostics() {
		return Object.freeze({
			bootstrap: true,
			count: this.count
		});
	}

	destroy() {}
}

export class MinimalMeadowBootstrapStreaming {
	constructor() {
		this.activeCells = new Set(['0:0']);
		this.regionId = 'lower-meadow';
	}

	update(position = {}) {
		const x = Math.floor(Number(position.x || 0) / 64);
		const z = Math.floor(Number(position.z || 0) / 64);
		this.activeCells = new Set([`${x}:${z}`]);
		return this.diagnostics();
	}

	diagnostics() {
		return Object.freeze({
			activeCells: Object.freeze([...this.activeCells]),
			bootstrap: true,
			regionId: this.regionId
		});
	}
}
