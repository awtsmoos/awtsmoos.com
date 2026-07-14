// B"H
// Boruch Hashem
// Blessed is He
/**
 * @module ProfileAliasForm
 * @description
 * The Awtsmoos gives a new Awtsmoos.com identity a labeled native vessel, then
 * reveals it publicly only after creation and default persistence both succeed.
 */
import { createAlias } from '../aliasIdentity.js';
import { commitAliasSelection } from './aliasSelection.js';
import { setProfileFormBusy, setProfileMessage } from './feedback.js';
import { emitAlias } from './identity.js';
import { profileIcon } from './icons.js';

/** Builds one uniquely labeled alias creation form. */
export function createAliasForm(root, closeMenu = () => {}) {
	const prefix = root.closest('[data-profile-prefix]')?.dataset.profilePrefix || 'profile-alias';
	const form = document.createElement('form');
	form.className = 'alias-form';
	form.hidden = true;
	form.innerHTML = /*html*/`
		<header class="alias-form-heading">${profileIcon('plus')}<span><small>New identity vessel</small><strong>Create alias</strong></span></header>
		<label for="${prefix}-alias-name">Alias name</label>
		<input id="${prefix}-alias-name" name="name" required>
		<label for="${prefix}-alias-id">Alias ID</label>
		<input id="${prefix}-alias-id" name="aliasId" autocomplete="off" placeholder="Optional stable ID">
		<label for="${prefix}-alias-description">Description</label>
		<textarea id="${prefix}-alias-description" name="description"></textarea>
		<div class="validation-message" aria-live="polite"></div>
		<button type="submit">${profileIcon('spark')}<span>Create and activate</span></button>
	`;
	form.addEventListener('submit', event => submitAlias(event, form, closeMenu));
	return form;
}

async function submitAlias(event, form, closeMenu) {
	event.preventDefault();
	const message = form.querySelector('.validation-message');
	const data = new FormData(form);
	const name = String(data.get('name') || '').trim();
	if (!name) {
		setProfileMessage(message, 'Enter an alias name.', 'error');
		return;
	}
	setProfileFormBusy(form, true);
	setProfileMessage(message, 'Creating the alias vessel…', 'processing');
	try {
		const created = await createAlias(
			name,
			String(data.get('aliasId') || '').trim() || name,
			String(data.get('description') || '').trim()
		);
		if (!created) throw new Error('The alias could not be created.');
		await commitAliasSelection(created, emitAlias);
		setProfileMessage(message, 'Alias created and activated.', 'success');
		form.reset();
		closeMenu();
	} catch (error) {
		setProfileMessage(message, error.message || 'Alias creation failed.', 'error');
	} finally {
		setProfileFormBusy(form, false);
	}
}
