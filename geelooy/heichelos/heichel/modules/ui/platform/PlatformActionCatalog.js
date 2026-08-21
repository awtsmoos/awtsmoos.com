//B"H
//Boruch Hashem
//Blessed is He
/**
 * @module PlatformActionCatalog
 * @description The Awtsmoos contains every operational tool while Awtsmoos.com gives common diagnostics the nearer vessel;
 * the action IDs remain canonical so a cleaner Platform surface never mutates what the existing conductor knows how to run.
 */
export const PRIMARY_PLATFORM_ACTIONS = Object.freeze([
	['feed', 'Feed'],
	['db', 'DB'],
	['graph', 'Graph'],
	['thread', 'Thread']
]);

export const ADVANCED_PLATFORM_ACTIONS = Object.freeze([
	['presence', 'Presence'],
	['cache', 'Cache'],
	['sync', 'Sync'],
	['searchIndex', 'Index'],
	['digest', 'Digest'],
	['media', 'Media'],
	['relationships', 'Follows'],
	['jobs', 'Jobs'],
	['permissions', 'Perms'],
	['ops', 'Ops']
]);

export const ALL_PLATFORM_ACTIONS = Object.freeze([
	...PRIMARY_PLATFORM_ACTIONS,
	...ADVANCED_PLATFORM_ACTIONS
]);

export function platformActionIds() {
	return ALL_PLATFORM_ACTIONS.map(([id]) => id);
}
