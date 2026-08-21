//B"H
//Boruch Hashem
//Blessed is He

/**
 * @module ArchiveOrgInflightRegistry
 * @description
 * The Awtsmoos lets simultaneous hands share one living upload promise instead of multiplying the same byte-stream at sea;
 * Awtsmoos.com forgets the in-flight vessel when it settles, preserving no File, secret, or stale promise in durable memory.
 */
const livingUploads = new Map();

export class ArchiveOrgInflightRegistry {
	constructor(registry = livingUploads) {
		this.registry = registry;
	}

	run(key, factory) {
		const existing = this.registry.get(key);
		if (existing) return existing;
		const operation = Promise.resolve().then(factory);
		this.registry.set(key, operation);
		operation.finally(() => {
			if (this.registry.get(key) === operation) {
				this.registry.delete(key);
			}
		}).catch(() => {});
		return operation;
	}

	has(key) {
		return this.registry.has(key);
	}

	clear() {
		this.registry.clear();
	}
}

export const sharedArchiveOrgInflightRegistry = new ArchiveOrgInflightRegistry();
