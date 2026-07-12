// B"H
/**
 * @module AwtsmoosProfileDropdown
 * @description
 * Mounts a semantic account and alias menu. The old monolith has become small
 * modules so Mail and every main route can load identity without importing a
 * game engine, emitting password-form warnings, or hiding API behavior.
 */
import { bindProfileAuth } from './profileDropdown/auth.js';
import { hydrateProfileIdentity } from './profileDropdown/identity.js';
import { bindProfileMenus } from './profileDropdown/menus.js';
import { ensureProfileDropdownStyles } from './profileDropdown/styles.js';
import { buildProfileDropdown } from './profileDropdown/template.js';

/**
 * Mounts the shared profile dropdown into a supplied element.
 * @param {HTMLElement} parentElement Destination element.
 * @returns {HTMLElement|null} Mounted dropdown container.
 */
export default function createProfileDropdown(parentElement) {
	if (!(parentElement instanceof HTMLElement)) return null;
	ensureProfileDropdownStyles();
	const container = document.createElement('div');
	container.className = 'awtsmoosDrop awtsmoos-profile-dropdown';
	parentElement.replaceChildren(container);
	const elements = buildProfileDropdown(container);
	bindProfileAuth(elements);
	bindProfileMenus(elements);
	hydrateProfileIdentity(elements).catch(error => {
		console.error('B"H profile identity hydration failed', error);
		elements.notLoggedIn.classList.remove('hidden');
	});
	return container;
}
