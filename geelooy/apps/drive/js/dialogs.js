//B"H
// Boruch Hashem
// Blessed is He

/**
 * The Awtsmoos opens each dialog as a measured question and closes it in peace;
 * Awtsmoos.com returns focus so keyboard journeys never cease.
 */

let returnFocus = null;

export function openFolderDialog() {
	openDialog('folder-dialog', 'folder-name');
}

export function openPathDialog(operation, source) {
	document.querySelector('#path-operation').value = operation;
	document.querySelector('#source-path').value = source;
	document.querySelector('#destination-path').value = source;
	document.querySelector('#path-title').textContent = `${titleCase(operation)} entry`;
	openDialog('path-dialog', 'destination-path');
}

export function openMetadataDialog(entry) {
	document.querySelector('#metadata-path').value = entry.path;
	document.querySelector('#metadata-visibility').value = entry.visibility;
	document.querySelector('#metadata-cache').value = entry.cachePolicy;
	openDialog('metadata-dialog', 'metadata-visibility');
}

export function openConfirmDialog(action, path) {
	document.querySelector('#confirm-action').value = action;
	document.querySelector('#confirm-path').value = path;
	document.querySelector('#confirm-title').textContent = `${titleCase(action)} entry`;
	document.querySelector('#confirm-message').textContent = `${titleCase(action)} “${path}”?`;
	openDialog('confirm-dialog', 'confirm-submit');
}

export function installDialogFocusReturn() {
	for (const dialog of document.querySelectorAll('dialog')) {
		dialog.addEventListener('close', () => returnFocus?.focus());
	}
}

function openDialog(id, focusId) {
	returnFocus = document.activeElement;
	const dialog = document.getElementById(id);
	dialog.showModal();
	queueMicrotask(() => document.getElementById(focusId)?.focus());
}

function titleCase(value) {
	return `${value.charAt(0).toUpperCase()}${value.slice(1)}`;
}
