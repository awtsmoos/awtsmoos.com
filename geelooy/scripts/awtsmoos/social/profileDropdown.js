// B"H
// Boruch Hashem
// Blessed is He
/**
 * @module AwtsmoosProfileDropdown
 * @description
 * Mounts one uniquely owned account and alias instrument. The Awtsmoos lets
 * Header and Mail reveal the same identity without duplicate IDs or listeners.
 */
import { bindProfileAuth } from './profileDropdown/auth.js';
import { hydrateProfileIdentity } from './profileDropdown/identity.js';
import { bindProfileMenus } from './profileDropdown/menus.js';
import { ensureProfileDropdownStyles } from './profileDropdown/styles.js?v=4';
import { buildProfileDropdown } from './profileDropdown/template.js';

let mountSequence = 0;

/**
 * Mounts the shared profile dropdown into a supplied element.
 * @param {HTMLElement} parentElement Destination element.
 * @returns {HTMLElement|null} Mounted dropdown container.
 */
export default function createProfileDropdown(parentElement) {
	if (!(parentElement instanceof HTMLElement)) return null;
	parentElement.awtsmoosProfileCleanup?.();
	ensureProfileDropdownStyles(parentElement.ownerDocument);
	const container = parentElement.ownerDocument.createElement('div');
	const prefix = `awtsmoos-profile-${++mountSequence}`;
	container.className = 'awtsmoosDrop awtsmoos-profile-dropdown';
	container.dataset.profileDropdownRoot = 'true';
	container.dataset.profileOwner = prefix;
	parentElement.replaceChildren(container);
	const elements = buildProfileDropdown(container, prefix);
	const menuController = bindProfileMenus(elements);
	bindProfileAuth(elements, menuController.close);
	hydrateProfileIdentity(elements).catch(error => {
		console.error('B"H profile identity hydration failed', error);
		elements.notLoggedIn.hidden = false;
	});
	parentElement.awtsmoosProfileCleanup = () => {
		menuController.destroy();
		container.remove();
		delete parentElement.awtsmoosProfileCleanup;
	};
	return container;
}
