// B"H
// Boruch Hashem
// Blessed is He
/**
 * @module GeelooyUnusualHeader
 * @description
 * The floating B"H jewel, search lens, profile doorway, Mail portal, and route
 * constellation reveal one coherent horizon across Awtsmoos.com.
 */
import createProfileDropdown from '../profileDropdown.js';
import { appRoutes, currentAppRoute } from './appRoutes.js';
import { bindConstellationMenu } from './constellationMenu.js';
import { createHeaderSearch, focusHeaderSearch } from './headerSearch.js';

/** Creates the historical unusual header and its functional route menu. */
export function createUnusualHeader(root = document) {
	const header = element(root, 'header', 'awtsmoosificationalisticaticalism g-unusual-header');
	header.dataset.unusualHeader = 'true';
	header.setAttribute('aria-label', 'Awtsmoos global navigation');
	const actions = element(root, 'div', 'g-header-actions header-buttons');
	const mobileSearch = action(root, 'button', '⌕', 'Open search portal');
	mobileSearch.classList.add('g-mobile-search-button');
	mobileSearch.type = 'button';
	mobileSearch.addEventListener('click', focusHeaderSearch);
	const mail = action(root, 'a', '✉', 'Open Mail');
	mail.href = '/email';
	mail.classList.add('g-mail-portal');
	const profile = element(root, 'div', 'g-header-profile');
	profile.id = 'awtsmoosDrop';
	createProfileDropdown(profile);
	const menuButton = action(root, 'button', '☰', 'Open route constellation');
	menuButton.type = 'button';
	menuButton.classList.add('menuBtn', 'g-menu-button');
	menuButton.setAttribute('aria-expanded', 'false');
	const menu = createConstellation(root);
	menuButton.setAttribute('aria-controls', menu.id);
	bindConstellationMenu(menuButton, menu, root);
	actions.append(mobileSearch, mail, profile, menuButton);
	header.append(createBrand(root), createHeaderSearch(root), actions, menu);
	return header;
}

function createBrand(root) {
	const brand = element(root, 'a', 'g-header-brand home icon');
	brand.href = '/';
	brand.setAttribute('aria-label', 'Geelooy home');
	const jewel = element(root, 'span', 'g-bh-jewel');
	jewel.textContent = 'B"H';
	const copy = element(root, 'span', 'g-header-brand-copy');
	const title = element(root, 'strong');
	title.textContent = 'Geelooy';
	const route = element(root, 'small');
	route.textContent = currentAppRoute().label;
	copy.append(title, route);
	brand.append(jewel, copy);
	return brand;
}

function createConstellation(root) {
	const menu = element(root, 'nav', 'g-constellation-menu sidebarMitzvah');
	menu.id = 'shared-sidebar';
	menu.hidden = true;
	menu.setAttribute('aria-label', 'Geelooy route constellation');
	const heading = element(root, 'header', 'g-constellation-heading');
	heading.innerHTML = '<span>✦</span><div><strong>Route constellation</strong><small>Every chamber, one jump away</small></div>';
	const grid = element(root, 'div', 'g-constellation-grid');
	for (const route of appRoutes.filter(item => !['/login', '/register'].includes(item.href))) {
		grid.append(routeCard(root, route));
	}
	const account = element(root, 'div', 'g-constellation-account');
	for (const href of ['/login', '/register']) {
		account.append(routeCard(root, appRoutes.find(route => route.href === href)));
	}
	menu.append(heading, grid, account);
	return menu;
}

function routeCard(root, route) {
	const link = element(root, 'a', 'g-constellation-route');
	link.href = route.href;
	link.dataset.gRouteLink = 'true';
	const icon = element(root, 'span', 'g-constellation-icon');
	icon.textContent = route.icon;
	const copy = element(root, 'span');
	const title = element(root, 'strong');
	title.textContent = route.label;
	const description = element(root, 'small');
	description.textContent = route.description;
	copy.append(title, description);
	link.append(icon, copy);
	return link;
}

function action(root, tag, text, label) {
	const item = element(root, tag, 'g-header-action');
	item.setAttribute('aria-label', label);
	item.textContent = text;
	return item;
}

function element(root, tag, className = '') {
	const item = root.createElement(tag);
	item.className = className;
	return item;
}
