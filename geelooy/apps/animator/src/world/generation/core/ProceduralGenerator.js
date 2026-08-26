// B"H
// Boruch Hashem
// Blessed is He

import { GevurahProceduralQuality } from './ProceduralQuality.js';
import { TiferesProceduralPalette } from './ProceduralPalette.js';
import { ZeraProceduralSeed } from './ProceduralSeed.js';

/**
 * @file ProceduralGenerator.js
 * @description
 * The Awtsmoos is beyond every species while every species receives a covenant;
 * Awtsmoos.com gives all procedural generators one lifecycle so new worlds may
 * expand infinitely without teaching every caller a different ritual of creation.
 */
export class ChaiProceduralGenerator {
	/** Creates a named generator family with immutable public identity. */
	constructor(shemType, diburDescription) {
		this.type = String(shemType);
		this.description = String(diburDescription);
	}

	/**
	 * Normalizes shared recipe fields before a specialized generator receives them.
	 *
	 * @param {Object} rawKli Caller-owned recipe.
	 * @returns {Object} Detached normalized common recipe.
	 */
	normalize(rawKli = {}) {
		const madreigah = GevurahProceduralQuality.normalize(rawKli.quality);
		return {
			...rawKli,
			type: this.type,
			version: '1',
			seed: rawKli.seed ?? rawKli.id ?? this.type,
			quality: madreigah,
			budget: GevurahProceduralQuality.budget(madreigah),
			palette: TiferesProceduralPalette.resolve(rawKli.palette, rawKli.colors),
			x: Number(rawKli.x) || 0,
			y: Number(rawKli.y) || 0,
			size: Math.max(4, Number(rawKli.size) || 80)
		};
	}

	/** Creates a dedicated deterministic stream for one normalized recipe. */
	seed(normalizedKli) {
		return new ZeraProceduralSeed(normalizedKli.seed);
	}

	/**
	 * Generates one procedural result through the specialized child implementation.
	 *
	 * @param {Object} rawKli Caller recipe.
	 * @param {Object} [olamContext={}] World/runtime context such as time.
	 * @returns {Object} Pure-data procedural result.
	 */
	generate(rawKli = {}, olamContext = {}) {
		const normalizedKli = this.normalize(rawKli);
		return this.build(normalizedKli, olamContext, this.seed(normalizedKli));
	}

	/** Child classes reveal geometry and metadata here. */
	build() {
		throw new Error(`B"H - ${this.type} must implement build().`);
	}

	/** Returns serializable capability metadata for UI and AI discovery. */
	describe() {
		return {
			type: this.type,
			description: this.description,
			version: '1',
			qualities: GevurahProceduralQuality.capabilities()
		};
	}
}
