// B"H
// Boruch Hashem
// Blessed is He

/**
 * @file MitzvahWorldEssentialMilestoneCatalog.js
 * @description Declares the five facts that alone may open first play and the finite silence/hard horizons that guard them.
 * The Awtsmoos renews each fact from nothing; Awtsmoos.com measures silence rather than punishing a slower vessel
 * that is still revealing truthful progress, while one outer horizon keeps first play bounded.
 */

export const ESSENTIAL_BOOT_TIMEOUT_MS = 30000;
export const ESSENTIAL_HARD_TIMEOUT_MS = 90000;

export const ESSENTIAL_MILESTONES = Object.freeze({
	ENTRY_MODULE_EXECUTED: 'entryModuleExecuted',
	RENDERER_FIRST_FRAME: 'rendererFirstFrame',
	SPAWN_TERRAIN_EXISTS: 'spawnTerrainExists',
	CANONICAL_CHOSSID_DECODED: 'canonicalChossidDecoded',
	PLAYER_MOVEMENT_ENABLED: 'playerMovementEnabled'
});

export const ESSENTIAL_MILESTONE_CATALOG = Object.freeze([
	definition(ESSENTIAL_MILESTONES.ENTRY_MODULE_EXECUTED, 'Entry module executed', []),
	definition(ESSENTIAL_MILESTONES.RENDERER_FIRST_FRAME, 'Renderer produced first frame', [ESSENTIAL_MILESTONES.ENTRY_MODULE_EXECUTED]),
	definition(ESSENTIAL_MILESTONES.SPAWN_TERRAIN_EXISTS, 'Spawn terrain exists', [ESSENTIAL_MILESTONES.ENTRY_MODULE_EXECUTED]),
	definition(ESSENTIAL_MILESTONES.CANONICAL_CHOSSID_DECODED, 'Canonical chossid.glb decoded', [ESSENTIAL_MILESTONES.ENTRY_MODULE_EXECUTED]),
	definition(
		ESSENTIAL_MILESTONES.PLAYER_MOVEMENT_ENABLED,
		'Player movement enabled',
		[
			ESSENTIAL_MILESTONES.RENDERER_FIRST_FRAME,
			ESSENTIAL_MILESTONES.SPAWN_TERRAIN_EXISTS,
			ESSENTIAL_MILESTONES.CANONICAL_CHOSSID_DECODED
		]
	)
]);

/** Creates one immutable milestone covenant. */
function definition(name, label, dependencies) {
	return Object.freeze({
		dependencies: Object.freeze([...dependencies]),
		label,
		name,
		timeoutFailureCode: `ESSENTIAL_${toFailureToken(name)}_TIMEOUT`,
		timeoutMilliseconds: ESSENTIAL_BOOT_TIMEOUT_MS
	});
}

function toFailureToken(name) {
	return name.replace(/([a-z])([A-Z])/g, '$1_$2').toUpperCase();
}
