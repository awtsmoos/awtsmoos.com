// B"H
// Boruch Hashem
// Blessed is He
/**
 * @module GeelooyUnusualHeader
 * @description
 * The B"H jewel, search lens, profile crown, and route constellation become one
 * horizon. Games shines through the same Malchus route soul that animates every
 * other navigational vessel on Awtsmoos.com.
 */
import createProfileDropdown from '../profileDropdown.js';
import { appRoutes, currentAppRoute } from './appRoutes.js';
import { bindConstellationMenu } from './constellationMenu.js';
import { createHeaderSearch, focusHeaderSearch } from './headerSearch.js';
import { createMalchusRouteLink } from './routeLink.js';

/** Creates the unusual header and its one canonical route constellation. */
export function createUnusualHeader(root = document) {
	const keterHeader = createElement(root, 'header', 'awtsmoosificationalisticaticalism g-unusual-header');
	keterHeader.dataset.unusualHeader = 'true';
	keterHeader.setAttribute('aria-label', 'Awtsmoos global navigation');
	const netzachActions = createHeaderActions(root);
	const malchusMenu = createConstellation(root);
	const menuButton = createMenuButton(root, malchusMenu);
	netzachActions.append(menuButton);
	keterHeader.append(createBrand(root), createHeaderSearch(root), netzachActions, malchusMenu);
	return keterHeader;
}

function createHeaderActions(root) {
	const actions = createElement(root, 'div', 'g-header-actions header-buttons');
	const search = createAction(root, 'button', '🔍', 'Open search portal');
	search.classList.add('g-mobile-search-button');
	search.type = 'button';
	search.addEventListener('click', focusHeaderSearch);
	const mail = createAction(root, 'a', '📬', 'Open Mail');
	mail.href = '/email';
	mail.classList.add('g-mail-portal');
	const profile = createElement(root, 'div', 'g-header-profile');
	profile.id = 'awtsmoosDrop';
	createProfileDropdown(profile);
	actions.append(search, mail, profile);
	return actions;
}

function createMenuButton(root, menu) {
	const button = createAction(root, 'button', '🧭', 'Open route constellation');
	button.type = 'button';
	button.classList.add('menuBtn', 'g-menu-button');
	button.setAttribute('aria-expanded', 'false');
	button.setAttribute('aria-controls', menu.id);
	bindConstellationMenu(button, menu, root);
	return button;
}

function createBrand(root) {
	const brand = createElement(root, 'a', 'g-header-brand home icon');
	brand.href = '/';
	brand.setAttribute('aria-label', 'Geelooy home');
	const jewel = createElement(root, 'span', 'g-bh-jewel', 'B"H');
	const copy = createElement(root, 'span', 'g-header-brand-copy');
	copy.append(
		createElement(root, 'strong', '', 'Geelooy'),
		createElement(root, 'small', '', currentAppRoute().label)
	);
	brand.append(jewel, copy);
	return brand;
}

function createConstellation(root) {
	const menu = createElement(root, 'nav', 'g-constellation-menu sidebarMitzvah');
	menu.id = 'shared-sidebar';
	menu.hidden = true;
	menu.setAttribute('aria-label', 'Geelooy route constellation');
	const heading = createConstellationHeading(root);
	const grid = createElement(root, 'div', 'g-constellation-grid');
	const account = createElement(root, 'div', 'g-constellation-account');
	for (const route of appRoutes) {
		if (route.hidden) {
			continue;
		}
		const destination = isAccountRoute(route) ? account : grid;
		destination.append(createMalchusRouteLink(root, route, 'constellation'));
	}
	menu.append(heading, grid, account);
	return menu;
}

function createConstellationHeading(root) {
	const heading = createElement(root, 'header', 'g-constellation-heading');
	const copy = createElement(root, 'div');
	copy.append(
		createElement(root, 'strong', '', 'Route constellation'),
		createElement(root, 'small', '', 'Every chamber, one jump away')
	);
	heading.append(createElement(root, 'span', '', '🧭'), copy);
	return heading;
}

function isAccountRoute(route) {
	return route.href === '/login' || route.href === '/register';
}

function createAction(root, tag, text, label) {
	const item = createElement(root, tag, 'g-header-action');
	item.setAttribute('aria-label', label);
	item.textContent = text;
	return item;
}

function createElement(root, tag, className = '', text = '') {
	const item = root.createElement(tag);
	item.className = className;
	if (text) {
		item.textContent = text;
	}
	return item;
}
