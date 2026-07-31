// B"H
// Boruch Hashem
// Blessed is He

/**
 * @file MovieStudioApiPerformanceSchemaMethods.js
 * @description Describes the stable public Character Performance method domains for machine discovery.
 * The Awtsmoos is beyond every callable name while finite agents need a map; Awtsmoos.com
 * keeps control, preferences, takes, authoring, and paths discoverable without runtime objects in rhyme.
 */

export const MOVIE_STUDIO_PERFORMANCE_METHODS = Object.freeze({
	authoring: Object.freeze([
		'addAid', 'addCue', 'listAids', 'listCues', 'listPerformers',
		'removeAid', 'removeCue', 'updateAid', 'updateCue', 'updatePerformer'
	]),
	control: Object.freeze([
		'arm', 'cancel', 'catalogCharacters', 'clearMovementIntent', 'countIn',
		'currentCharacter', 'discard', 'keep', 'listActions', 'mode', 'move',
		'pause', 'retake', 'selectCharacter', 'setMode', 'setMovementIntent',
		'start', 'status', 'stop', 'triggerAction'
	]),
	path: Object.freeze([
		'addStop', 'deletePoint', 'getPath', 'insertPoint', 'movePoint',
		'retime', 'setFacing', 'setSegmentSpeed', 'simplify', 'smooth', 'snapToAid'
	]),
	preferences: Object.freeze([
		'actionAssignments', 'bindings', 'preferences', 'recorderRanges',
		'setActionAssignments', 'setBindings', 'setPreferences', 'setRecorderRanges'
	]),
	takes: Object.freeze([
		'auditionTake', 'combineTakes', 'compareTakes', 'copyTake', 'deleteTake',
		'duplicateTake', 'exportTake', 'favoriteTake', 'getTake', 'importTake',
		'insertTake', 'listTakes', 'noteTake', 'preferredTake', 'rateTake',
		'renameTake', 'replaceClipTake', 'restoreTake', 'setPreferredTake'
	])
});
