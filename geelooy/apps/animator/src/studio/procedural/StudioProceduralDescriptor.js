// B"H
// Boruch Hashem
// Blessed is He

import { StudioProceduralRegistry } from './StudioProceduralRegistry.js';

/**
 * @file StudioProceduralDescriptor.js
 * @description
 * The Awtsmoos renews seed and parameter before generated form can claim persistence;
 * Awtsmoos.com normalizes every modern procedural descriptor so regeneration remains bounded, editable, and consistent.
 */
export class StudioProceduralDescriptor {
	static VERSION = 2;

	/** Creates one modern descriptor from kind, seed, and optional parameter overrides. */
	static create(kind, seed, params = {}) {
		if (!StudioProceduralRegistry.supports(kind)) {
			throw new Error(`Unsupported procedural kind: ${kind}`);
		}
		return {
			kind,
			seed: String(seed || this.newSeed(kind)),
			version: this.VERSION,
			generator: `StudioNatureGenerator-v${this.VERSION}`,
			params: this.params(kind, params)
		};
	}

	/** Returns a normalized modern descriptor, preserving the stored seed by default. */
	static normalize(descriptor) {
		if (!this.isModern(descriptor)) {
			return null;
		}
		return this.create(descriptor.kind, descriptor.seed, descriptor.params || {});
	}

	/** Identifies structured descriptors without upgrading historic boolean flags silently. */
	static isModern(descriptor) {
		return Boolean(
			descriptor
			&& typeof descriptor === 'object'
			&& !Array.isArray(descriptor)
			&& StudioProceduralRegistry.supports(descriptor.kind)
		);
	}

	/** Clamps supported parameters and discards unknown UI keys from the generated contract. */
	static params(kind, values = {}) {
		const defaults = StudioProceduralRegistry.defaults(kind);
		return Object.fromEntries(StudioProceduralRegistry.schema(kind).map((field) => {
			const raw = values[field.key] ?? defaults[field.key];
			let value = Number(raw);
			if (!Number.isFinite(value)) {
				value = field.defaultValue;
			}
			value = Math.max(field.min, Math.min(field.max, value));
			if (field.integer) {
				value = Math.round(value);
			}
			return [field.key, value];
		}));
	}

	/** Generates a fresh stored seed without tying uniqueness to layer count or order. */
	static newSeed(kind = 'nature') {
		const randomId = globalThis.crypto?.randomUUID?.()
			|| `${Date.now()}-${Math.random().toString(36).slice(2, 10)}`;
		return `${kind}:${randomId}`;
	}
}
