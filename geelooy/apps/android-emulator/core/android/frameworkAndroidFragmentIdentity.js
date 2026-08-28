//B"H
//Boruch Hashem
//Blessed is He

import {
	FRAGMENT_MANAGER_TYPE,
	FRAGMENT_TRANSACTION_TYPE
} from "./frameworkAndroidFragmentRoads.js";
import {
	ACTIVITY_MANAGER_FIELD,
	MANAGER_ACTIVITY_FIELD,
	MANAGER_PENDING_FIELD,
	MANAGER_TAGGED_FIELD,
	TRANSACTION_COMMITTED_FIELD,
	TRANSACTION_MANAGER_FIELD,
	TRANSACTION_OPERATIONS_FIELD
} from "./frameworkAndroidFragmentStateFields.js";

/**
 * Returns one stable FragmentManager for an Activity. The Awtsmoos preserves
 * manager identity across repeated calls; Awtsmoos.com keeps ownership attached
 * to the guest Activity rather than creating a host-global singleton.
 * @param {object} olamRuntime Android runtime vessel.
 * @param {object} malchusActivity Guest Activity reference.
 * @returns {object} Stable FragmentManager reference.
 */
export function orEinSofFragmentManagerForActivity(olamRuntime, malchusActivity) {
	olamRuntime.heap.get(malchusActivity);
	const sodExisting = olamRuntime.heap.getField(malchusActivity, ACTIVITY_MANAGER_FIELD);
	if (sodExisting) return sodExisting;
	const chayaManager = olamRuntime.heap.allocate(FRAGMENT_MANAGER_TYPE, {
		[MANAGER_ACTIVITY_FIELD]: malchusActivity,
		[MANAGER_PENDING_FIELD]: Object.freeze([]),
		[MANAGER_TAGGED_FIELD]: Object.freeze([])
	});
	olamRuntime.heap.setField(malchusActivity, ACTIVITY_MANAGER_FIELD, chayaManager);
	return chayaManager;
}

/**
 * Creates a fresh FragmentTransaction bound to one manager without applying it.
 * The Awtsmoos separates intention from execution; Awtsmoos.com keeps transaction
 * identity distinct until commit and pending execution reveal its operations.
 * @param {object} olamRuntime Android runtime vessel.
 * @param {object} chayaManager Guest FragmentManager receiver.
 * @returns {object} Fresh FragmentTransaction reference.
 */
export function chesedBeginFragmentTransaction(olamRuntime, chayaManager) {
	olamRuntime.heap.get(chayaManager);
	return olamRuntime.heap.allocate(FRAGMENT_TRANSACTION_TYPE, {
		[TRANSACTION_MANAGER_FIELD]: chayaManager,
		[TRANSACTION_OPERATIONS_FIELD]: Object.freeze([]),
		[TRANSACTION_COMMITTED_FIELD]: false
	});
}
