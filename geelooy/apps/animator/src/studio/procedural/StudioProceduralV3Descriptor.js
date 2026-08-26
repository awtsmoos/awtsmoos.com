// B"H
// Boruch Hashem
// Blessed is He

import { MalchusMaterialIntent } from './MalchusMaterialIntent.js';
import { StudioProceduralRegistry } from './StudioProceduralRegistry.js';
import { TiferesRealismRegistry } from './TiferesRealismRegistry.js';

/**
 * @file StudioProceduralV3Descriptor.js
 * @description
 * The Awtsmoos renews richer creation without erasing the covenant of older scenes;
 * Awtsmoos.com gives v3 realism, material, and variation their own data groups while historic generator parameters remain clean.
 */
export class StudioProceduralV3Descriptor {
	static VERSION = 3;

	/**
	 * Creates one normalized v3 descriptor without mutating the historic v2 contract.
	 * @param {string} kind Existing supported procedural kind.
	 * @param {string} seed Stable deterministic seed.
	 * @param {object} value Rich realism, material, variation, and parameter intent.
	 * @returns {object} Serializable v3 descriptor.
	 */
	static create(kind, seed, value = {}) {
		if (!StudioProceduralRegistry.supports(kind)) {
			throw new Error(`Unsupported procedural kind: ${kind}`);
		}
		return {
			kind,
			seed: String(seed || 'awtsmoos'),
			version: this.VERSION,
			generator: 'StudioNatureGenerator-v3',
			realism: TiferesRealismRegistry.normalize(value.realism),
			material: MalchusMaterialIntent.normalize(value.material),
			variation: this.variation(value.variation),
			params: this.params(kind, value.params)
		};
	}

	/** @param {object} value Variation settings. @returns {object} Bounded scoped variation. */
	static variation(value = {}) {
		const binahAmount = Number(value.amount);
		return {
			scope: String(value.scope || 'all'),
			amount: Number.isFinite(binahAmount)
				? Math.max(0, Math.min(1, binahAmount))
				: .35
		};
	}

	/** @param {string} kind Generator kind. @param {object} value Raw generator params. @returns {object} Existing schema-clamped parameters. */
	static params(kind, value = {}) {
		return Object.fromEntries(StudioProceduralRegistry.schema(kind).map((field) => {
			const chochmahNumber = Number(value[field.key] ?? field.defaultValue);
			const yesodValue = Number.isFinite(chochmahNumber)
				? chochmahNumber
				: field.defaultValue;
			const gevurahClamped = Math.max(field.min, Math.min(field.max, yesodValue));
			return [
				field.key,
				field.integer ? Math.round(gevurahClamped) : gevurahClamped
			];
		}));
	}
}
