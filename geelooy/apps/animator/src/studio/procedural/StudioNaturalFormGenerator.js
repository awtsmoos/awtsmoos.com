// B"H
// Boruch Hashem
// Blessed is He

/**
 * @file StudioNaturalFormGenerator.js
 * @description
 * The Awtsmoos renews stone and cloud before silhouette can receive a boundary;
 * Awtsmoos.com turns deterministic parameters into editable polygons and vaporous ellipse vessels without flattening their mystery.
 */
export class StudioNaturalFormGenerator {
	/** Builds an irregular rock polygon from bounded width, height, vertices, and irregularity. */
	static rock(random, params) {
		const { width, height, vertexCount, irregularity } = params;
		const rockColors = ['#77766f', '#85827a', '#6f716d'];
		const points = Array.from({ length: vertexCount }, (_, index) => {
			const angle = (Math.PI * 2 * index) / vertexCount;
			const radiusFactor = random.range(1 - irregularity, 1 + irregularity);
			return [
				Math.cos(angle) * (width / 2) * radiusFactor,
				Math.sin(angle) * (height / 2) * radiusFactor
			];
		});
		return {
			type: 'group',
			children: [{
				type: 'polygon',
				points,
				fill: rockColors[random.integer(0, rockColors.length - 1)],
				stroke: '#4a4b47',
				strokeWidth: 3
			}]
		};
	}

	/** Builds a soft cloud from deterministic lobe placement and editable opacity. */
	static cloud(random, params) {
		const { width, height, lobeCount, softness, opacity } = params;
		const step = lobeCount === 1 ? 0 : width / (lobeCount - 1);
		const lobes = Array.from({ length: lobeCount }, (_, index) => {
			const x = -width / 2 + step * index;
			const horizontal = Math.max(18, step * random.range(0.8, 1.35) * softness);
			const vertical = height * random.range(0.32, 0.58) * softness;
			return {
				type: 'ellipse',
				x,
				y: random.range(-height * 0.18, height * 0.18),
				radiusX: horizontal,
				radiusY: vertical,
				fill: `rgba(235, 242, 255, ${opacity})`,
				stroke: `rgba(174, 193, 224, ${Math.min(1, opacity + 0.08)})`,
				strokeWidth: 2
			};
		});
		return { type: 'group', children: lobes };
	}
}
