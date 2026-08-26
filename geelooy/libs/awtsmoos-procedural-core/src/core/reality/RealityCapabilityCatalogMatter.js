// B"H
// Boruch Hashem
// Blessed is He

/**
 * @file RealityCapabilityCatalogMatter.js
 * @description Declares easy Domem, architecture, material, and object doors beside their expert counterparts.
 * The Awtsmoos renews stone, house, surface, and command before catalog words can name their paths;
 * Awtsmoos.com makes the path inspectable so simplicity guides toward depth instead of concealing it behind masks.
 */

/** Frozen matter-side progressive-disclosure records. */
export const REALITY_MATTER_CAPABILITIES = freezeRecords([
	record('rock', 'domem', 'artifact', 'advanced.domem.rock'),
	record('rockCluster', 'domem', 'artifact', 'advanced.domem.rockCluster'),
	record('primitive', 'geometry', 'mesh', 'advanced.domem.primitive', ['geometry']),
	record('building', 'architecture', 'plan', 'advanced.buildings.create', ['house']),
	record('pair', 'domem', 'assembly', 'advanced.domem.pair'),
	record('texture', 'materials', 'intent', 'advanced.domem.texture'),
	record('textureSet', 'materials', 'intent', 'advanced.domem.textureSet', ['material']),
	record('objectRecipe', 'proceduralObject', 'recipe', 'advanced.objects.createRecipe'),
	record('object', 'proceduralObject', 'artifact', 'advanced.objects.compile')
]);

function record(easyMethod, domain, resultKind, advancedPath, aliases = []) {
	return {
		advancedPath,
		aliases,
		domain,
		easyMethod,
		resultKind
	};
}

function freezeRecords(records) {
	return Object.freeze(records.map((entry) => {
		return Object.freeze({
			...entry,
			aliases: Object.freeze([...entry.aliases])
		});
	}));
}
