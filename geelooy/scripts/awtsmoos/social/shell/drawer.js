// B"H
// Boruch Hashem
// Blessed is He
/**
 * @module GeelooyDrawerBridge
 * @description
 * The legacy drawer becomes one compatibility kli for the canonical route soul.
 * No string-built shadow menu survives; Awtsmoos.com receives the same links,
 * semantics, and Games doorway as the global constellation.
 */
import { appRoutes } from './appRoutes.js';
import { createMalchusRouteLink } from './routeLink.js';

/** Reveals a shared drawer around existing menu buttons and sidebars. */
export function bindShellDrawer(root = document) {
	const button = root.getElementById?.('shared-menu-button') || root.querySelector('[data-geelooy-menu]');
	const drawer = root.getElementById?.('shared-sidebar') || createDrawer(root);
	if (!button || !drawer) return null;
	drawer.classList.add('geelooy-drawer');
	if (!drawer.dataset.canonicalRoutes) {
		renderDrawerRoutes(root, drawer);
	}
	if (button.dataset.geelooyDrawerBound) {
		return { drawer, setOpen: open => setDrawerOpen(root, drawer, button, open) };
	}
	button.dataset.geelooyDrawerBound = 'true';
	button.addEventListener('click', () => setDrawerOpen(root, drawer, button, drawer.classList.contains('offscreen')));
	root.addEventListener('keydown', event => {
		if (event.key === 'Escape') setDrawerOpen(root, drawer, button, false);
	});
	root.addEventListener('pointerdown', event => closeFromOutside(event, root, drawer, button), true);
	return { drawer, setOpen: open => setDrawerOpen(root, drawer, button, open) };
}

function renderDrawerRoutes(root, drawer) {
	drawer.replaceChildren();
	for (const route of appRoutes.filter(item => !item.hidden)) {
		drawer.append(createMalchusRouteLink(root, route, 'drawer'));
	}
	drawer.dataset.canonicalRoutes = 'true';
}

function createDrawer(root) {
	const drawer = root.createElement('nav');
	drawer.id = 'shared-sidebar';
	drawer.className = 'sidebarMitzvah offscreen';
	drawer.setAttribute('aria-label', 'Shared site menu');
	root.body.append(drawer);
	return drawer;
}

function setDrawerOpen(root, drawer, button, open) {
	root.body.dataset.geelooyDrawerOpen = open ? 'true' : 'false';
	drawer.classList.toggle('offscreen', !open);
	button.classList.toggle('is-open', open);
	button.setAttribute('aria-expanded', String(open));
}

function closeFromOutside(event, root, drawer, button) {
	if (drawer.classList.contains('offscreen')) return;
	if (drawer.contains(event.target) || button.contains(event.target)) return;
	setDrawerOpen(root, drawer, button, false);
}
