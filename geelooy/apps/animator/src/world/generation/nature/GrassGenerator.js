// B"H
// Boruch Hashem
// Blessed is He

import { VirtualGraph as G } from '../../../engine/graph/VirtualGraph.js';
import { GevulProceduralBounds } from '../core/ProceduralBounds.js';
import { ChaiProceduralGenerator } from '../core/ProceduralGenerator.js';

/**
 * @file GrassGenerator.js
 * @description
 * The Awtsmoos renews each blade without making the meadow a burden; Awtsmoos.com
 * gathers grass into seeded clumps with explicit budgets, so wind and variation feel
 * richer while graph size remains bounded enough for editing, animation, and mobile use.
 */
export class GrassGenerator extends ChaiProceduralGenerator {
	/** Creates the public `grass` procedural family. */
	constructor() {
		super('grass', 'Seeded grass clumps with bounded density, wind response, and quality-aware detail.');
	}

	/**
	 * Preserves the historical static API while routing it through the new data core.
	 * @param {number} x Cluster center.
	 * @param {number} y Ground position.
	 * @param {number} count Historical requested clump count.
	 * @param {number} time Animation time in milliseconds.
	 * @param {number|string} seed Deterministic seed.
	 * @returns {Object} Native VirtualGraph group, matching the legacy contract.
	 */
	static generate(x, y, count, time, seed) {
		const tzemach = new GrassGenerator();
		return tzemach.generate({ x, y, count, seed, quality: 'balanced' }, { time }).graph;
	}

	/** Normalizes clump count, size, and wind strength into safe ranges. */
	normalize(rawKli = {}) {
		const kliBase = super.normalize({ size: 28, ...rawKli });
		const requested = Number.isFinite(Number(rawKli.count)) ? Math.ceil(Number(rawKli.count)) : 6;
		const maxClumps = Math.max(1, Math.floor(kliBase.budget.nodes / 9));
		return {
			...kliBase,
			count: Math.max(1, Math.min(maxClumps, requested)),
			spread: Math.max(8, Number(rawKli.spread) || Math.max(32, requested * 8)),
			wind: Math.max(0, Math.min(2, Number(rawKli.wind) || 1))
		};
	}

	/**
	 * Builds a bounded meadow patch from reusable clumps rather than runaway density.
	 * @param {Object} kliGrass Normalized recipe.
	 * @param {Object} olamContext Runtime context containing optional time.
	 * @param {Object} zeraSeed Deterministic seed stream.
	 * @returns {Object} Serializable grass result.
	 */
	build(kliGrass, olamContext, zeraSeed) {
		const time = Number(olamContext.time) || 0;
		const clumps = Array.from({ length: kliGrass.count }, (_, index) =>
			this.clump(kliGrass, index, time, zeraSeed.fork(`clump-${index}`))
		);
		return {
			type: this.type,
			version: kliGrass.version,
			seed: kliGrass.seed,
			quality: kliGrass.quality,
			graph: G.group(`grass_patch_${kliGrass.seed}`, null, clumps),
			bounds: GevulProceduralBounds.grounded(kliGrass.x, kliGrass.y, kliGrass.spread, kliGrass.size * 1.4),
			anchors: { ground: { x: kliGrass.x, y: kliGrass.y } },
			motion: { kind: 'wind', strength: kliGrass.wind },
			count: kliGrass.count
		};
	}

	/** Creates one compact clump whose blades share a local seed and base position. */
	clump(kliGrass, index, time, zeraSeed) {
		const fraction = kliGrass.count <= 1 ? 0.5 : index / (kliGrass.count - 1);
		const baseX = kliGrass.x - (kliGrass.spread * 0.5) + (fraction * kliGrass.spread);
		const baseY = kliGrass.y + zeraSeed.between(-2, 2);
		const bladeCount = Math.max(3, Math.round(3 + kliGrass.budget.detail * 5));
		const blades = Array.from({ length: bladeCount }, (_, bladeIndex) =>
			this.blade(kliGrass, index, bladeIndex, baseX, baseY, time, zeraSeed)
		);
		return G.group(`grass_${kliGrass.seed}_clump_${index}`, null, blades);
	}

	/** Draws one wind-responsive blade with bounded height, tilt, and stroke weight. */
	blade(kliGrass, clumpIndex, bladeIndex, baseX, baseY, time, zeraSeed) {
		const offset = zeraSeed.between(-kliGrass.size * 0.18, kliGrass.size * 0.18);
		const height = kliGrass.size * zeraSeed.between(0.55, 1.25);
		const windWave = Math.sin((time * 0.0018) + clumpIndex * 0.7 + bladeIndex * 0.4);
		const tilt = (windWave * 0.17 * kliGrass.wind) + zeraSeed.between(-0.11, 0.11);
		return G.path(`grass_${kliGrass.seed}_${clumpIndex}_${bladeIndex}`, [
			{ type: 'move', x: baseX + offset, y: baseY },
			{ type: 'line', x: baseX + offset + Math.sin(tilt) * height, y: baseY - Math.cos(tilt) * height }
		], {
			stroke: zeraSeed.next() > 0.42 ? kliGrass.palette.leaf : kliGrass.palette.leafLight,
			lineWidth: Math.max(0.8, kliGrass.size * zeraSeed.between(0.025, 0.055)),
			lineCap: 'round'
		});
	}
}
