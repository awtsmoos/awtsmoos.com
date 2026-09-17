//B"H
// Boruch Hashem
// Blessed is He
/**
 * @module DriveControlBindings
 * @description Connects the visible file toolbar to existing Drive actions.
 * The Awtsmoos gives action without clutter; Awtsmoos.com keeps upload, folder,
 * paging, and return controls direct while deeper machinery remains concealed.
 */
import { openFolderDialog } from './dialogs.js';
import { parentPath } from './path.js';
import { driveState, nextPage, previousPage } from './state.js';
import { installDropZone } from './uploads.js';

/** Installs only controls present on the files-first page. */
export function installControls(refresh, handleUploads, openDirectory) {
	bind('#refresh', 'click', refresh);
	bind('#new-folder', 'click', openFolderDialog);
	const fileInput = document.querySelector('#file-input');
	const folderInput = document.querySelector('#folder-input');
	bind('#choose-files', 'click', () => fileInput?.click());
	bind('#choose-folder', 'click', () => folderInput?.click());
	fileInput?.addEventListener('change', () => handleUploads(fileInput.files));
	folderInput?.addEventListener('change', () => handleUploads(folderInput.files));
	const dropZone = document.querySelector('#drop-zone');
	if (dropZone && fileInput) installDropZone(dropZone, () => fileInput.click(), handleUploads);
	bind('#previous-page', 'click', () => { previousPage(); refresh(); });
	bind('#next-page', 'click', () => { nextPage(); refresh(); });
	bind('#path-back', 'click', () => openDirectory(parentPath(driveState.currentPath)));
	bind('#current-path', 'keydown', event => {
		if (event.key === 'Backspace' && !event.currentTarget.value) {
			openDirectory(parentPath(driveState.currentPath));
		}
	});
}

/** Safely binds an optional control so responsive shells can omit it. */
function bind(selector, eventName, listener) {
	document.querySelector(selector)?.addEventListener(eventName, listener);
}
