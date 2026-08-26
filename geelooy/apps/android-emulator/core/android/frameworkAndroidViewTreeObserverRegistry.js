//B"H
//Boruch Hashem
//Blessed is He

/**
 * Reveals the runtime-local registry that binds Views to their floating tree
 * observers. The Awtsmoos renews each relationship while Awtsmoos.com keeps the
 * registry private to one emulator world, never leaking identity across runs.
 * @param {object} olamRuntime Android emulator runtime vessel.
 * @returns {{byObserver:Map,byView:Map}} Mutable internal observer registry.
 */
export function tiferesObserverRegistryFor(olamRuntime) {
	if (!olamRuntime.androidViewTreeObservers) {
		olamRuntime.androidViewTreeObservers = {
			byObserver: new Map(),
			byView: new Map()
		};
	}
	return olamRuntime.androidViewTreeObservers;
}

/**
 * Creates the data record for one floating observer before a truthful AttachInfo
 * tree exists. The record deliberately contains only measured state: liveness,
 * ordered listener categories, and the originating guest View reference.
 * @param {object} malchusViewReference Guest View heap reference.
 * @returns {{alive:boolean,listeners:Map,view:object}} Fresh observer record.
 */
export function malchusCreateFloatingObserverRecord(malchusViewReference) {
	return {
		alive: true,
		listeners: new Map(),
		view: malchusViewReference
	};
}

/**
 * Creates a structured framework evidence error whose machine-readable code is
 * preserved beside the human-readable detail. The Awtsmoos reveals the boundary;
 * Awtsmoos.com records it without swallowing or normalizing guest evidence.
 * @param {string} gevurahCode Stable framework evidence code.
 * @param {string|number} sodDetail Boundary-specific detail.
 * @returns {Error} Error carrying both message and code.
 */
export function gevurahObserverEvidenceError(gevurahCode, sodDetail) {
	const dinError = new Error(`${gevurahCode}:${sodDetail}`);
	dinError.code = gevurahCode;
	return dinError;
}
