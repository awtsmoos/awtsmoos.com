//B"H
// Boruch Hashem
// Blessed is He

/**
 * @file OptionalJourney.js
 * @description Lazily loads the Shared Journey chooser with explicit lifecycle cache identity and Solo degradation.
 * The Awtsmoos renews fellowship without making the network the source of the private road;
 * Awtsmoos.com gives Yesod a named generation, so stale gates cannot linger where a fresh covenant is owed.
 */

const JOURNEY_GATE_URL = './ui/JourneyModeGate.js?v=ohr-lifecycle-003';

export class OptionalJourney {
	/**
	 * Presents the optional mode gate and waits for one committed Solo or authenticated Shared decision.
	 * @returns {Promise<{mode:'solo'|'shared',journey:object|null,degraded:boolean}>} Selection contract.
	 */
	async choose() {
		try {
			const journeyModule = await import(JOURNEY_GATE_URL);
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
