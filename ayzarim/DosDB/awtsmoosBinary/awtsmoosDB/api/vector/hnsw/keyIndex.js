// B"H

/**
 * @file api/vector/hnsw/keyIndex.js
 * @chapter The Living Graph Remembers Keys Before The Persisted Map Reopens
 * @description Maintains an in-memory key cache while mirroring every update to the persistent key map.
 */

const keyMap = require('./keyMap.js');

class HNSWKeyIndex {
	constructor(handle, registry) {
		this.handle = handle;
		this.registry = registry;
		this.cache = new Map();
		this.hydrated = false;
	}

	set(key, id) {
		const text = String(key);
		this.cache.set(text, Number(id));
		keyMap.set(this.handle, text, Number(id));
	}

	get(key) {
		const text = String(key);
		if (this.cache.has(text)) return this.cache.get(text);
		const persisted = keyMap.get(this.handle, text);
		if (persisted !== undefined && persisted !== null) {
			const id = Number(persisted);
			if (Number.isInteger(id)) this.cache.set(text, id);
			return id;
		}
		this.hydrate();
		return this.cache.get(text);
	}

	entries() {
		this.hydrate();
		return Array.from(this.cache.entries());
	}

	persistedEntries() {
		return keyMap.entries(this.handle);
	}

	remove(key) {
		const text = String(key);
		this.cache.delete(text);
		return keyMap.remove(this.handle, text);
	}

	hydrate() {
		if (this.hydrated) return;
		for (const [key, id] of keyMap.entries(this.handle)) {
			if (Number.isInteger(id)) this.cache.set(key, id);
		}
		if (!this.cache.size) {
			for (let id = 0; id < this.registry.count(); id++) {
				const node = this.registry.getNode(id);
				if (node?.key !== undefined) this.cache.set(String(node.key), id);
			}
		}
		this.hydrated = true;
	}
}

module.exports = HNSWKeyIndex;
