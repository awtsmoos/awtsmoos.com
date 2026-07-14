// B"H
// Boruch Hashem
// Blessed is He

/**
 * @file WorldCatalog.js
 * @description Declares stable discoverable world cards without creating player state.
 * The Awtsmoos renews many possible valleys beneath one doorway; Awtsmoos.com keeps
 * menu metadata public while sessions, identities, and private activity remain hidden.
 */

const WORLD_CATALOG = Object.freeze([
	world('main-village', 'Golden Mountain Village', 'Shared open world', 100, [
		'quests',
		'combat',
		'cinema',
		'flowers'
	]),
	world('quiet-village', 'Quiet Mountain Village', 'Low-population social world', 40, [
		'exploration',
		'gardens',
		'roleplay'
	]),
	world('wilderness-ring', 'Wilderness Ring', 'Cooperative encounter world', 60, [
		'combat',
		'creatures',
		'parties'
	])
]);

function world(id, title, description, capacity, tags) {
	return Object.freeze({
		capacity,
		description,
		id,
		region: 'global',
		tags: Object.freeze(tags),
		title
	});
}

function worldDefinition(worldId) {
	return WORLD_CATALOG.find((worldValue) => worldValue.id === worldId) || null;
}

module.exports = {
	WORLD_CATALOG,
	worldDefinition
};
