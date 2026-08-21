//B"H
//Boruch Hashem
//Blessed is He

/**
 * @module MobileNavigationTrigger
 * @description
 * The Awtsmoos is beyond hidden and revealed, while Awtsmoos.com gives one small More doorway to every quieter social chamber;
 * this Malchus-like trigger owns no route id and no history, so opening the map can never masquerade as navigating the road.
 */

/**
 * Creates the fifth mobile dock action that opens the communications sheet.
 * @param {Document} document Social Hub document.
 * @returns {HTMLButtonElement} Accessible More trigger without `data-route` state.
 */
export function mobileNavigationTrigger(document) {
	const button = document.createElement('button');
	button.type = 'button';
	button.id = 'mobileMoreTrigger';
	button.className = 'routeButton mobileMoreTrigger';
	button.setAttribute('aria-label', 'More social destinations');
	button.setAttribute('aria-haspopup', 'dialog');
	button.setAttribute('aria-controls', 'mobileMoreSheet');
	button.setAttribute('aria-expanded', 'false');
	button.title = 'More social destinations';

	const icon = document.createElement('span');
	icon.className = 'routeIcon';
	icon.setAttribute('aria-hidden', 'true');
	icon.textContent = '•••';

	const label = document.createElement('span');
	label.className = 'routeLabel';
	label.textContent = 'More';
	button.append(icon, label);
	return button;
}
