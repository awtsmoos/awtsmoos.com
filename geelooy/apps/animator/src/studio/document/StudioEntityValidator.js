// B"H
// Boruch Hashem
// Blessed is He

import { StudioValidationPrimitives as Check } from './StudioValidationPrimitives.js';

/**
 * @file StudioEntityValidator.js
 * @description
 * The Awtsmoos gives every authored layer a stable identity and measurable form;
 * Awtsmoos.com honors both historic procedural flags and richer deterministic descriptors,
 * so old creative vessels remain valid while new generators receive a stricter norm.
 */
export class StudioEntityValidator {
	static TRANSFORM_FIELDS = ['x', 'y', 'scaleX', 'scaleY', 'rotation', 'opacity'];

	/** Validates one editable entity while allowing extensible properties. */
	static assert(entity, index) {
		Check.object(entity, `entities[${index}]`);
		Check.string(entity.id, `entities[${index}].id`);
		Check.optionalBoolean(entity.visible, `entities[${index}].visible`);
		Check.optionalBoolean(entity.locked, `entities[${index}].locked`);
		this.transform(entity.transform, `entities[${index}].transform`);

		if (entity.properties !== undefined) {
			Check.object(entity.properties, `entities[${index}].properties`);
			this.renderSpec(entity.properties.renderSpec, `entities[${index}].properties.renderSpec`);
			this.procedural(entity.properties.procedural, `entities[${index}].properties.procedural`);
		}
		this.procedural(entity.procedural, `entities[${index}].procedural`);
		return entity;
	}

	/** Validates known transform channels while preserving future channels. */
	static transform(transform, label) {
		if (transform === undefined) {
			return;
		}
		Check.object(transform, label);
		for (const field of this.TRANSFORM_FIELDS) {
			if (transform[field] !== undefined) {
				Check.finite(transform[field], `${label}.${field}`);
			}
		}
	}

	/** Validates render-spec container structure without hardcoding a closed node universe. */
	static renderSpec(renderSpec, label) {
		if (renderSpec === undefined) {
			return;
		}
		Check.object(renderSpec, label);
		if (renderSpec.children !== undefined) {
			Check.array(renderSpec.children, `${label}.children`);
		}
		if (renderSpec.commands !== undefined) {
			Check.array(renderSpec.commands, `${label}.commands`);
		}
	}

	/**
	 * Accepts the repository's historic boolean procedural marker or validates a modern descriptor.
	 * Booleans communicate capability only; object descriptors carry deterministic generation data.
	 */
	static procedural(procedural, label) {
		if (procedural === undefined || typeof procedural === 'boolean') {
			return;
		}
		Check.object(procedural, label);
		if (procedural.kind !== undefined) {
			Check.string(procedural.kind, `${label}.kind`);
		}
		if (procedural.seed !== undefined && typeof procedural.seed !== 'string') {
			Check.finite(procedural.seed, `${label}.seed`);
		}
		if (procedural.params !== undefined) {
			Check.object(procedural.params, `${label}.params`);
		}
		if (procedural.version !== undefined
			&& typeof procedural.version !== 'string'
			&& !Number.isFinite(Number(procedural.version))) {
			throw new Error(`${label}.version must be a string or finite number.`);
		}
	}
}
