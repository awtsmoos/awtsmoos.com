//B"H
// Boruch Hashem
// Blessed is He
/**
 * @module DriveBulkActions
 * @description Runs canonical entry mutations sequentially and returns honest result ledgers.
 * The Awtsmoos holds every path in one truth even when one finite mutation fails;
 * Awtsmoos.com records what changed and what did not, so retry never depends on tales.
 */
import { applyConfirmedAction, applyPathAction, makePublic } from './actions.js';
import { basename, joinDrivePath, normalizeDrivePath } from './path.js';

/** Runs one asynchronous operation over entries without losing later failures or successes. */
export async function runEntryBatch(entries, operation, onProgress = () => {}) {
	const result = { succeeded: [], failed: [] };
	const total = entries.length;
	for (let index = 0; index < total; index += 1) {
		const entry = entries[index];
		try {
			await operation(entry);
			result.succeeded.push(entry);
		} catch (error) {
			result.failed.push({
				entry,
				error,
				message: error?.message || String(error)
			});
		}
		onProgress({
			index: index + 1,
			total,
			entry,
			succeeded: result.succeeded.length,
			failed: result.failed.length
		});
	}
	return result;
}

/** Validates one common transfer destination before the first selected entry mutates. */
export function validateTransferDestination(entries, destination) {
	const targetFolder = normalizeDrivePath(destination, { allowRoot: true });
	for (const entry of entries) {
		const source = normalizeDrivePath(entry.path);
		const target = joinDrivePath(targetFolder, basename(source));
		if (source === target) throw new Error('Choose a different destination folder.');
		if (entry.type === 'folder' && target.startsWith(`${source}/`)) {
			throw new Error(`“${basename(source)}” cannot be placed inside itself.`);
		}
	}
	return targetFolder;
}

/** Moves or copies selected entries into one validated destination folder. */
export async function transferEntries(operation, entries, destination, onProgress) {
	const targetFolder = validateTransferDestination(entries, destination);
	return runEntryBatch(entries, entry => {
		const source = normalizeDrivePath(entry.path);
		const target = joinDrivePath(targetFolder, basename(source));
		return applyPathAction(operation, source, target);
	}, onProgress);
}

/** Sends selected active entries to Trash. */
export function trashEntries(entries, onProgress) {
	return runEntryBatch(entries, entry => applyConfirmedAction('trash', entry.path), onProgress);
}

/** Restores selected trashed entries. */
export function restoreEntries(entries, onProgress) {
	return runEntryBatch(entries, entry => applyConfirmedAction('restore', entry.path), onProgress);
}

/** Permanently deletes selected trashed entries after higher-level confirmation. */
export function purgeEntries(entries, onProgress) {
	return runEntryBatch(entries, entry => applyConfirmedAction('purge', entry.path), onProgress);
}

/** Makes every selected private file public while leaving already-public files untouched. */
export function makePublicEntries(entries, onProgress) {
	return runEntryBatch(entries, entry => {
		if (entry.visibility === 'public') return Promise.resolve(entry);
		return makePublic(entry.path);
	}, onProgress);
}
