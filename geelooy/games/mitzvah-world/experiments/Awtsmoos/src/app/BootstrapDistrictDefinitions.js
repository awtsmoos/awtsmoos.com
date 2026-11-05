// B"H
// Boruch Hashem
// Blessed is He

/**
 * @file BootstrapDistrictDefinitions.js
 * @description Defines texture-bound provisional architecture with collision-safe visual silhouette details.
 * The Awtsmoos lets doorway, roofline, stone, and gold appear before the full valley is complete;
 * Awtsmoos.com keeps decorative garments non-colliding, so beauty never becomes an invisible wall beneath the feet.
 */

export const BOOTSTRAP_DISTRICTS = Object.freeze([
	district('gateway-homes', 'Gateway Homes', [
		part('west-home', [-8, 1.5, 35], [4, 3, 4], [0.72, 0.55, 0.33, 1], 'village.woodPlanks'),
		part('east-home', [8, 1.5, 35], [4, 3, 4], [0.72, 0.55, 0.33, 1], 'village.woodPlanks'),
		part('west-roof', [-8, 3.35, 35], [4.6, 0.7, 4.6], [0.42, 0.16, 0.1, 1], 'roof.tile'),
		part('east-roof', [8, 3.35, 35], [4.6, 0.7, 4.6], [0.42, 0.16, 0.1, 1], 'roof.tile'),
		decor('west-foundation', [-8, 0.22, 35], [4.4, 0.3, 4.4], [0.58, 0.52, 0.43, 1], 'stone.fieldstone'),
		decor('east-foundation', [8, 0.22, 35], [4.4, 0.3, 4.4], [0.58, 0.52, 0.43, 1], 'stone.fieldstone'),
		decor('west-door', [-8, 1.05, 32.94], [0.95, 1.9, 0.12], [0.38, 0.22, 0.12, 1], 'village.woodPlanks'),
		decor('east-door', [8, 1.05, 32.94], [0.95, 1.9, 0.12], [0.38, 0.22, 0.12, 1], 'village.woodPlanks'),
		decor('west-chimney', [-9.15, 4.15, 35.55], [0.55, 1.65, 0.55], [0.52, 0.46, 0.4, 1], 'stone.fieldstone'),
		decor('east-chimney', [9.15, 4.15, 35.55], [0.55, 1.65, 0.55], [0.52, 0.46, 0.4, 1], 'stone.fieldstone')
	]),
	district('study-court', 'Study Court', [
		part('study-hall', [-13, 2, 53], [7, 4, 5], [0.82, 0.68, 0.42, 1], 'village.woodPlanks'),
		part('study-roof', [-13, 4.4, 53], [7.8, 0.8, 5.8], [0.35, 0.12, 0.08, 1], 'roof.tile'),
		part('courtyard-wall', [-2, 0.8, 55], [12, 1.6, 0.7], [0.72, 0.62, 0.46, 1], 'stone.fieldstone'),
		part('mitzvah-marker', [4, 2.2, 55], [1.2, 4.4, 1.2], [0.95, 0.76, 0.2, 1], 'metal.gold'),
		decor('study-foundation', [-13, 0.24, 53], [7.5, 0.35, 5.5], [0.58, 0.52, 0.43, 1], 'stone.fieldstone'),
		decor('study-door', [-13, 1.2, 50.44], [1.2, 2.2, 0.12], [0.4, 0.24, 0.13, 1], 'village.woodPlanks'),
		decor('study-roof-trim', [-13, 3.92, 53], [8.1, 0.18, 6.1], [0.42, 0.16, 0.1, 1], 'roof.tile'),
		decor('court-west-pillar', [-8.1, 1.6, 54.55], [0.55, 3.2, 0.55], [0.65, 0.58, 0.48, 1], 'stone.fieldstone'),
		decor('court-east-pillar', [4.1, 1.6, 54.55], [0.55, 3.2, 0.55], [0.65, 0.58, 0.48, 1], 'stone.fieldstone'),
		decor('mitzvah-cap', [4, 4.55, 55], [1.65, 0.3, 1.65], [0.96, 0.8, 0.24, 1], 'metal.gold')
	]),
	district('mountain-orchard', 'Mountain Orchard', [], [
		model('flower-clump', [18, 0, 59], 1.4, 0),
		model('flower-bush', [10, 0, 61], 1.3, 0.8)
	])
]);

function district(id, label, parts, models = []) {
	return Object.freeze({ id, label, models: Object.freeze(models), parts: Object.freeze(parts) });
}

function decor(name, position, scale, color, materialRole) {
	return part(name, position, scale, color, materialRole, false);
}

function part(name, position, scale, color, materialRole, collides = true) {
	return Object.freeze({
		collides,
		color: Object.freeze(color),
		materialRole,
		name,
		position: Object.freeze(position),
		scale: Object.freeze(scale)
	});
}

function model(modelId, position, scale, yaw) {
	return Object.freeze({ modelId, position: Object.freeze(position), scale, yaw });
}
