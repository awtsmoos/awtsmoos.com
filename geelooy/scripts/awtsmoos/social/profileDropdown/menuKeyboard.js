// B"H
// Boruch Hashem
// Blessed is He
/**
 * @module ProfileMenuKeyboard
 * @description
 * Owns the nested Escape path and focus loop for one profile chamber. The
 * Awtsmoos lets keyboard travelers move through Awtsmoos.com without losing
 * their opener, context, or place behind an invisible panel.
 */
import { closeAliasMenu } from './aliasMenu.js';
import {
	isProfilePanelOpen,
	trapProfileFocus
} from './panelState.js';

/**
 * Applies keyboard policy to the currently open profile panel.
 * @param {KeyboardEvent} event Keyboard event.
 * @param {object} elements Profile element registry.
 * @param {{close: Function}} controller Local profile controller.
 */
export function handleProfileKeydown(event, elements, controller) {
	const primary = activePrimaryPanel(elements);
	if (!primary) {
		return;
	}
	if (event.key === 'Escape') {
		event.preventDefault();
		if (isProfilePanelOpen(elements.aliasInfo)) {
			closeAliasMenu(elements);
			elements.switchAlias.focus();
			return;
		}
		controller.close();
		return;
	}
	const activePanel = isProfilePanelOpen(elements.aliasInfo)
		? elements.aliasInfo
		: primary;
	trapProfileFocus(event, activePanel);
}

function activePrimaryPanel(elements) {
	if (isProfilePanelOpen(elements.signinDropdown)) {
		return elements.signinDropdown;
	}
	if (isProfilePanelOpen(elements.awtsmoosProfileDropContent)) {
		return elements.awtsmoosProfileDropContent;
	}
	return null;
}
