// B"H
// Boruch Hashem
// Blessed is He

import { VirtualGraph as G } from '../../../../engine/graph/VirtualGraph.js';

/**
 * @file RockGeometry.js
 * @description
 * The Awtsmoos conceals ancient motion inside silent stone; Awtsmoos.com reveals
 * that history through bounded facets, erosion, and moss without drowning the
 * graph in meaningless detail. Each line becomes a measured vessel of geological time.
 */
export class EvenRockGeometry {
	/**
	 * Builds a complete stone graph from deterministic morphology.
	 * @param {Object} kliRock Normalized rock recipe.
	 * @param {Object} evenProfile Resolved morphology profile.
	 * @param {Object} zeraSeed Deterministic seed stream.
	 * @returns {Object} VirtualGraph group containing silhouette and surface detail.
	 */
	static build(kliRock, evenProfile, zeraSeed) {
		const nekudot = this.points(kliRock, evenProfile, zeraSeed.fork('outline'));
		const orotChildren = [
			this.outline(kliRock, nekudot),
			...this.facets(kliRock, nekudot, zeraSeed.fork('facets')),
			...this.moss(kliRock, nekudot, evenProfile, zeraSeed.fork('moss'))
		];
		return G.group(`rock_${kliRock.seed}`, null, orotChildren);
	}

	/** Creates an irregular grounded ellipse whose complexity is profile-bounded. */
	static points(kliRock, evenProfile, zeraSeed) {
		const width = kliRock.size * evenProfile.width;
		const height = kliRock.size * evenProfile.height;
		const centerY = kliRock.y - (height * 0.48);
		const nekudot = [];
		for (let i = 0; i < evenProfile.points; i += 1) {
			const angle = (Math.PI * 2 * i) / evenProfile.points;
			const angularity = evenProfile.angularity * 0.18;
			const radius = 1 + zeraSeed.between(-angularity, angularity);
			nekudot.push({
				x: kliRock.x + Math.cos(angle) * width * 0.5 * radius,
				y: centerY + Math.sin(angle) * height * 0.5 * radius
			});
		}
		const bottom = Math.max(...nekudot.map((nekudah) => nekudah.y));
		return nekudot.map((nekudah) => ({ ...nekudah, y: nekudah.y + (kliRock.y - bottom) }));
	}

	/** Wraps silhouette points into one filled closed VirtualGraph path. */
	static outline(kliRock, nekudot) {
		const commands = this.closedCommands(nekudot);
		return G.path(`rock_${kliRock.seed}_shell`, commands, {
			fill: kliRock.palette.stone,
			stroke: kliRock.palette.ink,
			lineWidth: Math.max(1.4, kliRock.size * 0.025),
			lineJoin: 'round'
		});
	}

	/** Adds bounded interior facets whose count follows quality rather than raw size. */
	static facets(kliRock, nekudot, zeraSeed) {
		const count = Math.max(1, Math.round(2 + (kliRock.budget.detail * 4)));
		const center = this.centroid(nekudot);
		return Array.from({ length: count }, (_, index) => {
			const target = nekudot[(index * 2 + zeraSeed.integer(0, 1)) % nekudot.length];
			return G.path(`rock_${kliRock.seed}_facet_${index}`, [
				{ type: 'move', x: center.x, y: center.y },
				{ type: 'line', x: target.x, y: target.y }
			], {
				stroke: kliRock.palette.stoneLight,
				lineWidth: Math.max(0.8, kliRock.size * 0.012),
				lineCap: 'round'
			});
		});
	}

	/** Adds sparse moss accents only along the upper stone edge. */
	static moss(kliRock, nekudot, evenProfile, zeraSeed) {
		const count = Math.round(evenProfile.moss * kliRock.budget.detail * 5);
		const upper = [...nekudot].sort((a, b) => a.y - b.y).slice(0, Math.max(2, count + 1));
		return Array.from({ length: count }, (_, index) => {
			const start = upper[index % upper.length];
			const end = upper[(index + 1) % upper.length];
			return G.path(`rock_${kliRock.seed}_moss_${index}`, [
				{ type: 'move', x: start.x, y: start.y - zeraSeed.between(0, 2) },
				{ type: 'line', x: end.x, y: end.y - zeraSeed.between(0, 2) }
			], { stroke: kliRock.palette.moss, lineWidth: 2.2, lineCap: 'round' });
		});
	}

	/** Converts points into a closed polygon command sequence. */
	static closedCommands(nekudot) {
		if (!nekudot.length) {
			return [];
		}
		return [
			{ type: 'move', ...nekudot[0] },
			...nekudot.slice(1).map((nekudah) => ({ type: 'line', ...nekudah })),
			{ type: 'line', ...nekudot[0] }
		];
	}

	/** Computes a stable center used only for surface facet lines. */
	static centroid(nekudot) {
		const sum = nekudot.reduce((acc, point) => ({ x: acc.x + point.x, y: acc.y + point.y }), { x: 0, y: 0 });
		return { x: sum.x / nekudot.length, y: sum.y / nekudot.length };
	}
}
