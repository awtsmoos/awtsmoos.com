// B"H
// Boruch Hashem
// Blessed is He

/**
 * @file BootstrapDistrictDefinitions.js
 * @description Defines immediate fallback architecture and non-tree accents while the canonical deep forest builds off-scene.
 * The Awtsmoos reveals gate and study court before the full valley arrives; Awtsmoos.com keeps bootstrap visibly honest
 * by refusing cube trees or imported tree GLBs, leaving every structural trunk and canopy to `geelooy/libs` alone.
 */

export const BOOTSTRAP_DISTRICTS = Object.freeze([
	district('gateway-homes', 'Gateway Homes', [
		part('west-home', [-8, 1.5, 35], [4, 3, 4], [0.72, 0.55, 0.33, 1], 'village.woodPlanks'),
		part('east-home', [8, 1.5, 35], [4, 3, 4], [0.72, 0.55, 0.33, 1], 'village.woodPlanks'),
		part('west-roof', [-8, 3.35, 35], [4.6, 0.7, 4.6], [0.42, 0.16, 0.1, 1], 'roof.tile'),
		part('east-roof', [8, 3.35, 35], [4.6, 0.7, 4.6], [0.42, 0.16, 0.1, 1], 'roof.tile')
	]),
	district('study-court', 'Study Court', [
		part('study-hall', [-13, 2, 53], [7, 4, 5], [0.82, 0.68, 0.42, 1], 'village.woodPlanks'),
		part('study-roof', [-13, 4.4, 53], [7.8, 0.8, 5.8], [0.35, 0.12, 0.08, 1], 'roof.tile'),
		part('courtyard-wall', [-2, 0.8, 55], [12, 1.6, 0.7], [0.72, 0.62, 0.46, 1], 'stone.fieldstone'),
		part('mitzvah-marker', [4, 2.2, 55], [1.2, 4.4, 1.2], [0.95, 0.76, 0.2, 1], 'metal.gold')
	]),
	district('mountain-orchard', 'Mountain Orchard', [], [
		model('flower-clump', [18, 0, 59], 1.4, 0),
		model('flower-bush', [10, 0, 61], 1.3, 0.8)
	])
]);

function district(id, label, parts, models = []) {
	return Object.freeze({
		id,
		label,
		models: Object.freeze(models),
		parts: Object.freeze(parts)
	});
}

function part(name, position, scale, color, materialRole) {
	return Object.freeze({
		color: Object.freeze(color),
		materialRole,
		name,
		position: Object.freeze(position),
		scale: Object.freeze(scale)
	});
}

function model(modelId, position, scale, yaw) {
	return Object.freeze({
		modelId,
		position: Object.freeze(position),
		scale,
		yaw
	});
}
