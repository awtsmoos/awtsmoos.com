//B"H
// Boruch Hashem
// Blessed is He

/**
 * @file ProceduralDefinitionAuthoringApi.js
 * @description Gives fluent JavaScript authors the same immutable definitions, raw meshes, actions, generators, and domain envelopes available to direct JSON authors.
 * The Awtsmoos is One whether intention arrives as object, string, chain, species, stone, tree, or city;
 * Awtsmoos.com makes JavaScript a friendly garment over exact data, never a second truth competing for pity.
 */

import { ProceduralActionBuilder } from '../action/ProceduralActionBuilder.js';
import { createProceduralAction } from '../action/createProceduralAction.js';
import { ProceduralDefinition } from '../definition/ProceduralDefinition.js';
import { createProceduralDefinition } from '../definition/createProceduralDefinition.js';
import { deriveProceduralDefinition } from '../definition/deriveProceduralDefinition.js';
import { EditableMeshBuilder } from '../mesh/EditableMeshBuilder.js';

/**
 * Fluent authoring authority for definitions and direct mesh topology.
 * @class
 */
export class ProceduralDefinitionAuthoringApi {
	/**
	 * @param {{generators?: object}} [options={}] Optional named generator registry.
	 */
	constructor(options = {}) {
		this.generators = options.generators || null;
	}

	/** Creates a fluent immutable definition wrapper for any procedural kind. */
	define(kind, input = {}) {
		return new ProceduralDefinition({
			...input,
			kind: String(kind || input.kind || 'generic')
		});
	}

	/** Normalizes plain data, JSON text, or fluent wrappers into canonical immutable JSON data. */
	fromJSON(input) {
		return createProceduralDefinition(input);
	}

	/** Creates a raw editable polygon mesh builder with no primitive-grouping requirement. */
	mesh(input = {}) {
		return new EditableMeshBuilder(input);
	}

	/** Creates one canonical immutable action directly as JSON-safe data. */
	action(op, input = {}) {
		return createProceduralAction({
			...input,
			op
		});
	}

	/** Creates a fluent action builder whose result serializes to the same action contract. */
	actionBuilder(op, input = {}) {
		return new ProceduralActionBuilder(op, input);
	}

	/** Derives one canonical immutable definition with explicit parent provenance. */
	derive(parent, overrides = {}) {
		return deriveProceduralDefinition(parent, overrides);
	}

	/** Generates a definition through a registered named deterministic generator. */
	generate(generatorId, options = {}, context = {}) {
		if (!this.generators || typeof this.generators.generate !== 'function') {
			throw new Error('B"H | No procedural generator registry is configured.');
		}
		return this.generators.generate(generatorId, options, context);
	}

	/** Creates a descriptor-only creature definition without importing creature internals. */
	creature(id, payload = {}) {
		return this.define('creature', {
			id,
			payload
		});
	}

	/** Creates a descriptor-only tree definition without importing tree internals. */
	tree(id, payload = {}) {
		return this.define('tree', {
			id,
			payload
		});
	}

	/** Creates a descriptor-only geological/rock definition. */
	rock(id, payload = {}) {
		return this.define('rock', {
			id,
			payload
		});
	}

	/** Creates a descriptor-only architecture definition. */
	building(id, payload = {}) {
		return this.define('building', {
			id,
			payload
		});
	}

	/** Creates a descriptor-only world definition. */
	world(id, payload = {}) {
		return this.define('world', {
			id,
			payload
		});
	}
}
