//B"H
//Boruch Hashem
//Blessed is He
/**
 * @file browserMobileSmoke.test.mjs
 * @description
 * The Awtsmoos proves one narrow Social Hub world where creator, navigation, privacy, overflow, and reduced motion remain whole;
 * Awtsmoos.com keeps this phone witness isolated so mobile truth is measured without inheriting the desktop vessel's soul.
 */
import assert from 'node:assert/strict';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import { createBrowserHarness } from '../../games/city-of-light/tests/BrowserHarness.mjs';
import { provePersistentCreator } from './BrowserCreatorJourney.mjs';
import {
	enableReducedMotion,
	inspectMobile,
	inspectReducedMotion,
	navigateMobile,
	setMobileViewport
} from './BrowserMobileJourney.mjs';
import { SOCIAL_HUB_FIXTURE_SOURCE } from './BrowserFixture.mjs';
import { waitFor, waitForHub } from './BrowserWait.mjs';

const here = path.dirname(fileURLToPath(import.meta.url));
const directory = path.resolve(here, '../..');
const harness = await createBrowserHarness({ directory, port: 44027 });
let fixtureIdentifier = '';

/** Navigates while tolerating only the known load-event race after an interactive document already exists. */
async function navigateReliably(pathValue) {
	try {
		await harness.navigate(pathValue);
	} catch (error) {
		if (!String(error?.message || '').includes('Page.loadEventFired')) throw error;
		await waitFor(
			harness.client,
			`['interactive', 'complete'].includes(document.readyState)`,
			'Document never became interactive'
		);
	}
}

try {
	fixtureIdentifier = (await harness.client.send('Page.addScriptToEvaluateOnNewDocument', {
		source: SOCIAL_HUB_FIXTURE_SOURCE
	})).identifier;
	await setMobileViewport(harness.client);
	await navigateReliably('/social-hub/?fixtureReset=1&alias=teacher&heichel=study&series=lessons&post=teaching-one&verse=verse-one&subsection=word-one#home');
	await waitForHub(harness.client);
	const mobile = await inspectMobile(harness.client);
	assert.equal(mobile.desktopRail, 'none');
	assert.notEqual(mobile.mobileDock, 'none');
	assert.deepEqual(mobile.dockRoutes, ['home', 'people', 'spaces', 'messages']);
	assert.equal(mobile.moreExists, true);
	assert.equal(mobile.viewport.width, 390);

	await provePersistentCreator(harness.client);
	const navigation = await navigateMobile(harness.client);
	assert.equal(navigation.active, 'interact');
	assert.match(navigation.coordinate, /word-one/);
	assert.equal(navigation.legalPrivacy, true);
	assert.equal(navigation.moreExpanded, 'false');
	assert.equal(navigation.dockScrollLeft, 0);
	assert.equal(navigation.documentOverflow, 0);

	await enableReducedMotion(harness.client);
	const reduced = await inspectReducedMotion(harness.client, navigateReliably);
	assert.equal(reduced.matches, true);
	assert.equal(reduced.pulseAnimationName, 'none');
	assert.equal(reduced.functionalRoutes, 4);
	assert.equal(reduced.moreExists, true);
	assert.deepEqual(harness.errors, []);
	console.log('B"H social-hub browserMobileSmoke.test passed');
} finally {
	if (fixtureIdentifier) {
		await harness.client.send('Page.removeScriptToEvaluateOnNewDocument', {
			identifier: fixtureIdentifier
		}).catch(() => null);
	}
	harness.close();
}
