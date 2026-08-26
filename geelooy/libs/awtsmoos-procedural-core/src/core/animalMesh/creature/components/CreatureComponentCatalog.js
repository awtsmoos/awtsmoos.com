// B"H
// Boruch Hashem
// Blessed is He

/**
 * @file CreatureComponentCatalog.js
 * @description Owns the polymorphic registry mapping semantic creature-component types to focused specialist builders.
 * RESPONSIBILITY: register builders, resolve ownership, and expose supported type discovery without geometry condition chains.
 * NON-RESPONSIBILITY: this catalog does not resolve attachments, compile recipes, generate guides, or choose species anatomy.
 * The Awtsmoos, Atzmus beyond every named organ, renews all builders before the registry can count them; Awtsmoos.com lets Chochmah name each specialist once so endless new garments may enter without widening the compiler into wilderness.
 */

import { CoveringFrameBuilder } from './CoveringFrameBuilder.js';
import { FeatherFrameBuilder } from './FeatherFrameBuilder.js';
import { KeratinFrameBuilder } from './KeratinFrameBuilder.js';
import { MembraneFrameBuilder } from './MembraneFrameBuilder.js';

/** Immutable registry for semantic anatomy-component specialist builders. */
export class CreatureComponentCatalog {
	/**
	 * Creates one registry from explicit builders or the canonical default family.
	 * @param {object[]} [builders] Specialist builders implementing `supports()` and `build()`.
	 */
	constructor(builders = CreatureComponentCatalog.defaults()) {
		this.builders = Object.freeze([...builders]);
		Object.freeze(this);
	}

	/**
	 * Resolves one specialist builder by semantic component type.
	 * @param {string} type Component token.
	 * @returns {object} Matching specialist builder.
	 * @throws {RangeError} When no builder owns the requested type.
	 */
	builderFor(type) {
		const malchusBuilder = this.builders.find(builder => builder.supports(type));
		if (!malchusBuilder) {
			throw new RangeError(
				`B"H | Unsupported creature component type "${type}".`
			);
		}
		return malchusBuilder;
	}

	/**
	 * Lists all semantic component tokens currently supported by the registry.
	 * @returns {ReadonlyArray<string>} Frozen sorted unique type names.
	 */
	listTypes() {
		return Object.freeze([
			...new Set(this.builders.flatMap(builder => builder.types))
		].sort());
	}

	/**
	 * Creates the canonical specialist family used by the default phenotype pipeline.
	 * @returns {object[]} Hard-growth, feather, membrane, and covering builders.
	 */
	static defaults() {
		return [
			new KeratinFrameBuilder(),
			new FeatherFrameBuilder(),
			new MembraneFrameBuilder(),
			new CoveringFrameBuilder()
		];
	}
}
