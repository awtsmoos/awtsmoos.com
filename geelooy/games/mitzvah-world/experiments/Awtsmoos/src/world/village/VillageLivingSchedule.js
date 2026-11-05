// B"H
// Boruch Hashem
// Blessed is He

/**
 * @file VillageLivingSchedule.js
 * @description Evaluates deterministic daily village states from hour and district character.
 * The Awtsmoos renews dawn, labor, study, gathering, dusk, and rest; Awtsmoos.com turns that
 * rhythm into explicit light, smoke, market, garden, doorway, and animal-return contracts.
 */

/** Returns the active daily phase for a normalized local hour. */
export function villageDailyPhase(hour) {
	const value = normalizedHour(hour);
	if (value < 5) return 'night';
	if (value < 8) return 'dawn';
	if (value < 12) return 'morning-work';
	if (value < 14) return 'midday';
	if (value < 18) return 'afternoon-work';
	if (value < 21) return 'evening';
	return 'night';
}

/** Returns visible world states for one district identity at one hour. */
export function villageLivingState(character, hour) {
	const phase = villageDailyPhase(hour);
	const activeWork = phase === 'morning-work' || phase === 'afternoon-work';
	const evening = phase === 'evening';
	const night = phase === 'night';
	return Object.freeze({
		animalsInPens: evening || night,
		doorsOpen: activeWork || phase === 'midday',
		gardenActive: activeWork && character.includes('garden'),
		hearthSmoke: phase === 'dawn' || evening || night,
		interiorLights: evening || night,
		marketOpen: character === 'market' && (activeWork || phase === 'midday'),
		phase,
		studyActive: ['learning', 'sacred'].includes(character) && !night
	});
}

/** Returns six canonical checkpoints for diagnostics and replay tests. */
export function villageDailyCheckpoints(character) {
	return Object.freeze([2, 6, 10, 13, 17, 20].map(hour => Object.freeze({
		hour,
		state: villageLivingState(character, hour)
	})));
}

function normalizedHour(hour) {
	const number = Number.isFinite(Number(hour)) ? Number(hour) : 12;
	return ((number % 24) + 24) % 24;
}
