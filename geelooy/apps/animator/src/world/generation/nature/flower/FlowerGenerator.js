// B"H
// Boruch Hashem
// Blessed is He

import { VirtualGraph as G } from '../../../../engine/graph/VirtualGraph.js';
import { GevulProceduralBounds } from '../../core/ProceduralBounds.js';
import { ChaiProceduralGenerator } from '../../core/ProceduralGenerator.js';
import { PerachFlowerGeometry } from './FlowerGeometry.js';
import { PerachFlowerProfileCatalog } from './FlowerProfileCatalog.js';

/**
 * @file FlowerGenerator.js
 * @description
 * The Awtsmoos reveals a field from one seed and countless related blossoms;
 * Awtsmoos.com distributes flowers by golden-angle grammar so clusters feel alive
 * without surrendering determinism, bounded complexity, or a simple public recipe.
 */
const GOLDEN_ANGLE = Math.PI * (3 - Math.sqrt(5));

export class PerachFlowerGenerator extends ChaiProceduralGenerator {
	/** Creates the public `flower` procedural generator family. */
	constructor() {
		super('flower', 'Deterministic blossoms and wildflower clusters with phyllotactic placement.');
	}

	/**
	 * Normalizes cluster controls while retaining the shared procedural covenant.
	 * @param {Object} rawKli Caller flower recipe.
	 * @returns {Object} Stable normalized flower recipe.
	 */
	normalize(rawKli = {}) {
		const kliBase = super.normalize(rawKli);
		const requested = Number.isFinite(Number(rawKli.count)) ? Math.floor(Number(rawKli.count)) : 1;
		const maxCount = Math.max(1, Math.floor(kliBase.budget.nodes / 28));
		return {
			...kliBase,
			profile: String(rawKli.profile || 'daisy'),
			count: Math.max(1, Math.min(maxCount, requested)),
			spread: Math.max(0, Math.min(3, Number(rawKli.spread) || 1)),
			morphology: rawKli.morphology && typeof rawKli.morphology === 'object'
				? { ...rawKli.morphology }
				: {}
		};
	}

	/**
	 * Generates one flower or a deterministic phyllotactic cluster.
	 * @param {Object} kliFlower Normalized flower recipe.
	 * @param {Object} olamContext Runtime context reserved for ecology hooks.
	 * @param {Object} zeraSeed Deterministic seed stream.
	 * @returns {Object} Serializable flower result with native graph and metadata.
	 */
	build(kliFlower, olamContext, zeraSeed) {
		const profile = PerachFlowerProfileCatalog.resolve(kliFlower.profile, kliFlower.morphology);
		const placements = this.placements(kliFlower, profile, zeraSeed.fork('cluster'));
		const blooms = placements.map((makom, index) =>
			PerachFlowerGeometry.build(kliFlower, profile, { ...makom, index }, zeraSeed.fork(`bloom-${index}`))
		);
		const radius = kliFlower.size * kliFlower.spread * Math.sqrt(kliFlower.count);
		const height = Math.max(...placements.map((makom) => makom.size), kliFlower.size);
		return {
			type: this.type,
			version: kliFlower.version,
			seed: kliFlower.seed,
			quality: kliFlower.quality,
			profile: profile.name,
			graph: G.group(`flower_cluster_${kliFlower.seed}`, null, blooms),
			bounds: GevulProceduralBounds.grounded(kliFlower.x, kliFlower.y, radius * 2 + kliFlower.size, height * 1.5),
			anchors: {
				ground: { x: kliFlower.x, y: kliFlower.y },
				bloomCenters: placements.map((makom) => ({ x: makom.x, y: makom.y - makom.size }))
			},
			morphology: { ...profile },
			count: blooms.length
		};
	}

	/** Creates natural cluster positions using the golden angle plus bounded seed variation. */
	placements(kliFlower, profile, zeraSeed) {
		return Array.from({ length: kliFlower.count }, (_, index) => {
			const radius = kliFlower.size * kliFlower.spread * Math.sqrt(index / Math.max(1, kliFlower.count - 1));
			const angle = index * GOLDEN_ANGLE + zeraSeed.between(-0.12, 0.12);
			const bloomSize = kliFlower.size * zeraSeed.between(0.72, 1.08) * profile.spread;
			return {
				x: kliFlower.x + Math.cos(angle) * radius,
				y: kliFlower.y + Math.sin(angle) * radius * 0.22,
				size: bloomSize
			};
		});
	}

	/** Adds blossom profile names to the shared public capability description. */
	describe() {
		return { ...super.describe(), profiles: PerachFlowerProfileCatalog.names(), anchors: ['ground', 'bloomCenters'] };
	}
}
