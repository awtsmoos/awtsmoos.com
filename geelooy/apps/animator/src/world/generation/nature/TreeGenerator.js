// B"H
// Boruch Hashem
// Blessed is He

import { GevulProceduralBounds } from '../core/ProceduralBounds.js';
import { ChaiProceduralGenerator } from '../core/ProceduralGenerator.js';
import { EtzTreeGeometry } from './tree/TreeGeometry.js';
import { EtzTreeProfileCatalog } from './tree/TreeProfileCatalog.js';

/**
 * @file TreeGenerator.js
 * @description
 * The Awtsmoos roots one simple recipe into many species of living silhouette;
 * Awtsmoos.com preserves the historical tree doorway while revealing a richer,
 * seeded, quality-aware tree system with semantic anchors and motion metadata.
 */
export class TreeGenerator extends ChaiProceduralGenerator {
	/** Creates the public `tree` procedural generator family. */
	constructor() {
		super('tree', 'Species-driven deterministic trees with bounded crowns, branches, fruit, anchors, and wind.');
	}

	/**
	 * Preserves the historical static generator signature and graph-only return.
	 * @param {number} x World x-position.
	 * @param {number} y Ground y-position.
	 * @param {number} size Historical tree scale.
	 * @param {number} time Animation time in milliseconds.
	 * @param {number|string} seed Deterministic tree seed.
	 * @returns {Object} Native VirtualGraph tree, matching the legacy contract.
	 */
	static generate(x, y, size, time, seed) {
		const etz = new TreeGenerator();
		return etz.generate({
			x,
			y,
			size,
			seed,
			species: 'oak',
			quality: 'balanced'
		}, { time }).graph;
	}

	/**
	 * Normalizes species, wind, and optional bounded morphology overrides.
	 * @param {Object} rawKli Caller-owned tree recipe.
	 * @returns {Object} Stable normalized tree recipe.
	 */
	normalize(rawKli = {}) {
		const kliBase = super.normalize(rawKli);
		return {
			...kliBase,
			species: String(rawKli.species || rawKli.profile || 'oak'),
			wind: Math.max(0, Math.min(2, Number(rawKli.wind) || 0.65)),
			morphology: rawKli.morphology && typeof rawKli.morphology === 'object'
				? { ...rawKli.morphology }
				: {}
		};
	}

	/**
	 * Generates one species-aware tree and its placement/performance metadata.
	 * @param {Object} kliEtz Normalized tree recipe.
	 * @param {Object} olamContext Runtime context containing optional time.
	 * @param {Object} zeraSeed Deterministic seed stream.
	 * @returns {Object} Serializable tree result.
	 */
	build(kliEtz, olamContext, zeraSeed) {
		const etzProfile = EtzTreeProfileCatalog.resolve(kliEtz.species, kliEtz.morphology);
		const gevurahHeight = kliEtz.size * etzProfile.height;
		const gevurahWidth = kliEtz.size * etzProfile.crownWidth * 1.25;
		const keterY = kliEtz.y - gevurahHeight;
		return {
			type: this.type,
			version: kliEtz.version,
			seed: kliEtz.seed,
			quality: kliEtz.quality,
			species: etzProfile.name,
			graph: EtzTreeGeometry.build(kliEtz, etzProfile, zeraSeed, Number(olamContext.time) || 0),
			bounds: GevulProceduralBounds.grounded(
				kliEtz.x,
				kliEtz.y,
				gevurahWidth,
				gevurahHeight + (kliEtz.size * etzProfile.crownHeight * 0.4)
			),
			anchors: {
				root: { x: kliEtz.x, y: kliEtz.y },
				crown: { x: kliEtz.x, y: keterY }
			},
			motion: {
				kind: 'wind',
				strength: kliEtz.wind,
				secondaryLag: 0.18 + etzProfile.droop * 0.32
			},
			morphology: { ...etzProfile },
			material: {
				kind: 'tree',
				palette: { ...kliEtz.palette }
			}
		};
	}

	/** Adds public species and semantic anchors to capability discovery. */
	describe() {
		return {
			...super.describe(),
			species: EtzTreeProfileCatalog.names(),
			anchors: ['root', 'crown'],
			motion: ['wind', 'secondaryLag']
		};
	}
}
