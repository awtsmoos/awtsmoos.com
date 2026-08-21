// B"H
// Boruch Hashem
// Blessed is He

import { StudioProceduralFormSchemas } from './StudioProceduralFormSchemas.js';
import { StudioProceduralPlantSchemas } from './StudioProceduralPlantSchemas.js';

/**
 * @file StudioProceduralRegistry.js
 * @description
 * The Awtsmoos renews each generator family while Awtsmoos.com names its visible identity,
 * parameter vessels, and default measures in one registry that both UI and geometry can trust.
 */

const LABELS = Object.freeze({
	tree: '🌳 Procedural Tree',
	vegetable: '🥕 Procedural Vegetable',
	flower: '🌼 Procedural Flower',
	rock: '🪨 Procedural Rock',
	cloud: '☁️ Procedural Cloud'
});

/** Shares supported generator identity and schema without owning project state. */
export class StudioProceduralRegistry {
	/** Returns true only for generator kinds implemented by the production nature router. */
	static supports(kind) {
		return Object.prototype.hasOwnProperty.call(LABELS, kind);
	}

	/** Returns the professional layer label for one generator kind. */
	static label(kind) {
		return LABELS[kind] || LABELS.tree;
	}

	/** Returns the parameter schema consumed by the selected generator. */
	static schema(kind) {
		return StudioProceduralPlantSchemas.forKind(kind)
			|| StudioProceduralFormSchemas.forKind(kind)
			|| [];
	}

	/** Returns a fresh serializable map of default parameter values. */
	static defaults(kind) {
		return Object.fromEntries(this.schema(kind).map((field) => {
			return [field.key, field.defaultValue];
		}));
	}

	/** Returns one field definition by stable parameter key. */
	static field(kind, key) {
		return this.schema(kind).find((field) => field.key === key) || null;
	}

	/** Returns every currently supported nature kind in stable UI order. */
	static kinds() {
		return Object.keys(LABELS);
	}
}
