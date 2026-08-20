// B"H
// Boruch Hashem
// Blessed is He
/**
 * @module ProfileAliasActions
 * @description
 * The Awtsmoos lets Awtsmoos.com switch only among aliases the account truly
 * returns, while failed loading remains visible instead of disappearing in silence.
 */
import {
	getAliasDetails,
	getDefaultAlias,
	setDefaultAlias
} from '../api.js';
import { state } from '../state.js';
import {
	actionLink,
	actionStatus
} from './shared.js';

export async function ensureAliasesLoaded() {
	if (state.aliases.length) return;
	state.defaultAlias = await getDefaultAlias();
	state.aliases = await getAliasDetails();
}

export async function aliasDrawer() {
	const box = document.createElement('div');
	box.className = 'profile-action-list';
	const status = actionStatus('');
	try {
		await ensureAliasesLoaded();
	} catch (error) {
		status.dataset.tone = 'error';
		status.textContent = aliasLoadMessage(error);
	}
	box.append(
		...state.aliases.map(alias => aliasButton(alias, status)),
		status,
		actionLink('./alias-manage/', 'Open alias manager')
	);
	return box;
}

function aliasButton(alias, status) {
	const button = document.createElement('button');
	button.className = 'g-social-button';
	button.type = 'button';
	button.textContent = `@${alias.id}${alias.id === state.defaultAlias ? ' — default' : ''}`;
	button.setAttribute('aria-pressed', String(alias.id === state.defaultAlias));
	button.addEventListener('click', () => saveAlias(alias.id, status));
	return button;
}

async function saveAlias(id, status) {
	status.dataset.tone = 'loading';
	status.textContent = 'Saving default alias…';
	try {
		await setDefaultAlias(id);
		state.defaultAlias = id;
		status.dataset.tone = 'success';
		status.textContent = `@${id} is default.`;
		window.dispatchEvent(new CustomEvent('awtsmoosAliasChange', { detail: { id } }));
	} catch (error) {
		status.dataset.tone = 'error';
		status.textContent = error instanceof Error ? error.message : 'Could not save the default alias.';
	}
}

function aliasLoadMessage(error) {
	const detail = error instanceof Error && error.message ? ` ${error.message}` : '';
	return `Could not load aliases.${detail}`;
}
