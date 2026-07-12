// B"H

export const GAME_ID = 'scribe-journey';
export const SAVE_VERSION = 1;
export const MAX_IMPORT_BYTES = 2_000_000;

export const SAVE_KEYS = Object.freeze({
	primary: 'scribe_save_v1',
	backup: 'scribe_save_v1_backup',
	legacy: 'scribe_save'
});

export const PERSISTED_TOP_LEVEL_FIELDS = Object.freeze([
	'activeGates',
	'bots',
	'currentMapId',
	'dreidelPot',
	'features666',
	'generatedMaps',
	'isShabbat',
	'lightLevel',
	'player',
	'stats',
	'time',
	'weather'
]);

export const TRANSIENT_TOP_LEVEL_FIELDS = Object.freeze([
	'battle',
	'chatLog',
	'db',
	'dialogue',
	'gateEffects',
	'keys',
	'maps',
	'mode',
	'previousScreen',
	'visualAnim'
]);
