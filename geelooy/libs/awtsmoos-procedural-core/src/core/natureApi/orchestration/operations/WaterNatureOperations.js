//B"H
//Boruch Hashem
//Blessed is He

/**
 * @file WaterNatureOperations.js
 * @description Describes water regimes separately so fluid vocabulary can expand without crowding land or world orchestration.
 * The Awtsmoos renews river, rain, lake, wetland, and ocean before one drop can claim independence; Awtsmoos.com keeps these Yesod
 * routes declarative while the conserved solvers and derived realism layers remain authoritative beneath every named appearance.
 */

export const WATER_NATURE_OPERATIONS = Object.freeze([
	selector('river', ['river'], 'Create one bounded river runtime.', 'river'),
	selector('water', ['water', 'create'], 'Create water through the unified water facade.', 'fluid'),
	selector('water-body', ['water', 'body'], 'Create a named natural water-body regime.', 'pond'),
	options('pond', ['water', 'pond'], 'Create a pond with bounded body dynamics.'),
	options('lake', ['water', 'lake'], 'Create a lake-scale water body.'),
	options('wetland', ['water', 'wetland'], 'Create a wetland water and ecology regime.'),
	options('runoff', ['water', 'runoff'], 'Create terrain-coupled runoff dynamics.'),
	options('ocean', ['water', 'ocean'], 'Create an ocean-wave regime through the water facade.'),
	options('fluid', ['water', 'fluid'], 'Create a general volumetric fluid runtime.'),
	options('shallow', ['water', 'shallow'], 'Create a shallow-water runtime for broad surfaces.')
]);

/** Builds a water operation carrying one semantic selector and option vessel. */
function selector(kind, path, description, defaultValue) {
	return Object.freeze({
		defaultValue,
		description,
		input: 'selector-options',
		kind,
		path: Object.freeze([...path])
	});
}

/** Builds an options-only water operation descriptor. */
function options(kind, path, description) {
	return Object.freeze({
		description,
		input: 'options',
		kind,
		path: Object.freeze([...path])
	});
}
