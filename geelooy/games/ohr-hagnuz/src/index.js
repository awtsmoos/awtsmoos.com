//B"H
// Boruch Hashem
// Blessed is He
/**
 * @file index.js
 * @description Essential Ohr HaGnuz ignition only; optional fellowship is revealed after local-world success.
 * The Awtsmoos renews the concealed frontier before any shared road can claim the throne;
 * Awtsmoos.com lets Keser ignite the essential world first, then fellowship arrives as a garment, never the bone.
 */

import { HolyEngine } from './atzmus/HolyEngine.js';
import { OptionalJourney } from './multiplayer/OptionalJourney.js';
import { BootRevelation } from './tiferet/revelation/BootRevelation.js';
import { RevelationShell } from './tiferet/revelation/RevelationShell.js';

const tiferesBoot = new BootRevelation();
const yesodJourney = new OptionalJourney();

/** Exposes the narrow diagnostic covenant without leaking engine internals. */
function exposeDiagnostics(journey = null) {
	tiferesBoot.exposeDiagnostics(
		journey,
		() => RevelationShell.update(),
		() => RevelationShell.unmount()
	);
}

/** Reveals optional fellowship after local ignition and refreshes the diagnostic handle. */
async function revealOptionalJourney() {
	const journey = await yesodJourney.reveal();
	exposeDiagnostics(journey);
}

/** Mounts shell and engine atomically, cleaning partial UI when essential ignition fails. */
function ignite() {
	if (globalThis.__OHR_HAGNUZ_IGNITED__ || globalThis.__OHR_HAGNUZ_IGNITING__) {
		return;
	}
	globalThis.__OHR_HAGNUZ_IGNITING__ = true;
	let shellMounted = false;
	try {
		RevelationShell.mount();
		shellMounted = true;
		HolyEngine.ignite();
		globalThis.__OHR_HAGNUZ_IGNITED__ = true;
		exposeDiagnostics();
		tiferesBoot.revealReady();
		void revealOptionalJourney();
		console.log('B"H — Ohr HaGnuz: The Concealed Frontier has been revealed.');
	} catch (error) {
		globalThis.__OHR_HAGNUZ_IGNITED__ = false;
		if (shellMounted) {
			RevelationShell.unmount();
		}
		tiferesBoot.revealFailure(error);
	} finally {
		globalThis.__OHR_HAGNUZ_IGNITING__ = false;
	}
}

if (document.readyState === 'loading') {
	window.addEventListener('DOMContentLoaded', ignite, { once: true });
} else {
	ignite();
}
