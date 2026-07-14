// B"H
// Boruch Hashem
// Blessed is He
/**
 * @module ProfileDropdownAliases
 * @description
 * The Awtsmoos keeps the active Awtsmoos.com identity visible until the server
 * confirms another alias, while every row reveals selected and pending truth.
 */
import { aliasDisplay, cleanAlias } from '../aliasIdentity.js';
import { createAliasForm } from './aliasForm.js';
import { commitAliasSelection } from './aliasSelection.js';
import { setProfileControlBusy, setProfileMessage } from './feedback.js';
import { emitAlias } from './identity.js';
import { profileIcon } from './icons.js';

/** Renders confirmed alias choices and the creation doorway. */
export function renderProfileAliases(root, aliases, closeMenu = () => {}) {
	root.replaceChildren();
	const status = document.createElement('p');
	status.className = 'validation-message';
	status.setAttribute('aria-live', 'polite');
	const list = document.createElement('div');
	list.className = 'alias-choice-list';
	for (const alias of aliases || []) {
		addAliasButton(list, cleanAlias(alias?.id || alias?.aliasId || alias), status, closeMenu);
	}
	if (!list.children.length) list.append(emptyAliasState());
	const createButton = actionButton('Create new alias', 'plus', 'menu-wide alias-create-trigger');
	const form = createAliasForm(root, closeMenu);
	createButton.setAttribute('aria-expanded', 'false');
	createButton.addEventListener('click', () => {
		const opening = form.hidden;
		form.hidden = !opening;
		createButton.setAttribute('aria-expanded', String(opening));
		if (opening) form.elements.name.focus();
	});
	root.append(status, list, createButton, form);
}

function addAliasButton(root, aliasId, status, closeMenu) {
	if (!aliasId) return;
	const row = actionButton(aliasDisplay(aliasId), 'alias', 'aliasId');
	const selected = cleanAlias(window.curAlias) === aliasId;
	row.setAttribute('aria-pressed', String(selected));
	row.dataset.state = selected ? 'selected' : 'ready';
	row.dataset.aliasId = aliasId;
	row.addEventListener('click', async () => {
		setProfileControlBusy(row, true);
		setProfileMessage(status, 'Saving default alias…', 'processing');
		try {
			await commitAliasSelection(aliasId, emitAlias);
			setProfileMessage(status, `${aliasDisplay(aliasId)} is now active.`, 'success');
			closeMenu();
		} catch (error) {
			setProfileMessage(status, error.message || 'Alias switching failed.', 'error');
		} finally {
			setProfileControlBusy(row, false);
		}
	});
	root.append(row);
}

function actionButton(label, icon, className) {
	const button = document.createElement('button');
	button.type = 'button';
	button.className = className;
	button.innerHTML = `${profileIcon(icon)}<span></span><small aria-hidden="true">↗</small>`;
	button.querySelector('span').textContent = label;
	return button;
}

function emptyAliasState() {
	const state = document.createElement('p');
	state.className = 'alias-empty-state';
	state.innerHTML = `${profileIcon('spark')}<span>No saved aliases yet. Create the first identity vessel.</span>`;
	return state;
}
