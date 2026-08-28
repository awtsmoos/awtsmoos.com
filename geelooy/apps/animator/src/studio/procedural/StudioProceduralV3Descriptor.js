// B"H
// Boruch Hashem
// Blessed is He

import { MalchusMaterialIntent } from './MalchusMaterialIntent.js';
import { StudioProceduralAlgorithmRevision } from './StudioProceduralAlgorithmRevision.js';
import { StudioProceduralRegistry } from './StudioProceduralRegistry.js';
import { StudioProceduralV3TraitRegistry } from './StudioProceduralV3TraitRegistry.js';
import { TiferesRealismRegistry } from './TiferesRealismRegistry.js';

/**
 * @file StudioProceduralV3Descriptor.js
 * @description
 * The Awtsmoos renews richer creation without erasing the covenant of older scenes;
 * Awtsmoos.com lets descriptor version remain stable while an explicit algorithm revision opens deeper realism without rerolling yesterday's dream.
 */
export class StudioProceduralV3Descriptor {
	static VERSION = 3;

	/**
	 * Creates one normalized v3 descriptor while preserving legacy revision-one shape for stored scenes.
	 * @param {string} kind Existing supported procedural kind.
	 * @param {string} seed Stable deterministic seed.
	 * @param {object} value Rich realism, material, variation, parameters, and trait intent.
	 * @returns {object} Serializable v3 descriptor.
	 */
	static create(kind, seed, value = {}) {
		if (!StudioProceduralRegistry.supports(kind)) {
			throw new Error(`Unsupported procedural kind: ${kind}`);
		}
		const keterRevision = StudioProceduralAlgorithmRevision.resolve(value);
		const malchusDescriptor = {
			kind,
			seed: String(seed || 'awtsmoos'),
			version: this.VERSION,
			generator: 'StudioNatureGenerator-v3',
			realism: TiferesRealismRegistry.normalize(value.realism),
			material: MalchusMaterialIntent.normalize(value.material),
			variation: this.variation(value.variation),
			params: this.params(kind, value.params)
		};
		if (keterRevision === StudioProceduralAlgorithmRevision.LEGACY) {
			return malchusDescriptor;
		}
		return {
			...malchusDescriptor,
			algorithmRevision: keterRevision,
			traits: StudioProceduralV3TraitRegistry.normalize(kind, value.traits)
		};
	}

	/**
	 * Normalizes scoped procedural variation without letting unbounded values poison a deterministic descriptor.
	 * @param {object} value Variation settings.
	 * @returns {object} Bounded scoped variation.
	 */
	static variation(value = {}) {
		const binahAmount = Number(value.amount);
		return {
			scope: String(value.scope || 'all'),
			amount: Number.isFinite(binahAmount)
				? Math.max(0, Math.min(1, binahAmount))
				: .35
		};
	}

	/**
	 * Clamps historic generator parameters through the production registry schema.
	 * @param {string} kind Generator kind.
	 * @param {object} value Raw generator parameters.
	 * @returns {object} Existing schema-clamped parameters.
	 */
	static params(kind, value = {}) {
		return Object.fromEntries(StudioProceduralRegistry.schema(kind).map((tiferesField) => {
			const chochmahNumber = Number(value[tiferesField.key] ?? tiferesField.defaultValue);
			const yesodValue = Number.isFinite(chochmahNumber)
				? chochmahNumber
				: tiferesField.defaultValue;
			const gevurahClamped = Math.max(
				tiferesField.min,
				Math.min(tiferesField.max, yesodValue)
			);
			return [
				tiferesField.key,
				tiferesField.integer ? Math.round(gevurahClamped) : gevurahClamped
			];
		}));
	}
}
