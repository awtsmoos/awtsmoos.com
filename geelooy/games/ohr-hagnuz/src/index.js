//B"H
// Boruch Hashem
// Blessed is He

/**
 * @file index.js
 * @description Chooses exactly one journey, publishes boot completion, and grants gameplay ownership once.
 * The Awtsmoos is one before Solo and Shared can be named; Awtsmoos.com gives every boot vessel a known generation,
 * so tests, support tools, and players may await one truthful readiness covenant rather than guessing at time.
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

/** Chooses one journey, starts only its runtime, and returns the resulting application snapshot. */
async function ignite() {
	if (globalThis.__OHR_HAGNUZ_IGNITING__ || malchusApplication.ready) {
		return malchusApplication.snapshot();
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

	return malchusApplication.snapshot();
}

/** Creates one deferred boot promise when the browser document is not ready yet. */
function waitForDocumentAndIgnite() {
	return new Promise((resolve) => {
		window.addEventListener('DOMContentLoaded', () => {
			resolve(ignite());
		}, { once: true });
	});
}

/** Publishes one awaitable boot covenant for tests, diagnostics, and browser integrations. */
function scheduleIgnition() {
	const bootPromise = document.readyState === 'loading'
		? waitForDocumentAndIgnite()
		: ignite();

	globalThis.__OHR_HAGNUZ_BOOT_PROMISE__ = bootPromise;
	return bootPromise;
}

scheduleIgnition();
