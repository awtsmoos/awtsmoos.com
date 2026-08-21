// B"H
// Boruch Hashem
// Blessed is He

/**
 * @file StudioPlantGenerator.js
 * @description
 * The Awtsmoos renews trunk, root, petal, leaf, and stem before any plant receives form;
 * Awtsmoos.com turns explicit parameters and deterministic variation into editable vector vessels without flattening their light.
 */
export class StudioPlantGenerator {
	/** Builds a parameterized tree from one deterministic random stream. */
	static tree(random, params) {
		const { trunkWidth, trunkHeight, canopyCount, canopySpread, canopyRadius } = params;
		const canopyColors = ['#4f8f3f', '#5fa548', '#6aad4c'];
		const trunk = {
			type: 'rect',
			x: -trunkWidth / 2,
			y: -trunkHeight * 0.43,
			width: trunkWidth,
			height: trunkHeight,
			fill: '#7c4f2b',
			stroke: '#4b2d18',
			strokeWidth: 3
		};
		const canopyCenterY = -trunkHeight * 0.72;
		const canopy = Array.from({ length: canopyCount }, () => ({
			type: 'circle',
			x: random.range(-canopySpread, canopySpread),
			y: canopyCenterY + random.range(-canopySpread * 0.45, canopySpread * 0.45),
			radius: canopyRadius * random.range(0.76, 1.24),
			fill: canopyColors[random.integer(0, canopyColors.length - 1)],
			stroke: '#35682e',
			strokeWidth: 2
		}));
		return this.group([trunk, ...canopy]);
	}

	/** Builds a tapered root vegetable whose leaves and body honor the descriptor. */
	static vegetable(random, params) {
		const { bodyWidth, bodyHeight, leafCount, leafHeight, leafSpread } = params;
		const topY = -bodyHeight * 0.32;
		const tipY = topY + bodyHeight;
		const body = {
			type: 'path',
			commands: [
				['M', -bodyWidth / 2, topY],
				['Q', 0, tipY, bodyWidth / 2, topY],
				['Q', 0, topY - bodyHeight * 0.18, -bodyWidth / 2, topY],
				['Z']
			],
			fill: '#f28a2e',
			stroke: '#b85d17',
			strokeWidth: 3
		};
		const leaves = Array.from({ length: leafCount }, (_, index) => {
			const ratio = leafCount === 1 ? 0.5 : index / (leafCount - 1);
			const x = -leafSpread / 2 + ratio * leafSpread;
			return {
				type: 'ellipse',
				x,
				y: topY - leafHeight * 0.72,
				radiusX: Math.max(6, leafSpread / Math.max(3, leafCount)),
				radiusY: leafHeight * random.range(0.84, 1.16),
				fill: '#4d9a45',
				stroke: '#2d6d31',
				strokeWidth: 2
			};
		});
		return this.group([body, ...leaves]);
	}

	/** Builds a radial flower whose petal geometry and stem length remain editable. */
	static flower(random, params) {
		const { petalCount, petalOrbit, petalWidth, petalHeight, stemHeight } = params;
		const petalColors = ['#ff7fb8', '#ff99c7', '#f472b6'];
		const centerY = -stemHeight * 0.7;
		const stem = {
			type: 'rect',
			x: -4,
			y: centerY + 6,
			width: 8,
			height: stemHeight,
			fill: '#43833f'
		};
		const petals = Array.from({ length: petalCount }, (_, index) => {
			const angle = (Math.PI * 2 * index) / petalCount;
			return {
				type: 'ellipse',
				x: Math.cos(angle) * petalOrbit,
				y: centerY + Math.sin(angle) * petalOrbit,
				radiusX: petalWidth,
				radiusY: petalHeight * random.range(0.86, 1.14),
				fill: petalColors[random.integer(0, petalColors.length - 1)],
				rotation: angle,
				stroke: '#b94f87',
				strokeWidth: 2
			};
		});
		const center = { type: 'circle', x: 0, y: centerY, radius: 18, fill: '#f4c84a' };
		return this.group([stem, ...petals, center]);
	}

	/** Groups editable vector children without introducing an alternate render model. */
	static group(children) {
		return { type: 'group', children };
	}
}
