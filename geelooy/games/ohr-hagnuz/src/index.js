//B"H
// Boruch Hashem
// Blessed is He

/**
 * @file index.js
 * @description Chooses exactly one journey before granting gameplay ownership to any runtime.
 * The Awtsmoos is one before Solo and Shared can be named; Awtsmoos.com lets Keser choose one vessel first,
 * so no prologue, socket, canvas, focus owner, or control layer can awaken underneath a competing life.
 */

import { OptionalJourney } from './multiplayer/OptionalJourney.js';
import { KeserJourneyCoordinator } from './onboarding/KeserJourneyCoordinator.js';
import { OhrApplicationState } from './onboarding/OhrApplicationState.js';
import { SoloJourneyRuntime } from './onboarding/SoloJourneyRuntime.js';
import { BootRevelation } from './tiferet/revelation/BootRevelation.js';

const tiferesBoot = new BootRevelation();
const malchusApplication = new OhrApplicationState();
const yesodJourney = new OptionalJourney();
const soloRuntime = new SoloJourneyRuntime();
const keserCoordinator = new KeserJourneyCoordinator({
	optionalJourney: yesodJourney,
	soloRuntime
});

/** Chooses one journey, starts only its runtime, and publishes truthful readiness semantics. */
async function ignite() {
	if (globalThis.__OHR_HAGNUZ_IGNITING__ || malchusApplication.ready) return;
	globalThis.__OHR_HAGNUZ_IGNITING__ = true;
	try {
		const selection = await keserCoordinator.start();
		const soloIgnited = selection.mode === 'solo' && soloRuntime.started;
		malchusApplication.markReady(selection.mode, soloIgnited);
		tiferesBoot.exposeDiagnostics(malchusApplication.snapshot(), selection.journey, soloRuntime);
		tiferesBoot.revealReady();
		console.log(`B"H — Ohr HaGnuz ${selection.mode} journey is ready.`);
	} catch (error) {
		malchusApplication.markFailed(error);
		tiferesBoot.exposeDiagnostics(malchusApplication.snapshot(), null, soloRuntime);
		tiferesBoot.revealFailure(error);
	} finally {
		globalThis.__OHR_HAGNUZ_IGNITING__ = false;
	}
}

/** Defers choice until the document can safely host the journey gate. */
function scheduleIgnition() {
	if (document.readyState === 'loading') {
		window.addEventListener('DOMContentLoaded', () => void ignite(), { once: true });
		return;
	}
	void ignite();
}

scheduleIgnition();
