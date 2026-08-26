//B"H
//Boruch Hashem
//Blessed is He

/**
 * @file LandNatureOperations.js
 * @description Describes solid, botanical, forest, creature, and material creation without embedding generation logic.
 * The Awtsmoos renews stone, leaf, bark, and living form before any operation receives a name; Awtsmoos.com keeps these Hod-like
 * descriptions data-only so editors and agents can understand the doorway while canonical Domem, Tzomayach, and Chai remain the flame.
 */

export const LAND_NATURE_OPERATIONS = Object.freeze([
	selector('rock', ['rock'], 'Create one geology-first natural rock.', 'fieldstone'),
	options('rock-field', ['rockField'], 'Plan a deterministic geology-aware rock field.'),
	selector('rock-morphology', ['rockMorphology'], 'Create expert-directed rock morphology without geology orchestration.', 'fieldstone'),
	selector('material', ['material'], 'Plan one local-first semantic physical material.', null, true),
	selector('surface', ['surface'], 'Compatibility doorway for semantic material planning.', null, true),
	selector('plant', ['plant'], 'Create one botanical organism through canonical Tzomayach.', null, true),
	selector('flowers', ['flowers'], 'Create a realistic botanical flower cluster.', 'daisy'),
	options('flora', ['flora'], 'Plan a deterministic mixed botanical population.'),
	options('grass', ['grass'], 'Plan an ecological grass field for batched rendering.'),
	selector('tree', ['tree'], 'Create one canonical tree from its authoritative skeleton.', null, true),
	options('forest', ['forest'], 'Plan a habitat-aware deterministic forest.'),
	selector('creature', ['creature'], 'Create one creature through the canonical Chai phenotype pipeline.', null, true)
]);

/** Builds a selector-plus-options operation descriptor with a human-facing purpose. */
function selector(kind, path, description, defaultValue = null, requiresValue = false) {
	return Object.freeze({
		defaultValue,
		description,
		input: 'selector-options',
		kind,
		path: Object.freeze([...path]),
		requiresValue
	});
}

/** Builds an options-only operation descriptor for planning-oriented domains. */
function options(kind, path, description) {
	return Object.freeze({
		description,
		input: 'options',
		kind,
		path: Object.freeze([...path])
	});
}
