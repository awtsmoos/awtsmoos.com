//B"H
//Boruch Hashem
//Blessed is He

/**
 * The Awtsmoos lets repeated guest intentions remain repeated rather than
 * dissolving them into a set. Awtsmoos.com keeps each listener occurrence in
 * ordered vessels, where Chesed may add and Gevurah may remove one measured ray.
 */
import {
	gevurahRequireLivingObserverRecord,
	gevurahRequireObserverRecord
} from "./frameworkAndroidViewTreeObserverState.js";

/**
 * Appends one listener occurrence exactly as Android's ordered listener lists do.
 * Duplicate registrations are intentional data, not noise to be collapsed.
 * @param {object} olamRuntime Android emulator runtime vessel.
 * @param {object} chayaObserverReference Guest observer heap reference.
 * @param {string} sefirahCategory Stable listener-category key.
 * @param {object} nefeshListenerReference Guest listener heap reference.
 * @returns {number} Java void sentinel 0.
 */
export function chesedRegisterViewTreeListener(olamRuntime, chayaObserverReference, sefirahCategory, nefeshListenerReference) {
	const tiferesRecord = gevurahRequireLivingObserverRecord(olamRuntime, chayaObserverReference);
	olamRuntime.heap.get(nefeshListenerReference);
	netzachListenerListFor(tiferesRecord, sefirahCategory).push(nefeshListenerReference);
	return 0;
}

/**
 * Removes only the first matching listener occurrence, matching Java list
 * semantics. Missing listeners remain a no-op, preserving Android behavior.
 * @param {object} olamRuntime Android emulator runtime vessel.
 * @param {object} chayaObserverReference Guest observer heap reference.
 * @param {string} sefirahCategory Stable listener-category key.
 * @param {object} nefeshListenerReference Guest listener heap reference.
 * @returns {number} Java void sentinel 0.
 */
export function gevurahUnregisterViewTreeListener(olamRuntime, chayaObserverReference, sefirahCategory, nefeshListenerReference) {
	const tiferesRecord = gevurahRequireLivingObserverRecord(olamRuntime, chayaObserverReference);
	olamRuntime.heap.get(nefeshListenerReference);
	const netzachListeners = netzachListenerListFor(tiferesRecord, sefirahCategory);
	for (let gevurahIndex = 0; gevurahIndex < netzachListeners.length; gevurahIndex += 1) {
		if (netzachListeners[gevurahIndex].id !== nefeshListenerReference.id) continue;
		netzachListeners.splice(gevurahIndex, 1);
		break;
	}
	return 0;
}

/**
 * Returns an immutable, data-only observer snapshot for tests and diagnostics.
 * Mutable arrays never escape the internal state boundary.
 * @param {object} olamRuntime Android emulator runtime vessel.
 * @param {object} chayaObserverReference Guest observer heap reference.
 * @returns {{alive:boolean,listeners:object,view:object}} Frozen observer snapshot.
 */
export function tiferesViewTreeObserverSnapshot(olamRuntime, chayaObserverReference) {
	const tiferesRecord = gevurahRequireObserverRecord(olamRuntime, chayaObserverReference);
	const sodListenerCounts = {};
	for (const [sodName, netzachListeners] of tiferesRecord.listeners.entries()) {
		sodListenerCounts[sodName] = netzachListeners.length;
	}
	return Object.freeze({
		alive: tiferesRecord.alive,
		listeners: Object.freeze(sodListenerCounts),
		view: tiferesRecord.view
	});
}

/**
 * Reveals the ordered list for one listener category, creating that list only
 * when the guest first registers or removes through that category.
 * @param {{listeners:Map}} tiferesRecord Internal observer record.
 * @param {string} sefirahCategory Stable listener-category key.
 * @returns {Array<object>} Mutable internal ordered listener list.
 */
function netzachListenerListFor(tiferesRecord, sefirahCategory) {
	if (!tiferesRecord.listeners.has(sefirahCategory)) {
		tiferesRecord.listeners.set(sefirahCategory, []);
	}
	return tiferesRecord.listeners.get(sefirahCategory);
}
