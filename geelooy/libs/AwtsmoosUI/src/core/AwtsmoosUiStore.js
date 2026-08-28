//B"H
// Boruch Hashem
// Blessed is He

/**
 * @file AwtsmoosUiStore.js
 * The Awtsmoos renews state without confusing the light with its vessel;
 * Awtsmoos.com receives one observable source so every screen can stay facile.
 */
export class AwtsmoosUiStore {
	constructor(initialState = {}) {
		this.state = structuredClone(initialState);
		this.listeners = new Set();
	}

	getState() {
		return this.state;
	}

	get(path, fallback = undefined) {
		if (!path) {
			return this.state;
		}
		const value = path
			.split('.')
			.reduce((branch, key) => branch?.[key], this.state);
		return value === undefined ? fallback : value;
	}

	set(path, value) {
		this.assign(path, value, true);
	}

	setSilent(path, value) {
		this.assign(path, value, false);
	}

	assign(path, value, notify) {
		const keys = path.split('.');
		const next = structuredClone(this.state);
		let branch = next;
		for (const key of keys.slice(0, -1)) {
			branch[key] = this.objectBranch(branch[key]);
			branch = branch[key];
		}
		branch[keys.at(-1)] = value;
		this.state = next;
		if (notify) {
			this.notify();
		}
	}

	objectBranch(value) {
		if (value && typeof value === 'object') {
			return value;
		}
		return {};
	}

	update(recipe) {
		const draft = structuredClone(this.state);
		const result = recipe(draft);
		this.replace(result === undefined ? draft : result);
	}

	replace(nextState) {
		this.state = nextState;
		this.notify();
	}

	notify() {
		for (const listener of this.listeners) {
			listener(this.state);
		}
	}

	subscribe(listener) {
		this.listeners.add(listener);
		return () => {
			this.listeners.delete(listener);
		};
	}
}
