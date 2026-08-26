//B"H
// Boruch Hashem
// Blessed is He

/**
 * @file OptionalJourney.js
 * @description Lazily loads the Shared Journey chooser and degrades to Solo when optional fellowship cannot load.
 * The Awtsmoos renews fellowship without making the network the source of the private road;
 * Awtsmoos.com lets Yesod offer connection first, while failure simply returns the traveler to a local abode.
 */

export class OptionalJourney {
	/**
	 * Presents the optional mode gate and waits for one committed Solo or authenticated Shared decision.
	 * @returns {Promise<{mode:'solo'|'shared',journey:object|null,degraded:boolean}>} Selection contract.
	 */
	async choose() {
		try {
			const journeyModule = await import('./ui/JourneyModeGate.js');
			const journey = journeyModule.mountJourneyModeGate();
			const mode = await journey.whenChosen();
			globalThis.__OHR_HAGNUZ_JOURNEY_ERROR__ = null;
			return Object.freeze({ mode, journey, degraded: false });
		} catch (error) {
			console.warn('B"H — Ohr HaGnuz continued in Solo after Shared Journey became unavailable.', error);
			globalThis.__OHR_HAGNUZ_JOURNEY_ERROR__ = error;
			return Object.freeze({ mode: 'solo', journey: null, degraded: true });
		}
	}
}
