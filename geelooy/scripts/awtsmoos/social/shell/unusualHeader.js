// B"H
// Boruch Hashem
// Blessed is He
/**
 * @module GeelooyUnusualHeader
 * @description
 * The floating B"H jewel, search lens, profile crown, and route constellation
 * become one horizon. The Awtsmoos lets Games shine here through the same route
 * soul that animates every other navigation vessel on Awtsmoos.com.
 */
import createProfileDropdown from '../profileDropdown.js';
import { appRoutes, currentAppRoute } from './appRoutes.js';
import { bindConstellationMenu } from './constellationMenu.js';
import { createHeaderSearch, focusHeaderSearch } from './headerSearch.js';
import { createMalchusRouteLink } from './routeLink.js';

/** Creates the unusual header and its one canonical route constellation. */
export function createUnusualHeader(root = document) {
	const header = element(root, 'header', 'awtsmoosificationalisticaticalism g-unusual-header');
	header.dataset.unusualHeader = 'true';
	header.setAttribute('aria-label', 'Awtsmoos global navigation');
	const actions = element(root, 'div', 'g-header-actions header-buttons');
	const search = action(root, 'button', '🔍', 'Open search portal');
	search.classList.add('g-mobile-search-button');
	search.type = 'button';
	search.addEventListener('click', focusHeaderSearch);
	const mail = action(root, 'a', '📬', 'Open Mail');
	mail.href = '/email';
	mail.classList.add('g-mail-portal');
	const profile = element(root, 'div', 'g-header-profile');
	profile.id = 'awtsmoosDrop';
	createProfileDropdown(profile);
	const menuButton = action(root, 'button', '🧭', 'Open route constellation');
	menuButton.type = 'button';
	menuButton.classList.add('menuBtn', 'g-menu-button');
	menuButton.setAttribute('aria-expanded', 'false');
	const menu = createConstellation(root);
	menuButton.setAttribute('aria-controls', menu.id);
	bindConstellationMenu(menuButton, menu, root);
	actions.append(search, mail, profile, menuButton);
	header.append(createBrand(root), createHeaderSearch(root), actions, menu);
	return header;
}

function createBrand(root) {
	const brand = element(root, 'a', 'g-header-brand home icon');
	brand.href = '/';
	brand.setAttribute('aria-label', 'Geelooy home');
	const jewel = element(root, 'span', 'g-bh-jewel', 'B"H');
	const copy = element(root, 'span', 'g-header-brand-copy');
	copy.append(element(root, 'strong', '', 'Geelooy'), element(root, 'small', '', currentAppRoute().label));
	brand.append(jewel, copy);
	return brand;
}

function createConstellation(root) {
	const menu = element(root, 'nav', 'g-constellation-menu sidebarMitzvah');
	menu.id = 'shared-sidebar';
	menu.hidden = true;
	menu.setAttribute('aria-label', 'Geelooy route constellation');
	const heading = element(root, 'header', 'g-constellation-heading');
	const copy = element(root, 'div');
	copy.append(element(root, 'strong', '', 'Route constellation'), element(root, 'small', '', 'Every chamber, one jump away'));
	heading.append(element(root, 'span', '', '🧭'), copy);
	const grid = element(root, 'div', 'g-constellation-grid');
	for (const route of appRoutes.filter(item => !item.hidden && !['/login', '/register'].includes(item.href))) {
		grid.append(createMalchusRouteLink(root, route, 'constellation'));
	}
	const account = element(root, 'div', 'g-constellation-account');
	for (const route of appRoutes.filter(item => ['/login', '/register'].includes(item.href))) {
		account.append(createMalchusRouteLink(root, route, 'constellation'));
	}
	menu.append(heading, grid, account);
	return menu;
}

function action(root, tag, text, label) {
	const item = element(root, tag, 'g-header-action');
	item.setAttribute('aria-label', label);
	item.textContent = text;
	return item;
}

function element(root, tag, className = '', text = '') {
	const item = root.createElement(tag);
	item.className = className;
	if (text) item.textContent = text;
	return item;
}
