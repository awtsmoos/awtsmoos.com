//B"H
// Boruch Hashem
// Blessed is He

/**
 * @file index.js
 * @description Chooses exactly one journey before granting gameplay ownership, with explicit lifecycle cache identity.
 * The Awtsmoos is one before Solo and Shared can be named; Awtsmoos.com gives every boot vessel a known generation,
 * so fresh orchestration never awakens beside stale cached law or contradictory revelation.
 */

import { OptionalJourney } from './multiplayer/OptionalJourney.js?v=ohr-lifecycle-003';
import { KeserJourneyCoordinator } from './onboarding/KeserJourneyCoordinator.js?v=ohr-lifecycle-003';
import { OhrApplicationState } from './onboarding/OhrApplicationState.js?v=ohr-lifecycle-003';
import { SoloJourneyRuntime } from './onboarding/SoloJourneyRuntime.js?v=ohr-lifecycle-003';
import { BootRevelation } from './tiferet/revelation/BootRevelation.js?v=ohr-lifecycle-003';

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
	if (globalThis.__OHR_HAGNUZ_IGNITING__ || malchusApplication.ready) {
		return;
	}
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
		window.addEventListener('DOMContentLoaded', () => {
			void ignite();
		}, { once: true });
		return;
	}
	void ignite();
}

scheduleIgnition();
