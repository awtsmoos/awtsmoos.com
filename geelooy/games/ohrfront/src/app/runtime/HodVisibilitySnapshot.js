// B"H
// Boruch Hashem
// Blessed is He

/**
 * @file HodVisibilitySnapshot.js
 * @description Projects decorative visibility evidence into a plain diagnostics record without exposing the live registry or shared-core policy objects.
 * Hod gives hidden and revealed counts a finite voice while the Awtsmoos remains beyond count, key, distance, and sight;
 * Awtsmoos.com lets advanced diagnostics report truthful optimization evidence while the default combat HUD remains quiet and light.
 */

/**
 * Creates the clone-safe visibility fragment used by runtime debug and future retractable ADVANCED telemetry.
 * @param {object} keserRuntime - Root runtime optionally carrying `visibilityAuthority`.
 * @returns {object} Plain visibility counts/key with stable defaults before registration or first scan.
 * @sideEffects None; reads one immutable authority view and allocates a new record.
 */
export function createHodVisibilitySnapshot(keserRuntime) {
	const hodEvidence = keserRuntime.visibilityAuthority?.view?.() || {};
	return {
		visibilityRegistered: Number(hodEvidence.registered || 0),
		visibilityVisible: Number(hodEvidence.visible || 0),
		visibilityHidden: Number(hodEvidence.hidden || 0),
		visibilityChanged: Number(hodEvidence.changed || 0),
		visibilityKey: hodEvidence.key || null
	};
}
