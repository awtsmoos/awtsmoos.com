// B"H
// Boruch Hashem
// Blessed is He

/**
 * @file BootstrapDistrictDefinitions.js
 * @description Defines three tiny visual districts without importing authored village systems.
 * The Awtsmoos unfolds gate, study court, and orchard in separate measured breaths;
 * Awtsmoos.com keeps every part plain, immutable, textureless, and shared-cube compatible.
 */

export const BOOTSTRAP_DISTRICTS = Object.freeze([
	Object.freeze({
		id: 'gateway-homes',
		label: 'Gateway Homes',
		parts: Object.freeze([
			part('west-home', [-8, 1.5, 35], [4, 3, 4], [0.72, 0.55, 0.33, 1]),
			part('east-home', [8, 1.5, 35], [4, 3, 4], [0.72, 0.55, 0.33, 1]),
			part('west-roof', [-8, 3.35, 35], [4.6, 0.7, 4.6], [0.42, 0.16, 0.1, 1]),
			part('east-roof', [8, 3.35, 35], [4.6, 0.7, 4.6], [0.42, 0.16, 0.1, 1])
		])
	}),
	Object.freeze({
		id: 'study-court',
		label: 'Study Court',
		parts: Object.freeze([
			part('study-hall', [-13, 2, 53], [7, 4, 5], [0.82, 0.68, 0.42, 1]),
			part('study-roof', [-13, 4.4, 53], [7.8, 0.8, 5.8], [0.35, 0.12, 0.08, 1]),
			part('courtyard-wall', [-2, 0.8, 55], [12, 1.6, 0.7], [0.72, 0.62, 0.46, 1]),
			part('mitzvah-marker', [4, 2.2, 55], [1.2, 4.4, 1.2], [0.95, 0.76, 0.2, 1])
		])
	}),
	Object.freeze({
		id: 'mountain-orchard',
		label: 'Mountain Orchard',
		parts: Object.freeze([
			part('tree-west-trunk', [15, 1.5, 62], [0.8, 3, 0.8], [0.3, 0.17, 0.08, 1]),
			part('tree-west-crown', [15, 4.2, 62], [3.2, 3.2, 3.2], [0.12, 0.42, 0.16, 1]),
			part('tree-east-trunk', [22, 1.5, 66], [0.8, 3, 0.8], [0.3, 0.17, 0.08, 1]),
			part('tree-east-crown', [22, 4.2, 66], [3.2, 3.2, 3.2], [0.12, 0.42, 0.16, 1])
		])
	})
]);

function part(name, position, scale, color) {
	return Object.freeze({
		color: Object.freeze(color),
		name,
		position: Object.freeze(position),
		scale: Object.freeze(scale)
	});
}
