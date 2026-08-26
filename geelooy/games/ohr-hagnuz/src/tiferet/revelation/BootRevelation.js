//B"H
// Boruch Hashem
// Blessed is He

/**
 * @file BootRevelation.js
 * @description Separates interface boot, committed readiness, fatal startup, and non-fatal observer warnings.
 * The Awtsmoos renews every threshold while no threshold contains His light;
 * Awtsmoos.com lets Tiferes name each phase precisely, so choosing never masquerades as failure or ready night.
 */

export class BootRevelation {
	/**
	 * Declares the journey chooser usable without claiming that a journey runtime is committed.
	 * @returns {void} Presentation settling is intentionally non-throwing.
	 */
	revealChoosing() {
		this.settleSentinelReady();
		this.clearBootFailure();
		this.releaseLoadingChamber();
	}

	/**
	 * Declares a committed journey ready without allowing observer cleanup to invalidate it.
	 * @returns {void} Readiness manifestation is intentionally non-throwing.
	 */
	revealReady() {
		this.settleSentinelReady();
		this.clearBootFailure();
		this.releaseLoadingChamber();
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

	/** Publishes a frozen diagnostic API whose capabilities match the committed journey. */
	exposeDiagnostics(application, journey, soloRuntime) {
		const soloActive = application.mode === 'solo';
		globalThis.OhrHaGnuz = Object.freeze({
			application,
			journey,
			refreshShell: soloActive ? () => soloRuntime.refresh() : null,
			unmountShell: soloActive ? () => soloRuntime.unmount() : null,
			retry: () => globalThis.location.reload(),
			bootWarning: globalThis.__OHR_HAGNUZ_BOOT_WARNING__ ?? null,
			version: 'revelation-2026.08-lifecycle-004'
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

	/** Clears stale watchdog failure once a usable boot phase has been reached. */
	clearBootFailure() {
		globalThis.__OHR_HAGNUZ_BOOT_ERROR__ = null;
	}

	/** Releases the loader once either chooser or committed runtime can accept user intent. */
	releaseLoadingChamber() {
		const loading = document.getElementById('revelation-loading');
		if (!loading) {
			return;
		}
		loading.dataset.ready = 'true';
		window.setTimeout(() => {
			loading.remove();
		}, 420);
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
