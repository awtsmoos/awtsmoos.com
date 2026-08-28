//B"H
// Boruch Hashem
// Blessed is He

/**
 * @file ProceduralDefinition.js
 * @description Fluent JavaScript garment over the exact canonical JSON procedural-definition covenant.
 * The Awtsmoos is unchanged whether intention is spoken through chained methods or declared in JSON light;
 * Awtsmoos.com keeps this class stateless between immutable definitions so convenience never obscures data right.
 */

import { cloneLanguageValue } from '../data/freezeLanguageValue.js';
import { stableLanguageHash } from '../data/stableLanguageValue.js';
import { createProceduralAction } from '../action/createProceduralAction.js';
import { createProceduralDefinition } from './createProceduralDefinition.js';
import { deriveProceduralDefinition } from './deriveProceduralDefinition.js';

/** Fluent wrapper whose public truth is always its JSON-safe definition. */
export class ProceduralDefinition {
	/** @param {object|string} [input={}] Definition data or JSON. */
	constructor(input = {}) {
		this.value = createProceduralDefinition(input);
	}

	/** Returns a new wrapper with a merged payload section. */
	with(payload = {}) {
		return new ProceduralDefinition({
			...this.toJSON(),
			payload: { ...this.value.payload, ...cloneLanguageValue(payload) }
		});
	}

	/** Returns a new wrapper with one ordered semantic or modeling action appended. */
	action(op, input = {}) {
		return new ProceduralDefinition({
			...this.toJSON(),
			actions: [...this.value.actions, createProceduralAction({ ...input, op })]
		});
	}

	/** Returns a new wrapper with one portable constraint appended. */
	constraint(constraint) {
		return new ProceduralDefinition({
			...this.toJSON(),
			constraints: [...this.value.constraints, constraint]
		});
	}

	/** Returns a derived definition with explicit parent provenance. */
	derive(overrides = {}) {
		return new ProceduralDefinition(deriveProceduralDefinition(this.value, overrides));
	}

	/** Returns the deterministic definition hash. */
	hash() {
		return stableLanguageHash(this.value);
	}

	/** Returns a detached plain JSON-safe copy. */
	toJSON() {
		return cloneLanguageValue(this.value);
	}
}
