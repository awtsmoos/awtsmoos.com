//B"H
// Boruch Hashem
// Blessed is He

/**
 * The Awtsmoos binds semantic forms to canonical actions without hidden decree;
 * Awtsmoos.com closes dialogs only after verified service success is seen.
 */

import {
	applyConfirmedAction,
	applyPathAction,
	createFolder,
	saveMetadata
} from './actions.js';
import { connectState, driveState, updateFilters } from './state.js';

export function installForms(refresh, showError) {
	document.querySelector('#connection-form').addEventListener('submit', event => {
		event.preventDefault();
		connectState(Object.fromEntries(new FormData(event.currentTarget)));
		refresh();
	});
	document.querySelector('#filter-form').addEventListener('submit', event => {
		event.preventDefault();
		driveState.currentPath = value('#current-path');
		updateFilters({
			search: value('#search'),
			type: value('#type-filter'),
			visibility: value('#visibility-filter'),
			includeTrash: document.querySelector('#include-trash').checked,
			sort: value('#sort'),
			direction: value('#direction')
		});
		refresh();
	});
	installActionForms(refresh, showError);
}

function installActionForms(refresh, showError) {
	bindDialogForm('#folder-form', 'folder-dialog', async () => {
		await createFolder(driveState.currentPath, value('#folder-name'));
	}, refresh, showError);
	bindDialogForm('#path-form', 'path-dialog', async () => {
		await applyPathAction(
			value('#path-operation'),
			value('#source-path'),
			value('#destination-path')
		);
	}, refresh, showError);
	bindDialogForm('#metadata-form', 'metadata-dialog', async () => {
		await saveMetadata(
			value('#metadata-path'),
			value('#metadata-visibility'),
			value('#metadata-cache')
		);
	}, refresh, showError);
	bindDialogForm('#confirm-form', 'confirm-dialog', async () => {
		await applyConfirmedAction(
			value('#confirm-action'),
			value('#confirm-path')
		);
	}, refresh, showError);
}

function bindDialogForm(selector, dialogId, action, refresh, showError) {
	document.querySelector(selector).addEventListener('submit', async event => {
		if (event.submitter?.value === 'cancel') return;
		event.preventDefault();
		try {
			await action();
			document.getElementById(dialogId).close();
			await refresh();
		} catch (error) {
			showError(error);
		}
	});
}

function value(selector) {
	return document.querySelector(selector).value.trim();
}
