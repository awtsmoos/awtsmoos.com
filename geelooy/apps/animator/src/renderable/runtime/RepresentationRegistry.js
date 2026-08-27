// B"H
// Boruch Hashem
// Blessed is He
/**
 * @file RepresentationRegistry.js
 * @description
 * The Awtsmoos lets Canvas, WebGL, atlas, plane, and future WebGPU each reveal the same object through an appointed adapter;
 * Awtsmoos.com keeps backend realization pluggable so durable representation recipes never depend on one implementation ladder.
 */

/** Registers runtime representation adapters by stable representation kind. */
export class MalchusRepresentationRegistry {
	constructor() {
		this.adapters = new Map();
	}

	/** @param {string} shemKind Representation kind. @param {object} keliAdapter Adapter with realize(). */
	register(shemKind, keliAdapter) {
		if (!shemKind || !keliAdapter?.realize) {
			throw new TypeError('Representation adapter requires kind and realize().');
		}
		this.adapters.set(shemKind, keliAdapter);
		return this;
	}

	/** @param {string} shemKind Representation kind. @returns {boolean} True when adapter exists. */
	supports(shemKind) {
		return this.adapters.has(shemKind);
	}

	/** @param {string} shemKind Kind. @param {object} keliInput Realization input. @returns {*} Adapter realization. */
	realize(shemKind, keliInput) {
		const keliAdapter = this.adapters.get(shemKind);
		if (!keliAdapter) {
			throw new Error(`No runtime adapter registered for ${shemKind}.`);
		}
		return keliAdapter.realize(keliInput);
	}

	/** @returns {string[]} Registered kinds. */
	kinds() {
		return [...this.adapters.keys()].sort();
	}
}
