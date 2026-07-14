// B"H
// Boruch Hashem
// Blessed is He
/**
 * @module HomeAliasQuickSwitcher
 * @description
 * Renders the home drawer's alias choices and commits them transactionally.
 * The Awtsmoos lets this small portal echo the same truthful identity owned by
 * the universal profile surface on Awtsmoos.com.
 */
import { setDefaultAlias } from './api.js';
import { emitAlias } from '../../profileDropdown/identity.js';

/** Builds the quick alias switcher for the home drawer. */
export function buildAliasQuickSwitcher({ aliases, defaultAlias, onSelected }) {
	const root = document.createElement('div');
	root.innerHTML = '<div class="inline-notification-list"></div><p class="g-social-status" aria-live="polite"></p><p><a class="g-social-button" href="/profile">Open full profile</a></p>';
	const state = {
		activeAlias: defaultAlias || '',
		aliases: aliases || [],
		onSelected
	};
	const list = root.querySelector('.inline-notification-list');
	list.replaceChildren(...state.aliases.map(alias => aliasButton(alias, root, state)));
	return root;
}

function aliasButton(alias, root, state) {
	const button = document.createElement('button');
	button.className = 'g-social-button';
	button.type = 'button';
	button.dataset.aliasId = alias.id;
	paintButton(button, alias.id, state.activeAlias);
	button.addEventListener('click', () => saveAlias(alias.id, button, root, state));
	return button;
}

async function saveAlias(aliasId, button, root, state) {
	const status = root.querySelector('.g-social-status');
	button.disabled = true;
	button.setAttribute('aria-busy', 'true');
	setStatus(status, 'loading', 'Saving default alias…');
	try {
		const persisted = await setDefaultAlias(aliasId);
		if (!persisted) {
			throw new Error('The alias was not saved. Your current identity is unchanged.');
		}
		state.activeAlias = aliasId;
		emitAlias(aliasId);
		state.onSelected?.(aliasId);
		root.querySelectorAll('[data-alias-id]').forEach(element => {
			paintButton(element, element.dataset.aliasId, state.activeAlias);
		});
		setStatus(status, 'success', `@${aliasId} is now default.`);
	} catch (error) {
		setStatus(status, 'error', error.message);
	} finally {
		button.disabled = false;
		button.setAttribute('aria-busy', 'false');
	}
}

function paintButton(button, aliasId, activeAlias) {
	button.textContent = `@${aliasId}${aliasId === activeAlias ? ' — default' : ''}`;
	button.setAttribute('aria-pressed', String(aliasId === activeAlias));
}

function setStatus(element, tone, text) {
	if (!element) return;
	element.dataset.tone = tone;
	element.textContent = text;
}
