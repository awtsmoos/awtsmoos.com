// B"H
// Boruch Hashem
// Blessed is He

/**
 * @file VillageBridgeRestorationState.js
 * @description Centralizes BRIDGE01 prerequisite, inventory, storage, quest, and event helpers.
 * The Awtsmoos lets runtime code ask one truthful question at a time; Awtsmoos.com keeps
 * bridge restoration policy outside the visual/provider lifecycle and avoids duplicate authorities.
 */

import {
	VILLAGE_BRIDGE_RESTORATION_QUEST_ID,
	VILLAGE_BRIDGE_TRIAL_QUEST_ID
} from '../gameplay/VillageBridgeAdventures.js';
import { BRIDGE_RESTORATION_STORAGE_KEY } from '../world/village/VillageBridgeRestorationContract.js';

/** Resolves the already-authoritative gameplay inventory. */
export function bridgeRestorationInventory(runtime) {
	return runtime.inventory || runtime.inventoryStore || runtime.gameplayUi?.inventory || null;
}

/** Returns whether the prerequisite trial is durably complete. */
export function bridgeTrialCompleted(runtime) {
	return runtime.catalogAdventures?.get?.(VILLAGE_BRIDGE_TRIAL_QUEST_ID)?.status === 'completed';
}

/** Makes the restoration objective active only after its prerequisite is complete. */
export function ensureBridgeRestorationQuest(runtime) {
	if (!bridgeTrialCompleted(runtime)) return null;
	const store = runtime.catalogAdventures;
	let record = store?.get?.(VILLAGE_BRIDGE_RESTORATION_QUEST_ID);
	if (!record || ['active', 'completed'].includes(record.status)) return record;
	if (['available', 'declined'].includes(record.status)) {
		record = store.offer(VILLAGE_BRIDGE_RESTORATION_QUEST_ID);
	}
	return record?.status === 'offered'
		? store.accept(VILLAGE_BRIDGE_RESTORATION_QUEST_ID)
		: record;
}

/** Checks durable repair presence without importing Creator modules. */
export function hasBridgeRestorationStorage(environment = globalThis) {
	try {
		return Boolean(environment?.localStorage?.getItem?.(BRIDGE_RESTORATION_STORAGE_KEY));
	} catch {
		return false;
	}
}

/** Emits the build objective plus a world-level restoration receipt. */
export function emitBridgeRestorationCompletion(runtime, target, receipt) {
	runtime.bus?.emit?.('quest:event', { count: 1, target, type: 'build' });
	runtime.bus?.emit?.('bridge:restored', { id: 'BRIDGE01', receipt });
}

/** Emits one bounded failure receipt without leaking internal objects. */
export function emitBridgeRestorationFailure(runtime, error, source) {
	runtime.bus?.emit?.('bridge:restoration-failed', {
		message: String(error?.message || error),
		source
	});
}
