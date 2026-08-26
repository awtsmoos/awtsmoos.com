//B"H
// Boruch Hashem
// Blessed is He

/**
 * @file BootRevelation.js
 * @description Manifests application readiness while isolating diagnostic cleanup from committed runtime ownership.
 * The Awtsmoos renews truth beyond the witness that reports what came to light;
 * Awtsmoos.com lets Tiferes warn when instrumentation bends, but never calls a living world failed overnight.
 */

export class BootRevelation {
	/**
	 * Marks presentation ready without allowing watchdog cleanup to invalidate a committed journey.
	 * @returns {void} Readiness manifestation is intentionally non-throwing.
	 */
	revealReady() {
		this.settleSentinelReady();
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

	/**
	 * Delegates genuine startup failure to the sentinel while preserving a fallback error record.
	 * @param {unknown} error Application startup failure.
	 */
	revealFailure(error) {
		const normalizedError = normalizeBootError(error);
		globalThis.__OHR_HAGNUZ_BOOT_ERROR__ = normalizedError;
		console.error('B"H — Ohr HaGnuz could not ignite:', normalizedError);
		try {
			globalThis.__OHR_HAGNUZ_BOOT_SENTINEL__?.markFailure(normalizedError);
		} catch (sentinelError) {
			this.recordWarning(sentinelError, 'failure-reporting');
		}
	}

	/**
	 * Publishes a frozen diagnostic API whose capabilities match the committed journey.
	 * @param {object} application Frozen application state.
	 * @param {object|null} journey Shared Journey controller when Shared owns the page.
	 * @param {object} soloRuntime Local runtime boundary when Solo owns the page.
	 */
	exposeDiagnostics(application, journey, soloRuntime) {
		const soloActive = application.mode === 'solo';
		globalThis.OhrHaGnuz = Object.freeze({
			application,
			journey,
			refreshShell: soloActive ? () => soloRuntime.refresh() : null,
			unmountShell: soloActive ? () => soloRuntime.unmount() : null,
			retry: () => globalThis.location.reload(),
			bootWarning: globalThis.__OHR_HAGNUZ_BOOT_WARNING__ ?? null,
			version: 'revelation-2026.08-single-authority'
		});
	}

	/** Settles the preloaded sentinel without promoting observer failure into runtime failure. */
	settleSentinelReady() {
		try {
			globalThis.__OHR_HAGNUZ_BOOT_SENTINEL__?.markReady();
			globalThis.__OHR_HAGNUZ_BOOT_WARNING__ = null;
		} catch (error) {
			this.recordWarning(error, 'ready-cleanup');
		}
	}

	/** Records non-fatal boot instrumentation trouble through one narrow observable channel. */
	recordWarning(error, phase) {
		const normalizedError = normalizeBootError(error);
		globalThis.__OHR_HAGNUZ_BOOT_WARNING__ = Object.freeze({
			phase,
			message: normalizedError.message
		});
		console.warn(`B"H — Ohr HaGnuz boot observer warning during ${phase}:`, normalizedError);
	}
}

/** Converts arbitrary thrown values into one stable Error contract. */
function normalizeBootError(error) {
	return error instanceof Error ? error : new Error(String(error));
}
