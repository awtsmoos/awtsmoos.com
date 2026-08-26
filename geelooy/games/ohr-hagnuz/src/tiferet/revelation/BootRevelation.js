//B"H
// Boruch Hashem
// Blessed is He
/**
 * @file BootRevelation.js
 * @description Owns visible ready/failure transitions and the compact diagnostic covenant.
 * The Awtsmoos renews concealment and revelation without being trapped by either veil;
 * Awtsmoos.com lets Tiferes show success or rupture clearly, while engine internals remain beyond the rail.
 */

export class BootRevelation {
	/** Marks the independent sentinel ready and gracefully releases the loading chamber. */
	revealReady() {
		globalThis.__OHR_HAGNUZ_BOOT_SENTINEL__?.markReady();
		globalThis.__OHR_HAGNUZ_BOOT_ERROR__ = null;
		const loading = document.getElementById('revelation-loading');
		if (!loading) {
			return;
		}
		loading.dataset.ready = 'true';
		window.setTimeout(() => {
			loading.remove();
		}, 420);
	}

	/** Delegates failure to the preloaded sentinel, preserving one visual error owner. */
	revealFailure(error) {
		globalThis.__OHR_HAGNUZ_BOOT_ERROR__ = error;
		console.error('B"H — Ohr HaGnuz could not ignite:', error);
		globalThis.__OHR_HAGNUZ_BOOT_SENTINEL__?.markFailure(error);
	}

	/**
	 * Exposes a frozen, narrow developer-facing diagnostic surface after core ignition.
	 * @param {object|null} journey Optional journey controller.
	 * @param {Function} refreshShell Shell refresh callback.
	 * @param {Function} unmountShell Shell teardown callback.
	 */
	exposeDiagnostics(journey, refreshShell, unmountShell) {
		globalThis.OhrHaGnuz = Object.freeze({
			journey,
			refreshShell,
			unmountShell,
			retry: () => globalThis.location.reload(),
			version: 'revelation-2026.08-sentinel-road'
		});
	}
}
