// B"H
// Boruch Hashem
// Blessed is He
/**
 * @module GeelooyUnusualHeader
 * @description
 * The Awtsmoos gathers search, Mail, Signals, identity, and routes into one clear horizon;
 * Awtsmoos.com gives every doorway a visible purpose while the constellation stays light.
 */
import createProfileDropdown from '../profileDropdown.js';
import { appRoutes, currentAppRoute } from './appRoutes.js';
import { bindConstellationMenu } from './constellationMenu.js';
import { createHeaderIcon } from './headerIcons.js';
import { createHeaderPortal } from './headerPortal.js';
import {
	createHeaderElement,
	isAccountRoute
} from './headerPrimitives.js';
import { createHeaderSearch, focusHeaderSearch } from './headerSearch.js';
import { createMalchusRouteLink } from './routeLink.js';

/** Creates the global application header and route constellation. */
export function createUnusualHeader(root = document) {
	const header = createHeaderElement(root, 'header', 'awtsmoosificationalisticaticalism g-unusual-header');
	header.dataset.unusualHeader = 'true';
	header.setAttribute('aria-label', 'Awtsmoos global navigation');
	const menu = createConstellation(root);
	const actions = createHeaderActions(root, menu);
	header.append(createBrand(root), createHeaderSearch(root), actions, menu);
	return header;
}

function createHeaderActions(root, menu) {
	const actions = createHeaderElement(root, 'div', 'g-header-actions header-buttons');
	const search = createAction(root, 'button', 'search', 'Open search portal');
	search.classList.add('g-mobile-search-button');
	search.type = 'button';
	search.addEventListener('click', focusHeaderSearch);
	const mail = createHeaderPortal(root, {
		kind: 'mail', icon: 'mail', href: '/email', label: 'Mail', caption: 'Inbox',
		className: 'g-mail-portal', ariaLabel: 'Open Awtsmoos Mail'
	});
	const signals = createHeaderPortal(root, {
		kind: 'signals', icon: 'bell', href: '/notifications', label: 'Signals', caption: 'Activity',
		className: 'g-notification-portal', ariaLabel: 'Open notification center'
	});
	const profile = createHeaderElement(root, 'div', 'g-header-profile');
	profile.id = 'awtsmoosDrop';
	createProfileDropdown(profile);
	actions.append(search, mail, signals, profile, createMenuButton(root, menu));
	return actions;
}

function createMenuButton(root, menu) {
	const button = createAction(root, 'button', 'compass', 'Open route constellation');
	button.type = 'button';
	button.classList.add('menuBtn', 'g-menu-button');
	button.setAttribute('aria-expanded', 'false');
	button.setAttribute('aria-controls', menu.id);
	bindConstellationMenu(button, menu, root);
	return button;
}

function createBrand(root) {
	const brand = createHeaderElement(root, 'a', 'g-header-brand home icon');
	brand.href = '/';
	brand.setAttribute('aria-label', 'Geelooy home');
	const copy = createHeaderElement(root, 'span', 'g-header-brand-copy');
	copy.append(
		createHeaderElement(root, 'strong', '', 'Geelooy'),
		createHeaderElement(root, 'small', '', currentAppRoute().label)
	);
	brand.append(createHeaderElement(root, 'span', 'g-bh-jewel', 'B"H'), copy);
	return brand;
}

function createConstellation(root) {
	const menu = createHeaderElement(root, 'nav', 'g-constellation-menu sidebarMitzvah');
	menu.id = 'shared-sidebar';
	menu.hidden = true;
	menu.setAttribute('aria-label', 'Geelooy route constellation');
	const grid = createHeaderElement(root, 'div', 'g-constellation-grid');
	const account = createHeaderElement(root, 'div', 'g-constellation-account');
	for (const route of appRoutes) {
		if (!route.hidden) {
			(isAccountRoute(route) ? account : grid).append(createMalchusRouteLink(root, route, 'constellation'));
		}
	}
	menu.append(createConstellationHeading(root), grid, account);
	return menu;
}

function createConstellationHeading(root) {
	const heading = createHeaderElement(root, 'header', 'g-constellation-heading');
	const copy = createHeaderElement(root, 'div');
	copy.append(
		createHeaderElement(root, 'strong', '', 'Route constellation'),
		createHeaderElement(root, 'small', '', 'Every chamber, one jump away')
	);
	heading.append(createHeaderIcon(root, 'compass'), copy);
	return heading;
}

function createAction(root, tag, icon, label) {
	const item = createHeaderElement(root, tag, 'g-header-action');
	item.setAttribute('aria-label', label);
	item.append(createHeaderIcon(root, icon));
	return item;
}
