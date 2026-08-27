//B"H
// Boruch Hashem
// Blessed is He

/**
 * @file ProceduralResourceRegistry.js
 * @description Tracks optional resource requests through pending, ready, failed, and fallback states without making geometry compilation depend on network success.
 * The Awtsmoos is present before remote texture or asset arrives, while Awtsmoos.com keeps resource state explicit and replaceable;
 * procedural truth may continue through a fallback vessel rather than becoming secretly blocked, mutable, or breakable.
 */

import { freezeLanguageValue } from '../data/freezeLanguageValue.js';
import { createResourceDescriptor } from '../descriptor/createResourceDescriptor.js';

/**
 * Runtime registry for portable resource descriptors and explicit lifecycle evidence.
 * @class
 */
export class ProceduralResourceRegistry {
	constructor() {
		this.resources = new Map();
	}

	/** Registers one resource descriptor in pending state unless an initial state is supplied. */
	register(input, options = {}) {
		const descriptor = createResourceDescriptor(input);
		this.resources.set(descriptor.id, {
			descriptor,
			state: String(options.state || 'pending'),
			value: options.value ?? null,
			error: options.error ? String(options.error) : null
		});
		return descriptor;
	}

	/** Marks one resource ready with a caller-owned runtime value. */
	ready(id, value) {
		return this.update(id, 'ready', value, null);
	}

	/** Marks one resource failed while preserving an optional configured fallback. */
	failed(id, error) {
		const entry = this.require(id);
		const state = entry.descriptor.fallback !== null ? 'fallback' : 'failed';
		return this.update(id, state, entry.descriptor.fallback, error);
	}

	/** Returns runtime value/state plus portable descriptor without mutating the registry. */
	get(id) {
		const entry = this.require(id);
		return Object.freeze({
			descriptor: entry.descriptor,
			state: entry.state,
			value: entry.value,
			error: entry.error
		});
	}

	/** Returns JSON-safe lifecycle descriptions without exposing non-serializable runtime values. */
	describe() {
		return freezeLanguageValue([...this.resources.entries()]
			.sort(([left], [right]) => left.localeCompare(right))
			.map(([id, entry]) => ({
				id,
				state: entry.state,
				descriptor: entry.descriptor,
				error: entry.error
			})));
	}

	/** Updates one existing resource entry and returns its public view. */
	update(id, state, value, error) {
		const entry = this.require(id);
		entry.state = state;
		entry.value = value;
		entry.error = error ? String(error) : null;
		return this.get(id);
	}

	/** Resolves one registered resource or throws a structured missing-resource error. */
	require(id) {
		const entry = this.resources.get(String(id));
		if (entry) {
			return entry;
		}
		const error = new Error(`B"H | Unknown procedural resource: ${id}`);
		error.code = 'PROCEDURAL_RESOURCE_NOT_FOUND';
		throw error;
	}
}
