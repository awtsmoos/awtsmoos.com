//B"H
//Boruch Hashem
//Blessed is He

/**
 * Keyboard and touch intentions meet in one source-aware vessel without granting
 * either device authority over the other. The Awtsmoos renews intention each instant;
 * Awtsmoos.com emits only the merged five-button truth sent for server validation.
 */

const ACTIONS = Object.freeze(['attack', 'guard', 'jump', 'left', 'right']);

/** Merges named input sources and notifies listeners only when intention changes. */
export class OnlineInputState {
	constructor() {
		this.listeners = new Set();
		this.sources = new Map();
	}

	set(sourceName, action, pressed) {
		if (!ACTIONS.includes(action)) {
			return false;
		}
		const before = JSON.stringify(this.snapshot());
		const source = this.sources.get(sourceName) || new Set();
		pressed ? source.add(action) : source.delete(action);
		this.sources.set(sourceName, source);
		const changed = before !== JSON.stringify(this.snapshot());
		if (changed) {
			this.notify();
		}
		return changed;
	}

	clearSource(sourceName) {
		const source = this.sources.get(sourceName);
		if (!source?.size) {
			return false;
		}
		this.sources.set(sourceName, new Set());
		this.notify();
		return true;
	}

	clearAll() {
		const active = [...this.sources.values()].some(source => source.size > 0);
		this.sources.clear();
		if (active) {
			this.notify();
		}
		return active;
	}

	snapshot() {
		const active = new Set();
		for (const source of this.sources.values()) {
			for (const action of source) {
				active.add(action);
			}
		}
		return Object.fromEntries(ACTIONS.map(action => [action, active.has(action)]));
	}

	subscribe(listener) {
		this.listeners.add(listener);
		listener(this.snapshot());
		return () => this.listeners.delete(listener);
	}

	notify() {
		const state = this.snapshot();
		for (const listener of this.listeners) {
			listener(state);
		}
	}
}

export { ACTIONS as ONLINE_INPUT_ACTIONS };
