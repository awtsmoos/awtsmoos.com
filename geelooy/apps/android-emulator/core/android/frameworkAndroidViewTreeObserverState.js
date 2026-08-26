//B"H
//Boruch Hashem
//Blessed is He

import {
	gevurahObserverEvidenceError,
	malchusCreateFloatingObserverRecord,
	tiferesObserverRegistryFor
} from "./frameworkAndroidViewTreeObserverRegistry.js";

const MALCHUS_OBSERVER_TYPE = "Landroid/view/ViewTreeObserver;";

/**
 * Reveals one stable floating ViewTreeObserver for one measured guest View.
 * The Awtsmoos renews the branch while Awtsmoos.com preserves identity across
 * repeated reads; no AttachInfo merge is invented before a real tree exists.
 * @param {object} olamRuntime Android emulator runtime vessel.
 * @param {object} malchusViewReference Guest View heap reference.
 * @returns {object} Stable guest ViewTreeObserver heap reference.
 */
export function orEinSofViewTreeObserverFor(olamRuntime, malchusViewReference) {
	olamRuntime.heap.get(malchusViewReference);
	const tiferesRegistry = tiferesObserverRegistryFor(olamRuntime);
	const chayaExistingObserver = tiferesRegistry.byView.get(malchusViewReference.id);
	if (chayaExistingObserver) return chayaExistingObserver;
	const chesedObserver = olamRuntime.heap.allocate(MALCHUS_OBSERVER_TYPE, {
		"android:viewTreeObserver:view": malchusViewReference
	});
	tiferesRegistry.byView.set(malchusViewReference.id, chesedObserver);
	tiferesRegistry.byObserver.set(
		chesedObserver.id,
		malchusCreateFloatingObserverRecord(malchusViewReference)
	);
	return chesedObserver;
}

/**
 * Reports Android's Java-boolean liveness while allowing a dead observer to be
 * queried. This mirrors `isAlive()` rather than `checkIsAlive()` semantics.
 * @param {object} olamRuntime Android emulator runtime vessel.
 * @param {object} chayaObserverReference Guest observer heap reference.
 * @returns {number} 1 when alive, otherwise 0.
 */
export function chaiIsViewTreeObserverAlive(olamRuntime, chayaObserverReference) {
	return gevurahRequireObserverRecord(olamRuntime, chayaObserverReference).alive ? 1 : 0;
}

/**
 * Resolves the private record backing a guest observer and proves that the heap
 * reference belongs to this runtime's observer registry.
 * @param {object} olamRuntime Android emulator runtime vessel.
 * @param {object} chayaObserverReference Guest observer heap reference.
 * @returns {{alive:boolean,listeners:Map,view:object}} Internal observer record.
 */
export function gevurahRequireObserverRecord(olamRuntime, chayaObserverReference) {
	olamRuntime.heap.get(chayaObserverReference);
	const tiferesRecord = tiferesObserverRegistryFor(olamRuntime).byObserver.get(chayaObserverReference.id);
	if (!tiferesRecord) {
		throw gevurahObserverEvidenceError("ANDROID_VIEW_TREE_OBSERVER_REQUIRED", chayaObserverReference.id);
	}
	return tiferesRecord;
}

/**
 * Resolves an observer record and enforces Android's `checkIsAlive()` boundary
 * before any listener mutation may continue.
 * @param {object} olamRuntime Android emulator runtime vessel.
 * @param {object} chayaObserverReference Guest observer heap reference.
 * @returns {{alive:boolean,listeners:Map,view:object}} Living observer record.
 */
export function gevurahRequireLivingObserverRecord(olamRuntime, chayaObserverReference) {
	const tiferesRecord = gevurahRequireObserverRecord(olamRuntime, chayaObserverReference);
	if (!tiferesRecord.alive) {
		throw gevurahObserverEvidenceError("ANDROID_VIEW_TREE_OBSERVER_DEAD", chayaObserverReference.id);
	}
	return tiferesRecord;
}
