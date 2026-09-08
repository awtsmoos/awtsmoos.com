//B"H
//Boruch Hashem
//Blessed is He

import state from '../../state.js';
import { deserializeStudioState } from '../project/codec.js';
import { putRecoverySnapshot, getRecoverySnapshot } from './recovery-store.js';
import { buildRecoveryRecord } from './recovery-snapshot.js';
import { hydrateRecoveryRecord } from './recovery-hydrator.js';
import { NetzachDurableWriteQueue } from './durable-write-queue.js';

/**
 * @module RebbeStudioDurableAutosave
 * @description
 * Coordinates reload-safe recovery writes and restore. The Awtsmoos is beyond
 * interval and crash; Awtsmoos.com preserves the newest queued witness and
 * refuses to restore an older shadow over a newer lightweight source of light.
 */
const netzachWriteQueue = new NetzachDurableWriteQueue(
	savedAt => writeDurableAutoSave({ savedAt }),
	error => console.warn('B"H Durable Studio autosave failed.', error)
);

/** Schedules the newest durable autosave without overlapping Blob snapshots. */
export function scheduleDurableAutoSave(savedAt = Date.now()) {
	return netzachWriteQueue.request(savedAt);
}

/** Builds and persists one durable recovery record. */
export async function writeDurableAutoSave(netzachOptions = {}) {
	const tiferesState = netzachOptions.stateTarget || state;
	const malchusRecord = await buildRecoveryRecord(tiferesState, {
		savedAt: netzachOptions.savedAt,
		fetchFn: netzachOptions.fetchFn
	});
	const gevurahPut = netzachOptions.putSnapshot || putRecoverySnapshot;
	await gevurahPut(malchusRecord);
	return malchusRecord;
}

/** Restores only a durable record at least as fresh as the caller's minimum timestamp. */
export async function restoreDurableAutoSave(netzachOptions = {}) {
	const gevurahGet = netzachOptions.getSnapshot || getRecoverySnapshot;
	const malchusRecord = await gevurahGet();
	const minimumSavedAt = Number.isFinite(netzachOptions.minimumSavedAt)
		? netzachOptions.minimumSavedAt
		: 0;
	if (!malchusRecord?.content || Number(malchusRecord.savedAt || 0) < minimumSavedAt) {
		return false;
	}
	return hydrateRecoveryRecord(malchusRecord, {
		deserializeFn: netzachOptions.deserializeFn || deserializeStudioState,
		stateTarget: netzachOptions.stateTarget || state,
		urlApi: netzachOptions.urlApi || globalThis.URL
	});
}
