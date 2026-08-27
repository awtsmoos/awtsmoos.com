//B"H
//Boruch Hashem
//Blessed is He

import {
	COMMUNICATION_LINKS,
	communicationLink
} from './CommunicationLinks.js';
import { routeButton } from './RouteModel.js';

/**
 * @module MobileNavigationSheetView
 * @description
 * The Awtsmoos is beyond header, group, button, and link, while Awtsmoos.com lets one clear sheet manifest every quieter social road without swallowing its behavior;
 * this Malchus-like view builds finite DOM only, leaving focus, history, activation, and dialog lifecycle to neighboring vessels of light.
 */

/**
 * Builds one More dialog and returns the canonical route buttons it manifests.
 * @param {Document} document Social Hub document.
 * @param {Array<object>} routes Overflow route descriptors.
 * @param {Function} onRoute Canonical internal-route selection callback.
 * @param {Function} onClose Explicit close-button callback.
 * @returns {{dialog: HTMLDialogElement, routeButtons: Map<string, HTMLButtonElement>}}
 */
export function buildMobileNavigationSheet(document, routes, onRoute, onClose) {
	const dialog = document.createElement('dialog');
	dialog.id = 'mobileMoreSheet';
	dialog.className = 'mobileMoreSheet';
	dialog.setAttribute('aria-labelledby', 'mobileMoreTitle');

	const surface = document.createElement('div');
	surface.className = 'mobileMoreSheet__surface';
	const routeGroup = buildRouteGroup(document, routes, onRoute);
	surface.append(
		buildHeader(document, onClose),
		routeGroup.section,
		buildCommunicationGroup(document)
	);
	dialog.append(surface);
	return {
		dialog,
		routeButtons: routeGroup.buttons
	};
}

/** Builds the fixed heading and explicit close action. */
function buildHeader(document, onClose) {
	const header = document.createElement('header');
	header.className = 'mobileMoreSheet__header';
	const title = document.createElement('h2');
	title.id = 'mobileMoreTitle';
	title.textContent = 'More social destinations';
	const close = document.createElement('button');
	close.type = 'button';
	close.className = 'mobileMoreSheet__close';
	close.setAttribute('aria-label', 'Close more destinations');
	close.textContent = '×';
	close.addEventListener('click', onClose);
	header.append(title, close);
	return header;
}

/** Builds the internal overflow route group and its stable button map. */
function buildRouteGroup(document, routes, onRoute) {
	const group = buildGroup(document, 'Within Social');
	const buttons = new Map();
	for (const route of routes) {
		const button = routeButton(document, route);
		button.dataset.moreRoute = 'true';
		button.addEventListener('click', () => onRoute(route.id));
		buttons.set(route.id, button);
		group.body.append(button);
	}
	return {
		section: group.section,
		buttons
	};
}

/** Builds sovereign same-origin links to neighboring communication applications. */
function buildCommunicationGroup(document) {
	const group = buildGroup(document, 'Across Awtsmoos');
	for (const item of COMMUNICATION_LINKS) {
		group.body.append(communicationLink(document, item));
	}
	return group.section;
}

/** Builds one labeled sheet group around a compact action grid. */
function buildGroup(document, label) {
	const section = document.createElement('section');
	section.className = 'mobileMoreSheet__group';
	const heading = document.createElement('h3');
	heading.textContent = label;
	const body = document.createElement('div');
	body.className = 'mobileMoreSheet__grid';
	section.append(heading, body);
	return {
		section,
		body
	};
}
