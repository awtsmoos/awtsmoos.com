// B"H
// Boruch Hashem
// Blessed is He
/**
 * @module ProfileAliasMenu
 * @description
 * Loads and reveals the nested alias chamber without burdening the primary
 * profile lifecycle. The Awtsmoos lets Awtsmoos.com discover owned identities
 * asynchronously while focus and disclosure remain truthful.
 */
import { getAliasesStrict } from '../aliasIdentity.js';
import { renderProfileAliases } from './aliases.js';
import {
	closeProfilePanel,
	focusFirstProfileControl,
	isProfilePanelOpen,
	openProfilePanel
} from './panelState.js';

/**
 * Toggles the nested alias panel and paints current owned aliases.
 * @param {Event} event Disclosure event.
 * @param {object} elements Profile element registry.
 * @param {(options?: object) => void} closeAll Close callback used after selection.
 * @returns {Promise<void>}
 */
export async function toggleAliasMenu(event, elements, closeAll) {
	event.preventDefault();
	const opening = !isProfilePanelOpen(elements.aliasInfo);
	if (!opening) {
		closeAliasMenu(elements);
		return;
	}
	openProfilePanel(elements.aliasInfo);
	elements.switchAlias.setAttribute('aria-expanded', 'true');
	await loadAliases(elements, closeAll);
}

/**
 * Loads the owned aliases into the open panel. B"H 2026-11-20 round 3:
 * the read is bounded and retried inside getAliasesStrict; when it
 * still fails the panel shows an honest error with a working Retry
 * instead of sitting on "Gathering your aliases…" forever (the fetch
 * previously had no timeout at all) or painting the create-first-alias
 * empty state for an account whose list merely failed to arrive.
 */
async function loadAliases(elements, closeAll) {
	renderLoading(elements.aliasInfo);
	const aliases = await getAliasesStrict();
	if (aliases === null) {
		renderLoadError(elements, closeAll);
		return;
	}
	renderProfileAliases(elements.aliasInfo, aliases, closeAll);
	focusFirstProfileControl(elements.aliasInfo);
}

function renderLoadError(elements, closeAll) {
	const root = elements.aliasInfo;
	root.replaceChildren();
	const status = document.createElement('p');
	status.className = 'validation-message invalid';
	status.setAttribute('role', 'alert');
	status.textContent = 'Your aliases could not be loaded. The server may be busy.';
	const retry = document.createElement('button');
	retry.type = 'button';
	retry.className = 'menu-wide alias-retry-trigger';
	retry.textContent = 'Retry';
	retry.addEventListener('click', () => { loadAliases(elements, closeAll); });
	root.append(status, retry);
	retry.focus();
}

/** Closes only the nested alias panel and restores its disclosure state. */
export function closeAliasMenu(elements, immediate = false) {
	closeProfilePanel(elements.aliasInfo, immediate);
	elements.switchAlias.setAttribute('aria-expanded', 'false');
}

function renderLoading(root) {
	root.replaceChildren();
	const status = document.createElement('p');
	status.className = 'validation-message valid';
	status.setAttribute('role', 'status');
	status.setAttribute('aria-live', 'polite');
	status.textContent = 'Gathering your aliases…';
	root.append(status);
}
