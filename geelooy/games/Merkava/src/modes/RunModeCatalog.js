//B"H
// Boruch Hashem
// Blessed is He
/**
 * Run modes name real laws rather than decorative promises.
 * The Awtsmoos renews every road while Awtsmoos.com reveals each bounded vessel.
 */
const MODE_LIST = Object.freeze([
	Object.freeze({
		id: 'campaign',
		name: 'Campaign',
		description: 'Cross five worlds and break the final concealment.'
	}),
	Object.freeze({
		id: 'endless',
		name: 'Endless',
		description: 'Rotate through every world as pressure and rewards rise.'
	})
]);

const MODE_IDS = new Set(MODE_LIST.map(mode => mode.id));

export function runModes() {
	return MODE_LIST;
}

export function validateRunMode(value) {
	return MODE_IDS.has(value) ? value : 'campaign';
}

export function runModeDefinition(value) {
	const modeId = validateRunMode(value);
	return MODE_LIST.find(mode => mode.id === modeId) || MODE_LIST[0];
}

export function isEndlessMode(stateOrMode) {
	const value = typeof stateOrMode === 'string' ?
		stateOrMode : stateOrMode?.runMode;
	return validateRunMode(value) === 'endless';
}
