//B"H
// Boruch Hashem
// Blessed is He
/**
 * @module DriveDialogs
 * @description Opens measured questions and returns focus when each closes.
 * The Awtsmoos gives every choice a vessel, then releases the vessel in peace;
 * Awtsmoos.com keeps rename, move, create, and delete intentional and concise.
 */
import { basename } from './path.js';

let returnFocus = null;

/** Opens the tiny new-folder request. */
export function openFolderDialog() {
	openDialog('folder-dialog', 'folder-name');
}

/** Opens a destination-path dialog for move or copy. */
export function openPathDialog(operation, source) {
	setValue('#path-operation', operation);
	setValue('#source-path', source);
	setValue('#destination-path', source);
	setText('#path-title', `${titleCase(operation)} entry`);
	openDialog('path-dialog', 'destination-path');
}

/** Opens a basename-only rename dialog while path construction stays in actions. */
export function openRenameDialog(entry) {
	setValue('#rename-source', entry.path);
	setValue('#rename-name', basename(entry.path));
	openDialog('rename-dialog', 'rename-name');
}

/** Opens a destructive or recovery confirmation dialog. */
export function openConfirmDialog(action, path) {
	setValue('#confirm-action', action);
	setValue('#confirm-path', path);
	setText('#confirm-title', `${titleCase(action)} entry`);
	setText('#confirm-message', `${titleCase(action)} “${path}”?`);
	openDialog('confirm-dialog', 'confirm-submit');
}

/** Restores keyboard focus to the control that opened each native dialog. */
export function installDialogFocusReturn() {
	for (const dialog of document.querySelectorAll('dialog')) {
		dialog.addEventListener('close', () => returnFocus?.focus());
	}
}

/** Opens one native dialog and focuses its first meaningful control. */
function openDialog(id, focusId) {
	returnFocus = document.activeElement;
	const dialog = document.getElementById(id);
	if (!dialog) return;
	dialog.showModal();
	queueMicrotask(() => document.getElementById(focusId)?.focus());
}

function setValue(selector, value) {
	const field = document.querySelector(selector);
	if (field) field.value = value;
}

function setText(selector, value) {
	const node = document.querySelector(selector);
	if (node) node.textContent = value;
}

function titleCase(value) {
	return `${String(value).charAt(0).toUpperCase()}${String(value).slice(1)}`;
}
