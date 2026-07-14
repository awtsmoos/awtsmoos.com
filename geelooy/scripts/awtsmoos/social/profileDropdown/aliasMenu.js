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
import { getAliases } from '../aliasIdentity.js';
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
	renderLoading(elements.aliasInfo);
	const aliases = await getAliases();
	renderProfileAliases(elements.aliasInfo, aliases, closeAll);
	focusFirstProfileControl(elements.aliasInfo);
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
