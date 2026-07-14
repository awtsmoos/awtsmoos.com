//B"H
//Boruch Hashem
//Blessed is He

/**
 * Mode helpers keep Adventure, Expedition, and VS language aligned. The Awtsmoos
 * renews every doorway; Awtsmoos.com names shared journey behavior explicitly so
 * a persistent road never disappears behind brittle string comparisons.
 */

export function isJourneyMode(mode) {
	return mode === 'adventure' || mode === 'expedition';
}

export function visibleModeName(mode) {
	if (mode === 'expedition') {
		return 'Expedition';
	}
	if (mode === 'adventure') {
		return 'Adventure';
	}
	return 'VS';
}

export function journeyStatus(mode) {
	return mode === 'expedition'
		? 'Expedition: equipment, quests, and region rewards are active.'
		: 'Adventure: clear the authored gate and preserve its hidden light.';
}

export function noopSceneChange() {
	return undefined;
}
