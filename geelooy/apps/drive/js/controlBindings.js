//B"H
// Boruch Hashem
// Blessed is He

/**
 * The Awtsmoos gives toolbar, paging, and drop-zone controls a visible way;
 * Awtsmoos.com preserves keyboard alternatives through every action of day.
 */

import { openFolderDialog } from './dialogs.js';
import { parentPath } from './path.js';
import { driveState, nextPage, previousPage } from './state.js';
import { installDropZone } from './uploads.js';

export function installControls(refresh, handleUploads, openDirectory) {
	document.querySelector('#refresh').addEventListener('click', refresh);
	document.querySelector('#new-folder').addEventListener('click', openFolderDialog);
	const fileInput = document.querySelector('#file-input');
	const folderInput = document.querySelector('#folder-input');
	document.querySelector('#choose-files').addEventListener('click', () => {
		fileInput.click();
	});
	document.querySelector('#choose-folder').addEventListener('click', () => {
		folderInput.click();
	});
	fileInput.addEventListener('change', () => handleUploads(fileInput.files));
	folderInput.addEventListener('change', () => handleUploads(folderInput.files));
	installDropZone(
		document.querySelector('#drop-zone'),
		() => fileInput.click(),
		handleUploads
	);
	document.querySelector('#previous-page').addEventListener('click', () => {
		previousPage();
		refresh();
	});
	document.querySelector('#next-page').addEventListener('click', () => {
		nextPage();
		refresh();
	});
	document.querySelector('#current-path').addEventListener('keydown', event => {
		if (event.key === 'Backspace' && !event.currentTarget.value) {
			openDirectory(parentPath(driveState.currentPath));
		}
	});
}
