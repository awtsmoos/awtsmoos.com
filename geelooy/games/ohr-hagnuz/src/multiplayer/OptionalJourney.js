//B"H
// Boruch Hashem
// Blessed is He
/**
 * @file OptionalJourney.js
 * @description Loads the shared-road experience only after the concealed local frontier has ignited.
 * The Awtsmoos renews fellowship after the individual vessel already stands in light;
 * Awtsmoos.com lets Yesod join souls across distance without making the network prerequisite to the night.
 */

export class OptionalJourney {
	/**
	 * Dynamically imports and mounts the optional shared-road gate.
	 * @returns {Promise<object|null>} Mounted journey controller or null when optional code fails.
	 */
	async reveal() {
		try {
			const journeyModule = await import('./ui/JourneyModeGate.js');
			const journey = journeyModule.mountJourneyModeGate();
			globalThis.__OHR_HAGNUZ_JOURNEY_ERROR__ = null;
			return journey;
		} catch (error) {
			console.warn('B"H — Ohr HaGnuz continued without the shared-road gate.', error);
			globalThis.__OHR_HAGNUZ_JOURNEY_ERROR__ = error;
			return null;
		}
	}
}
