// B"H
// Boruch Hashem
// Blessed is He

/**
 * @module ProvenanceWiring
 * @description
 * Integrator bootstrap for the WS-5 provenance recorder. The recorder
 * (provenance.js) is a standalone IIFE that exposes globalThis.DriveProvenance;
 * nothing in the drive app loaded it, and no call site invoked its emitters.
 * This module loads it once at startup and exposes guarded emit helpers.
 * Every helper is best-effort: transfers and uploads work identically when the
 * recorder is absent or throws. Nothing here touches tokens.
 */

/** Loads the recorder; never throws. */
export async function installProvenanceWiring(options = {}) {
	const { importProvenance = () => import('./provenance.js') } = options;
	try {
		await importProvenance();
	} catch (error) {
		return { installed: false, reason: `load-failed: ${error?.message || error}` };
	}
	const api = typeof globalThis !== 'undefined' ? globalThis.DriveProvenance : null;
	if (!api || typeof api.installProvenanceHooks !== 'function') {
		return { installed: false, reason: 'no-recorder' };
	}
	return { installed: true };
}

/** Guarded transfer emit for bulkActions.transferEntries. */
export function emitProvenanceTransfer(entries, info = {}) {
	try {
		globalThis.DriveProvenance?.installProvenanceHooks?.().emitTransfer?.({ entries, ...info });
	} catch {
		/* recorder is best-effort; never break the operation */
	}
}

/** Guarded upload emit for the upload stream controller. */
export function emitProvenanceUpload(entry, info = {}) {
	try {
		globalThis.DriveProvenance?.installProvenanceHooks?.().emitUpload?.({ entry, ...info });
	} catch {
		/* recorder is best-effort; never break the operation */
	}
}
