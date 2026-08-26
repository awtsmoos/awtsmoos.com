// B"H
// Boruch Hashem
// Blessed is He

import { VirtualGraph as G } from '../../../../engine/graph/VirtualGraph.js';

/**
 * @file TreeGeometry.js
 * @description
 * The Awtsmoos lifts one rooted point into trunk, branch, crown, fruit, and sway;
 * Awtsmoos.com reveals species through bounded native graph geometry, so greater
 * realism arrives as coherent morphology rather than an uncontrolled forest of nodes.
 */
export class EtzTreeGeometry {
	/**
	 * Builds one complete tree in local coordinates beneath a world-positioned group.
	 * @param {Object} kliEtz Normalized tree recipe.
	 * @param {Object} etzProfile Resolved species profile.
	 * @param {Object} zeraSeed Deterministic seed stream.
	 * @param {number} zman Runtime animation time.
	 * @returns {Object} Native VirtualGraph tree group.
	 */
	static build(kliEtz, etzProfile, zeraSeed, zman = 0) {
		const gevurahHeight = kliEtz.size * etzProfile.height;
		const orot = [
			this.trunk(kliEtz, etzProfile, gevurahHeight),
			...this.branches(kliEtz, etzProfile, gevurahHeight, zeraSeed.fork('branches')),
			...this.crown(kliEtz, etzProfile, gevurahHeight, zeraSeed.fork('crown'), zman),
			...this.fruit(kliEtz, etzProfile, gevurahHeight, zeraSeed.fork('fruit'), zman)
		];
		return G.group(`tree_${kliEtz.seed}`, { x: kliEtz.x, y: kliEtz.y }, orot);
	}

	/** Creates a tapered closed trunk rather than the historical flat rectangle. */
	static trunk(kliEtz, etzProfile, gevurahHeight) {
		const yesodHalf = kliEtz.size * etzProfile.trunk * 0.5;
		const keterHalf = yesodHalf * 0.48;
		return G.path(`tree_${kliEtz.seed}_trunk`, [
			{ type: 'move', x: -yesodHalf, y: 0 },
			{ type: 'line', x: -keterHalf, y: -gevurahHeight },
			{ type: 'line', x: keterHalf, y: -gevurahHeight },
			{ type: 'line', x: yesodHalf, y: 0 },
			{ type: 'line', x: -yesodHalf, y: 0 }
		], {
			fill: kliEtz.palette.bark,
			stroke: kliEtz.palette.ink,
			lineWidth: Math.max(1.2, kliEtz.size * 0.018),
			lineJoin: 'round'
		});
	}

	/** Adds a quality-bounded branch skeleton shaped by species branching and droop. */
	static branches(kliEtz, etzProfile, gevurahHeight, zeraSeed) {
		const gevurahCount = Math.max(2, Math.round(etzProfile.layers * (2 + kliEtz.budget.detail)));
		return Array.from({ length: gevurahCount }, (_, index) => {
			const side = index % 2 === 0 ? -1 : 1;
			const rise = gevurahHeight * zeraSeed.between(0.38, 0.84);
			const reach = kliEtz.size * etzProfile.crownWidth * zeraSeed.between(0.25, 0.56);
			const droop = reach * etzProfile.droop * zeraSeed.between(0.2, 0.7);
			return G.path(`tree_${kliEtz.seed}_branch_${index}`, [
				{ type: 'move', x: 0, y: -rise },
				{ type: 'line', x: side * reach, y: -rise - reach * 0.45 + droop }
			], {
				stroke: kliEtz.palette.bark,
				lineWidth: Math.max(1, kliEtz.size * zeraSeed.between(0.018, 0.035)),
				lineCap: 'round'
			});
		});
	}

	/** Creates a bounded crown of recognizable leaf forms with deterministic wind sway. */
	static crown(kliEtz, etzProfile, gevurahHeight, zeraSeed, zman) {
		const gevurahCount = Math.max(8, Math.round(10 + kliEtz.budget.detail * 24));
		return Array.from({ length: gevurahCount }, (_, index) => {
			const angle = zeraSeed.between(0, Math.PI * 2);
			const radius = Math.sqrt(zeraSeed.next());
			const x = Math.cos(angle) * kliEtz.size * etzProfile.crownWidth * 0.56 * radius;
			const y = -gevurahHeight + Math.sin(angle) * kliEtz.size * etzProfile.crownHeight * 0.48 * radius;
			const scale = zeraSeed.between(0.35, 0.78) * (0.82 + kliEtz.budget.detail * 0.24);
			const sway = Math.sin(zman * 0.0014 + index * 0.61) * kliEtz.wind * 7;
			return this.leaf(kliEtz, index, x, y, scale, angle * 57.2958 + sway);
		});
	}

	/** Draws one reusable closed leaf in local coordinates with a transform. */
	static leaf(kliEtz, index, x, y, scale, rotation) {
		return G.path(`tree_${kliEtz.seed}_leaf_${index}`, [
			{ type: 'move', x: 0, y: 0 },
			{ type: 'bezier', c1x: 8, c1y: -8, c2x: 12, c2y: -22, x: 0, y: -28 },
			{ type: 'bezier', c1x: -12, c1y: -22, c2x: -8, c2y: -8, x: 0, y: 0 }
		], {
			fill: index % 3 === 0 ? kliEtz.palette.leafLight : kliEtz.palette.leaf,
			stroke: kliEtz.palette.ink,
			lineWidth: 0.8,
			transform: { x, y, rotation, scaleX: scale, scaleY: scale }
		});
	}

	/** Adds bounded fruit only for species whose morphology explicitly requests it. */
	static fruit(kliEtz, etzProfile, gevurahHeight, zeraSeed, zman) {
		const gevurahCount = Math.round(etzProfile.fruit * kliEtz.budget.detail * 14);
		return Array.from({ length: gevurahCount }, (_, index) => {
			const angle = zeraSeed.between(0, Math.PI * 2);
			const radius = zeraSeed.between(0.18, 0.52) * kliEtz.size * etzProfile.crownWidth;
			const x = Math.cos(angle) * radius;
			const y = -gevurahHeight + Math.sin(angle) * radius * 0.72 + Math.sin(zman * 0.001 + index) * kliEtz.wind;
			const r = Math.max(2.3, kliEtz.size * zeraSeed.between(0.025, 0.045));
			const points = Array.from({ length: 7 }, (_, side) => {
				const turn = (Math.PI * 2 * side) / 7;
				return { x: x + Math.cos(turn) * r, y: y + Math.sin(turn) * r };
			});
			return G.path(`tree_${kliEtz.seed}_fruit_${index}`, [
				{ type: 'move', ...points[0] },
				...points.slice(1).map((point) => ({ type: 'line', ...point })),
				{ type: 'line', ...points[0] }
			], { fill: kliEtz.palette.flower, stroke: kliEtz.palette.ink, lineWidth: 0.7 });
		});
	}
}
