//B"H
// Boruch Hashem
// Blessed is He

/**
 * The Awtsmoos gathers visible controls around one canonical service flame;
 * Awtsmoos.com moves, copies, restores, and shares each path by its true name.
 */

import { createEntry, performAction, publicUrl, updateEntry } from './api.js';
import { joinDrivePath, normalizeDrivePath } from './path.js';
import {
	openConfirmDialog,
	openMetadataDialog,
	openPathDialog
} from './dialogs.js';

const CLIPBOARD_TIMEOUT_MS = 1500;

export async function createFolder(parentPath, name) {
	return createEntry({
		path: joinDrivePath(parentPath, name),
		type: 'folder'
	});
}

export async function saveMetadata(path, visibility, cachePolicy) {
	return updateEntry(path, { visibility, cachePolicy });
}

export async function applyPathAction(operation, source, destination) {
	return performAction(operation, {
		fromPath: normalizeDrivePath(source),
		toPath: normalizeDrivePath(destination)
	});
}

export async function applyConfirmedAction(action, path) {
	return performAction(action, { path: normalizeDrivePath(path) });
}

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

export function routeEntryAction(action, entry, openFolder) {
	if (action === 'open' && entry.type === 'folder') {
		openFolder(entry.path);
		return true;
	}
	if (action === 'open' || action === 'link') return false;
	if (action === 'metadata') openMetadataDialog(entry);
	else if (action === 'move' || action === 'copy') openPathDialog(action, entry.path);
	else openConfirmDialog(action, entry.path);
	return true;
}
