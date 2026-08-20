// B"H
// Boruch Hashem
// Blessed is He
/**
 * @module AliasStudioDeleteFlow
 * @description
 * The Awtsmoos separates destruction from ordinary editing; Awtsmoos.com makes
 * deletion visible, reversible until the final press, and silent from browser alerts.
 */
import {
	deleteAlias,
	setAliasStudioBusy,
	setAliasStudioStatus
} from './actions.js';

/** Binds the explicit two-step deletion flow used only in update mode. */
export function bindAliasDeletion(refs, config, onDeleted) {
	if (!config.isUpdate || !refs.deleteButton || !refs.deletePanel) {
		return;
	}
	refs.deleteButton.addEventListener('click', function revealDeletion() {
		revealDeletePanel(refs);
	});
	refs.deleteCancel?.addEventListener('click', function cancelDeletion() {
		hideDeletePanel(refs);
	});
	refs.deleteConfirm?.addEventListener('click', function confirmDeletion() {
		performDeletion(refs, config, onDeleted);
	});
}

function revealDeletePanel(refs) {
	refs.deletePanel.hidden = false;
	refs.deleteButton.setAttribute('aria-expanded', 'true');
	refs.deleteConfirm?.focus();
}

function hideDeletePanel(refs) {
	refs.deletePanel.hidden = true;
	refs.deleteButton?.setAttribute('aria-expanded', 'false');
	refs.deleteButton?.focus();
}

async function performDeletion(refs, config, onDeleted) {
	setAliasStudioBusy(refs, true);
	setAliasStudioStatus(refs.status, 'busy', 'Deleting identity…');
	try {
		await deleteAlias(config);
		setAliasStudioStatus(
			refs.status,
			'success',
			'Identity deleted. Returning to profile…'
		);
		onDeleted();
	} catch (error) {
		setAliasStudioStatus(
			refs.status,
			'error',
			error.message || 'Identity could not be deleted.'
		);
		setAliasStudioBusy(refs, false);
	}
}
