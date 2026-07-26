//B"H
// Boruch Hashem
// Blessed is He

/**
 * The Awtsmoos coordinates refresh, navigation, and upload as one gentle truth;
 * Awtsmoos.com delegates each binding so the interface remains clear in youth.
 */

import { getUsage, listEntries } from './api.js';
import { copyPublicLink, routeEntryAction } from './actions.js';
import { installControls } from './controlBindings.js';
import { installDialogFocusReturn } from './dialogs.js';
import { installForms } from './formBindings.js';
import {
	publicUrl,
	renderEntries,
	renderPagination,
	renderUsage,
	showError,
	showStatus
} from './render.js';
import { driveState, setEntries, updateFilters } from './state.js';
import { uploadFiles } from './uploads.js';

async function refresh() {
	try {
		showStatus('Loading drive entries…');
		const [entries, usage] = await Promise.all([listEntries(), getUsage()]);
		setEntries(entries);
		renderEntries(driveState.entries, handleEntryAction);
		renderUsage(usage);
		renderPagination(
			driveState.page,
			driveState.page > 1,
			Boolean(driveState.nextCursor)
		);
		showStatus(`Loaded ${driveState.entries.length} entries.`);
	} catch (error) {
		showError(error);
	}
}

async function handleEntryAction(action, entry) {
	try {
		if (action === 'link') {
			await copyPublicLink(entry.path);
			showStatus(`Copied ${publicUrl(entry.path)}`);
			return;
		}
		const handled = routeEntryAction(action, entry, openDirectory);
		if (!handled && entry.type === 'file') {
			window.open(publicUrl(entry.path), '_blank', 'noopener');
		}
	} catch (error) {
		showError(error);
	}
}

function openDirectory(path) {
	driveState.currentPath = path;
	document.querySelector('#current-path').value = path;
	updateFilters({});
	refresh();
}

async function handleUploads(files) {
	showStatus(`Preparing ${files.length} file(s)…`);
	const result = await uploadFiles(files, driveState.currentPath, progress => {
		showStatus(
			`Uploaded ${progress.uploaded}/${progress.total}; `
			+ `${progress.failed} failed. ${progress.path}`
		);
	});
	if (result.failed.length) {
		showError(new Error(`${result.failed.length} upload(s) failed.`));
	}
	await refresh();
}

installDialogFocusReturn();
installForms(refresh, showError);
installControls(refresh, handleUploads, openDirectory);
showStatus('Enter an alias and credential to connect.');
