//B"H
//Boruch Hashem
//Blessed is He

import assert from 'node:assert/strict';
import { waitFor } from './BrowserWait.mjs';

/**
 * @module BrowserCreatorJourney
 * @description The Awtsmoos reveals one creative doorway at a time: Home owns the deed, other routes keep it near;
 * Awtsmoos.com proves that retractable context stays quiet until chosen and no duplicate creator competes with the mobile road.
 */

/** Inspects the simplified Home creation hierarchy without activating any disclosure or publication. */
export async function inspectHomeCreator(client) {
	return client.evaluate(`(() => {
		const portal = document.getElementById('mobileCreatorPortal');
		const mobileAction = document.getElementById('mobileQuickPost');
		const homeAction = document.getElementById('quickPost');
		const homeRect = homeAction.getBoundingClientRect();
		return {
			viewport: { width: innerWidth, height: innerHeight },
			portalDisplay: getComputedStyle(portal).display,
			mobileHref: mobileAction.getAttribute('href'),
			homeHref: homeAction.getAttribute('href'),
			homeRect: { left: homeRect.left, right: homeRect.right, height: homeRect.height },
			contextOpen: document.querySelector('.hubContextDisclosure')?.open ?? true,
			pulseOpen: document.querySelector('.homePulseDisclosure')?.open ?? true,
			actionsOpen: document.querySelector('.homeActionsDisclosure')?.open ?? true,
			lookupOpen: document.querySelector('.publicDiscovery__lookupDisclosure')?.open ?? true,
			documentOverflow: document.documentElement.scrollWidth - innerWidth,
			hasExternalProviders: /youtube|facebook|instagram|oauth/i.test(document.querySelector('[data-panel="home"]').textContent)
		};
	})()`);
}

/** Inspects the compact persistent creator after leaving Home. */
async function inspectRouteCreator(client) {
	return client.evaluate(`(() => {
		const portal = document.getElementById('mobileCreatorPortal');
		const action = document.getElementById('mobileQuickPost');
		const dock = document.getElementById('mobileNavigation');
		const rect = action.getBoundingClientRect();
		const dockRect = dock.getBoundingClientRect();
		return {
			display: getComputedStyle(portal).display,
			position: getComputedStyle(portal).position,
			href: action.getAttribute('href'),
			rect: { top: rect.top, right: rect.right, bottom: rect.bottom, left: rect.left, height: rect.height },
			dockGap: dockRect.top - rect.bottom,
			label: action.textContent.trim().replace(/\\s+/g, ' ')
		};
	})()`);
}

/** Proves one-creator-at-a-time geometry and retractable Home truth. */
export async function provePersistentCreator(client) {
	const home = await inspectHomeCreator(client);
	const creatorUrl = new URL(home.homeHref, 'https://awtsmoos.test');
	assert.equal(home.viewport.width, 390);
	assert.equal(home.portalDisplay, 'none');
	assert.equal(creatorUrl.pathname, '/social-composer/');
	assert.equal(creatorUrl.searchParams.get('alias'), 'teacher');
	assert.equal(creatorUrl.searchParams.get('heichel'), 'study');
	assert.equal(creatorUrl.searchParams.get('series'), 'lessons');
	assert.equal(creatorUrl.searchParams.get('creator'), 'post');
	assert.equal(home.homeHref, home.mobileHref);
	assert.ok(home.homeRect.left >= 0);
	assert.ok(home.homeRect.right <= home.viewport.width);
	assert.ok(home.homeRect.height >= 44);
	assert.equal(home.contextOpen, false);
	assert.equal(home.pulseOpen, false);
	assert.equal(home.actionsOpen, false);
	assert.equal(home.lookupOpen, false);
	assert.equal(home.documentOverflow, 0);
	assert.equal(home.hasExternalProviders, false);
	await client.evaluate(`location.hash = '#inbox'`);
	await waitFor(client, `document.querySelector('[data-panel="inbox"]')?.dataset.active === 'true'`, 'Inbox never activated for creator proof');
	const route = await inspectRouteCreator(client);
	assert.notEqual(route.display, 'none');
	assert.equal(route.position, 'fixed');
	assert.equal(route.href, home.mobileHref);
	assert.ok(route.rect.left >= 0 && route.rect.right <= home.viewport.width);
	assert.ok(route.rect.top >= 0 && route.rect.bottom <= home.viewport.height);
	assert.ok(route.rect.height >= 44);
	assert.ok(route.dockGap > 0);
	assert.match(route.label, /Create/);
	await client.evaluate(`location.hash = '#home'`);
	await waitFor(client, `document.querySelector('[data-panel="home"]')?.dataset.active === 'true'`, 'Home never restored after creator proof');
	return { home, route };
}
