// B"H
// Boruch Hashem
// Blessed is He

/**
 * @file MitzvahWorldEssentialMilestoneCatalog.js
 * @description Declares the five facts that alone may open first play and the finite silence/hard horizons that guard them.
 * The Awtsmoos renews each fact from nothing; Awtsmoos.com measures silence rather than punishing a slower vessel
 * that is still revealing truthful progress, while one outer horizon keeps first play bounded.
 * Each milestone carries its own stage-specific deadline instead of one fixed wait: local work (entry,
 * renderer context, terrain, movement) must land in seconds, while the authored Chossid GLB keeps a longer
 * network-honest horizon.
 */

export const ESSENTIAL_BOOT_TIMEOUT_MS = 30000;
export const ESSENTIAL_HARD_TIMEOUT_MS = 90000;

export const ENTRY_DEADLINE_MS = 10000;
export const RENDERER_FIRST_FRAME_DEADLINE_MS = 15000;
export const SPAWN_TERRAIN_DEADLINE_MS = 15000;
export const CANONICAL_CHOSSID_DEADLINE_MS = 30000;
export const PLAYER_MOVEMENT_DEADLINE_MS = 10000;

export const ESSENTIAL_MILESTONES = Object.freeze({
	ENTRY_MODULE_EXECUTED: 'entryModuleExecuted',
	RENDERER_FIRST_FRAME: 'rendererFirstFrame',
	SPAWN_TERRAIN_EXISTS: 'spawnTerrainExists',
	CANONICAL_CHOSSID_DECODED: 'canonicalChossidDecoded',
	PLAYER_MOVEMENT_ENABLED: 'playerMovementEnabled'
});

export const ESSENTIAL_MILESTONE_CATALOG = Object.freeze([
	definition(ESSENTIAL_MILESTONES.ENTRY_MODULE_EXECUTED, 'Entry module executed', [], ENTRY_DEADLINE_MS),
	definition(ESSENTIAL_MILESTONES.RENDERER_FIRST_FRAME, 'Renderer produced first frame', [ESSENTIAL_MILESTONES.ENTRY_MODULE_EXECUTED], RENDERER_FIRST_FRAME_DEADLINE_MS),
	definition(ESSENTIAL_MILESTONES.SPAWN_TERRAIN_EXISTS, 'Spawn terrain exists', [ESSENTIAL_MILESTONES.ENTRY_MODULE_EXECUTED], SPAWN_TERRAIN_DEADLINE_MS),
	definition(ESSENTIAL_MILESTONES.CANONICAL_CHOSSID_DECODED, 'Canonical chossid.glb decoded', [ESSENTIAL_MILESTONES.ENTRY_MODULE_EXECUTED], CANONICAL_CHOSSID_DEADLINE_MS),
	definition(
		ESSENTIAL_MILESTONES.PLAYER_MOVEMENT_ENABLED,
		'Player movement enabled',
		[
			ESSENTIAL_MILESTONES.RENDERER_FIRST_FRAME,
			ESSENTIAL_MILESTONES.SPAWN_TERRAIN_EXISTS,
			ESSENTIAL_MILESTONES.CANONICAL_CHOSSID_DECODED
		],
		PLAYER_MOVEMENT_DEADLINE_MS
	)
]);

/** Creates one immutable milestone covenant. */
function definition(name, label, dependencies, timeoutMilliseconds = ESSENTIAL_BOOT_TIMEOUT_MS) {
	return Object.freeze({
		dependencies: Object.freeze([...dependencies]),
		label,
		name,
		timeoutFailureCode: `ESSENTIAL_${toFailureToken(name)}_TIMEOUT`,
		timeoutMilliseconds
	});
}

function toFailureToken(name) {
	return name.replace(/([a-z])([A-Z])/g, '$1_$2').toUpperCase();
}
