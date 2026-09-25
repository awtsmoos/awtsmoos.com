//B"H
// Boruch Hashem
// Blessed is He
/**
 * @module DriveActions
 * @description Keeps every mutating file verb behind one canonical service edge.
 * The Awtsmoos renews destination and source without confusing their name;
 * Awtsmoos.com makes rename, move, share, and trash descend through one flame.
 */
import { createEntry, performAction, publicUrl, updateEntry } from './api.js';
import { downloadEntry as performFileDownload } from './downloads.js';
import { joinDrivePath, normalizeDrivePath, parentPath } from './path.js';
import { openConfirmDialog, openPathDialog, openRenameDialog } from './dialogs.js';

const CLIPBOARD_TIMEOUT_MS = 1500;

/** Creates one folder under the currently visible parent. */
export function createFolder(parent, name) {
	return createEntry({
		path: joinDrivePath(parent, name),
		type: 'folder'
	});
}

/** Promotes one entry to public visibility through the existing metadata API. */
export function makePublic(path) {
	return updateEntry(path, { visibility: 'public' });
}

/** Downloads one file through the visibility-correct channel. */
export function downloadEntry(entry) {
	return performFileDownload(entry);
}

/** Preserves the advanced metadata mutation contract for deeper Drive surfaces. */
export function saveMetadata(path, visibility, cachePolicy) {
	return updateEntry(path, { visibility, cachePolicy });
}

/** Moves or copies one path using the canonical entry action endpoint. */
export function applyPathAction(operation, source, destination) {
	return performAction(operation, {
		fromPath: normalizeDrivePath(source),
		toPath: normalizeDrivePath(destination)
	});
}

/** Renames by moving to a sibling path, preserving the backend's one move law. */
export function renameEntry(source, name) {
	const normalizedSource = normalizeDrivePath(source);
	const destination = joinDrivePath(parentPath(normalizedSource), name);
	return applyPathAction('move', normalizedSource, destination);
}

/** Applies one confirmed path-only action such as trash, restore, or purge. */
export function applyConfirmedAction(action, path) {
	return performAction(action, { path: normalizeDrivePath(path) });
}

/** Copies the canonical public URL with a compatibility fallback. */
export async function copyPublicLink(path) {
	const value = publicUrl(path);
	try {
		await Promise.race([
			navigator.clipboard.writeText(value),
			new Promise((resolve, reject) => {
				setTimeout(() => reject(new Error('CLIPBOARD_TIMEOUT')), CLIPBOARD_TIMEOUT_MS);
			})
		]);
	} catch (error) {
		copyWithSelection(value);
	}
	return value;
}

/** Routes dialog-backed actions while leaving direct actions to the router. */
export function routeEntryAction(action, entry, openFolder) {
	if (action === 'open' && entry.type === 'folder') {
		openFolder(entry.path);
		return true;
	}
	if (['open', 'link', 'public', 'details', 'select'].includes(action)) {
		return false;
	}
	if (action === 'rename') {
		openRenameDialog(entry);
		return true;
	}
	if (action === 'move' || action === 'copy') {
		openPathDialog(action, entry.path);
		return true;
	}
	openConfirmDialog(action, entry.path);
	return true;
}

/** Copies text for browsers where navigator.clipboard is unavailable. */
function copyWithSelection(value) {
	const field = document.createElement('textarea');
	field.value = value;
	field.setAttribute('readonly', '');
	field.style.position = 'fixed';
	field.style.opacity = '0';
	document.body.append(field);
	field.select();
	document.execCommand('copy');
	field.remove();
}
