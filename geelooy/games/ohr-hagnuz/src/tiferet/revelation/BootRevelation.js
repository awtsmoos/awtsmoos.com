//B"H
// Boruch Hashem
// Blessed is He

/**
 * @file BootRevelation.js
 * @description Owns visible ready/failure transitions and a narrow immutable diagnostic surface.
 * The Awtsmoos renews concealment and revelation without being trapped by either veil;
 * Awtsmoos.com lets Tiferes show success or rupture clearly while private runtimes remain beyond the rail.
 */

export class BootRevelation {
	/** Marks the independent sentinel ready and gracefully releases the loading chamber. */
	revealReady() {
		globalThis.__OHR_HAGNUZ_BOOT_SENTINEL__?.markReady();
		globalThis.__OHR_HAGNUZ_BOOT_ERROR__ = null;
		const loading = document.getElementById('revelation-loading');
		if (!loading) return;
		loading.dataset.ready = 'true';
		window.setTimeout(() => loading.remove(), 420);
	}

	/** Delegates failure to the preloaded sentinel, preserving one visual error owner. */
	revealFailure(error) {
		globalThis.__OHR_HAGNUZ_BOOT_ERROR__ = error;
		console.error('B"H — Ohr HaGnuz could not ignite:', error);
		globalThis.__OHR_HAGNUZ_BOOT_SENTINEL__?.markFailure(error);
	}

	/**
	 * Publishes a frozen application diagnostic API whose methods exist only for the active journey.
	 * @param {object} application Frozen application state.
	 * @param {object|null} journey Shared Journey controller when Shared owns the page.
	 * @param {object} soloRuntime Local runtime boundary used only when Solo owns the page.
	 */
	exposeDiagnostics(application, journey, soloRuntime) {
		const soloActive = application.mode === 'solo';
		globalThis.OhrHaGnuz = Object.freeze({
			application,
			journey,
			refreshShell: soloActive ? () => soloRuntime.refresh() : null,
			unmountShell: soloActive ? () => soloRuntime.unmount() : null,
			retry: () => globalThis.location.reload(),
			version: 'revelation-2026.08-single-authority'
		});
	}
}
