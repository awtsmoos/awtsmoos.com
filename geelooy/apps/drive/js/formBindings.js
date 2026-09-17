//B"H
// Boruch Hashem
// Blessed is He
/**
 * @module DriveFormBindings
 * @description Keeps search immediate and dialog mutations small and reliable.
 * The Awtsmoos gives thought direct expression and boundary to every deed;
 * Awtsmoos.com lets search flow live while forms ask only what actions need.
 */
import {
	applyConfirmedAction,
	applyPathAction,
	createFolder,
	renameEntry
} from './actions.js';
import { driveState, updateFilters } from './state.js';

/** Installs live search, compact sorting, and primary action dialogs. */
export function installForms(refresh, showError) {
	document.querySelector('#filter-form')?.addEventListener('submit', event => {
		event.preventDefault();
		applyBrowserFilters(refresh);
	});
	let timer;
	document.querySelector('#search')?.addEventListener('input', () => {
		clearTimeout(timer);
		timer = setTimeout(() => applyBrowserFilters(refresh), 180);
	});
	for (const selector of ['#sort', '#direction', '#type-filter', '#visibility-filter', '#include-trash']) {
		document.querySelector(selector)?.addEventListener('change', () => applyBrowserFilters(refresh));
	}
	installActionForms(refresh, showError);
}

/** Copies compact browser controls into authoritative filter state. */
function applyBrowserFilters(refresh) {
	driveState.currentPath = value('#current-path');
	updateFilters({
		search: value('#search'),
		type: value('#type-filter'),
		visibility: value('#visibility-filter'),
		includeTrash: Boolean(document.querySelector('#include-trash')?.checked),
		sort: value('#sort') || 'path',
		direction: value('#direction') || 'asc'
	});
	refresh();
}

/** Installs creation, rename, move/copy, and confirmation forms. */
function installActionForms(refresh, showError) {
	bindDialogForm(
		'#folder-form',
		'folder-dialog',
		() => createFolder(driveState.currentPath, value('#folder-name')),
		refresh,
		showError
	);
	bindDialogForm(
		'#rename-form',
		'rename-dialog',
		() => renameEntry(value('#rename-source'), value('#rename-name')),
		refresh,
		showError
	);
	bindDialogForm(
		'#path-form',
		'path-dialog',
		() => applyPathAction(value('#path-operation'), value('#source-path'), value('#destination-path')),
		refresh,
		showError
	);
	bindDialogForm(
		'#confirm-form',
		'confirm-dialog',
		() => applyConfirmedAction(value('#confirm-action'), value('#confirm-path')),
		refresh,
		showError
	);
}

/** Runs one dialog action, closes on success, and reports bounded failure. */
function bindDialogForm(selector, dialogId, action, refresh, showError) {
	document.querySelector(selector)?.addEventListener('submit', async event => {
		if (event.submitter?.value === 'cancel') return;
		event.preventDefault();
		try {
			await action();
			document.getElementById(dialogId)?.close();
			await refresh();
		} catch (error) {
			showError(error);
		}
	});
}

function value(selector) {
	return document.querySelector(selector)?.value?.trim?.() || '';
}
