// B"H
// Boruch Hashem
// Blessed is He

import { VirtualGraph as G } from '../../../../engine/graph/VirtualGraph.js';

/**
 * @file FlowerGeometry.js
 * @description
 * The Awtsmoos reveals a blossom as ordered repetition that never becomes dull;
 * Awtsmoos.com turns petals, rings, stems, and cores into native graph data where
 * every bloom can vary while remaining visually related to the whole living field.
 */
export class PerachFlowerGeometry {
	/**
	 * Builds one complete flower from profile, position, size, and deterministic seed.
	 * @param {Object} kliFlower Normalized flower recipe.
	 * @param {Object} perachProfile Resolved blossom profile.
	 * @param {{x:number,y:number,size:number,index:number}} makom Placement record.
	 * @param {Object} zeraSeed Deterministic seed stream.
	 * @returns {Object} Native VirtualGraph flower group.
	 */
	static build(kliFlower, perachProfile, makom, zeraSeed) {
		const topY = makom.y - makom.size;
		const children = [
			this.stem(kliFlower, makom, topY),
			...this.petals(kliFlower, perachProfile, makom, topY, zeraSeed),
			this.core(kliFlower, perachProfile, makom, topY)
		];
		return G.group(`flower_${kliFlower.seed}_${makom.index}`, null, children);
	}

	/** Draws one slightly organic stem from ground anchor to blossom center. */
	static stem(kliFlower, makom, topY) {
		return G.path(`flower_${kliFlower.seed}_${makom.index}_stem`, [
			{ type: 'move', x: makom.x, y: makom.y },
			{ type: 'line', x: makom.x + (makom.size * 0.04), y: topY }
		], {
			stroke: kliFlower.palette.leaf,
			lineWidth: Math.max(1.1, makom.size * 0.055),
			lineCap: 'round'
		});
	}

	/** Builds layered polygon petals around one deterministic center. */
	static petals(kliFlower, perachProfile, makom, topY, zeraSeed) {
		const children = [];
		for (let ring = 0; ring < perachProfile.rings; ring += 1) {
			const count = Math.max(4, Math.round(perachProfile.petals * (1 - ring * 0.18)));
			for (let index = 0; index < count; index += 1) {
				children.push(this.petal(kliFlower, perachProfile, makom, topY, ring, index, count, zeraSeed));
			}
		}
		return children;
	}

	/** Creates one closed petal whose length receives bounded seeded variation. */
	static petal(kliFlower, profile, makom, topY, ring, index, count, zeraSeed) {
		const angle = ((Math.PI * 2 * index) / count) + (ring * 0.21);
		const length = makom.size * 0.32 * profile.length * zeraSeed.between(0.88, 1.12);
		const width = length * profile.width;
		const center = { x: makom.x, y: topY };
		const tip = { x: center.x + Math.cos(angle) * length, y: center.y + Math.sin(angle) * length };
		const normal = { x: -Math.sin(angle) * width, y: Math.cos(angle) * width };
		return G.path(`flower_${kliFlower.seed}_${makom.index}_petal_${ring}_${index}`, [
			{ type: 'move', x: center.x + normal.x, y: center.y + normal.y },
			{ type: 'line', x: tip.x, y: tip.y },
			{ type: 'line', x: center.x - normal.x, y: center.y - normal.y },
			{ type: 'line', x: center.x + normal.x, y: center.y + normal.y }
		], {
			fill: kliFlower.palette.flower,
			stroke: kliFlower.palette.ink,
			lineWidth: Math.max(0.55, makom.size * 0.018),
			lineJoin: 'round'
		});
	}

	/** Creates a small polygon core that remains renderer-agnostic. */
	static core(kliFlower, profile, makom, topY) {
		const radius = makom.size * profile.core * 0.34;
		const points = Array.from({ length: 8 }, (_, index) => {
			const angle = (Math.PI * 2 * index) / 8;
			return { x: makom.x + Math.cos(angle) * radius, y: topY + Math.sin(angle) * radius };
		});
		return G.path(`flower_${kliFlower.seed}_${makom.index}_core`, [
			{ type: 'move', ...points[0] },
			...points.slice(1).map((point) => ({ type: 'line', ...point })),
			{ type: 'line', ...points[0] }
		], { fill: kliFlower.palette.flowerCore, stroke: kliFlower.palette.ink, lineWidth: 0.8 });
	}
}
