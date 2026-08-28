//B"H
//Boruch Hashem
//Blessed is He

import assert from 'node:assert/strict';

/**
 * @module BrowserCreatorJourney
 * @description
 * The Awtsmoos places one creative doorway above the mobile road without collision or disguise;
 * Awtsmoos.com measures the living vessel so context, containment, and internal destination remain true before the user's touch can arise.
 */

/**
 * Inspects the persistent creator and dominant Home creator at the established mobile viewport.
 * @param {Object} client Connected CDP client from the shared browser harness.
 * @returns {Promise<Object>} Geometric, semantic, URL, and style evidence.
 */
export async function inspectPersistentCreator(client) {
	return client.evaluate(`(() => {
		const portal = document.getElementById('mobileCreatorPortal');
		const mobileAction = document.getElementById('mobileQuickPost');
		const dock = document.getElementById('mobileNavigation');
		const homeCard = document.querySelector('.homeCreationCard');
		const homeAction = document.getElementById('quickPost');
		const mobileRect = mobileAction.getBoundingClientRect();
		const dockRect = dock.getBoundingClientRect();
		const homeRect = homeCard.getBoundingClientRect();
		const actionRect = homeAction.getBoundingClientRect();
		return {
			viewport: { width: innerWidth, height: innerHeight },
			portalDisplay: getComputedStyle(portal).display,
			portalPosition: getComputedStyle(portal).position,
			mobileHref: mobileAction.getAttribute('href'),
			homeHref: homeAction.getAttribute('href'),
			mobileRect: { top: mobileRect.top, right: mobileRect.right, bottom: mobileRect.bottom, left: mobileRect.left, height: mobileRect.height },
			dockRect: { top: dockRect.top, bottom: dockRect.bottom, height: dockRect.height },
			homeRect: { left: homeRect.left, right: homeRect.right },
			actionRect: { left: actionRect.left, right: actionRect.right },
			dockGap: dockRect.top - mobileRect.bottom,
			documentOverflow: document.documentElement.scrollWidth - innerWidth,
			bodyPaddingBottom: parseFloat(getComputedStyle(document.body).paddingBottom),
			hasExternalProviders: /youtube|facebook|instagram|oauth/i.test(document.querySelector('.homeCreationCard').textContent),
			mobileLabel: mobileAction.textContent.trim().replace(/\\s+/g, ' ')
		};
	})()`);
}

/**
 * Proves mobile creator geometry and contextual internal-link truth without activating publication.
 * @param {Object} client Connected CDP client.
 * @returns {Promise<Object>} The proven browser evidence for optional reporting/screenshot flow.
 */
export async function provePersistentCreator(client) {
	const evidence = await inspectPersistentCreator(client);
	const creatorUrl = new URL(evidence.mobileHref, 'https://awtsmoos.test');
	assert.equal(evidence.viewport.width, 390);
	assert.notEqual(evidence.portalDisplay, 'none');
	assert.equal(evidence.portalPosition, 'fixed');
	assert.equal(creatorUrl.pathname, '/social-composer/');
	assert.equal(creatorUrl.searchParams.get('alias'), 'teacher');
	assert.equal(creatorUrl.searchParams.get('heichel'), 'study');
	assert.equal(creatorUrl.searchParams.get('series'), 'lessons');
	assert.equal(creatorUrl.searchParams.get('creator'), 'post');
	assert.equal(evidence.homeHref, evidence.mobileHref);
	assert.ok(evidence.mobileRect.left >= 0);
	assert.ok(evidence.mobileRect.right <= evidence.viewport.width);
	assert.ok(evidence.mobileRect.top >= 0);
	assert.ok(evidence.mobileRect.bottom <= evidence.viewport.height);
	assert.ok(evidence.mobileRect.height >= 44);
	assert.ok(evidence.dockGap > 0);
	assert.ok(evidence.bodyPaddingBottom > evidence.dockRect.height);
	assert.ok(evidence.homeRect.left >= 0);
	assert.ok(evidence.homeRect.right <= evidence.viewport.width);
	assert.ok(evidence.actionRect.left >= evidence.homeRect.left);
	assert.ok(evidence.actionRect.right <= evidence.homeRect.right);
	assert.equal(evidence.documentOverflow, 0);
	assert.equal(evidence.hasExternalProviders, false);
	assert.match(evidence.mobileLabel, /Create post/);
	return evidence;
}
