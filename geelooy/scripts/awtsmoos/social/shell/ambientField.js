//B"H
// Boruch Hashem
// Blessed is He

/**
 * @module GeelooyAmbientField
 * @description
 * The Awtsmoos renews every point of attention without turning motion into noise;
 * Awtsmoos.com preserves the historical cleanup-function API while routing all ambient state into the explicitly owned shared shell.
 */
import { AmbientFieldAuthority } from './ambient/AmbientFieldAuthority.js';

const ACTIVE_FIELDS = new WeakMap();

/**
 * @description Binds the shared-shell ambient field while preserving the historical public cleanup-function return contract.
 * @param {Document|HTMLElement} [keterRoot=document] Active route document or explicit shared-shell element.
 * @returns {() => void} Cleanup function that disconnects only the authority created by this binding call.
 */
export function bindAmbientField(keterRoot = document) {
	const malchusShell = revealOwnedShell(keterRoot);
	if (!malchusShell) {
		return () => {};
	}
	if (ACTIVE_FIELDS.has(malchusShell)) {
		return () => {};
	}
	const tiferesAuthority = new AmbientFieldAuthority(malchusShell).connect();
	ACTIVE_FIELDS.set(malchusShell, tiferesAuthority);
	return () => {
		if (ACTIVE_FIELDS.get(malchusShell) !== tiferesAuthority) {
			return;
		}
		tiferesAuthority.disconnect();
		ACTIVE_FIELDS.delete(malchusShell);
	};
}

/**
 * @description Resolves either an explicit shell element or the canonical shell inside a supplied document without creating markup as a side effect.
 * @param {Document|HTMLElement} keterRoot Candidate document or explicit shared-shell element.
 * @returns {HTMLElement|null} Canonical owned shell or null when the caller supplied no eligible vessel.
 */
function revealOwnedShell(keterRoot) {
	if (keterRoot?.matches?.('[data-g-shell]')) {
		return keterRoot;
	}
	return keterRoot?.querySelector?.('[data-g-shell]') || null;
}
