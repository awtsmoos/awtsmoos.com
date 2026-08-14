//B"H
//Boruch Hashem
//Blessed is He
/**
 * @file browserSmoke.test.mjs
 * @description
 * Real Chrome proves the Social Hub on desktop, narrow mobile, and reduced motion across the current route model:
 * private activity, exact replies, media, references, profiles, legal links, and idempotent promotion beneath the Awtsmoos.
 */
import assert from 'node:assert/strict';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import { createBrowserHarness } from '../../games/city-of-light/tests/BrowserHarness.mjs';
import { ROUTES } from '../js/navigation/RouteModel.js';
import {
	createRichReply,
	governActivity,
	inspectDesktop,
	promoteSeedComment
} from './BrowserDesktopJourney.mjs';
import {
	enableReducedMotion,
	inspectMobile,
	inspectReducedMotion,
	navigateMobile,
	setMobileViewport
} from './BrowserMobileJourney.mjs';
import { SOCIAL_HUB_FIXTURE_SOURCE } from './BrowserFixture.mjs';
import { waitForHub } from './BrowserWait.mjs';

const here = path.dirname(fileURLToPath(import.meta.url));
const directory = path.resolve(here, '../..');
const evidence = path.resolve(here, '../../../ai_thoughts_local/2026-08-12_0749_social-discovery-v2');
const harness = await createBrowserHarness({ directory, port: 44027 });
let fixtureIdentifier = '';

try {
	fixtureIdentifier = (await harness.client.send(
		'Page.addScriptToEvaluateOnNewDocument',
		{ source: SOCIAL_HUB_FIXTURE_SOURCE }
	)).identifier;
	await harness.client.send('Emulation.setDeviceMetricsOverride', {
		width: 1440,
		height: 1000,
		deviceScaleFactor: 1,
		mobile: false
	});
	await harness.navigate(
		'/social-hub/?fixtureReset=1&alias=teacher&heichel=study&series=lessons&post=teaching-one&verse=verse-one&subsection=word-one#home'
	);
	await waitForHub(harness.client);
	const desktop = await inspectDesktop(harness.client);
	assert.notEqual(desktop.desktopRail, 'none');
	assert.equal(desktop.mobileDock, 'none');
	assert.equal(desktop.alias, 'teacher');
	assert(desktop.legalLinks.includes('/legal/privacy/'));
	assert(desktop.legalLinks.includes('/legal/terms/'));
	const reply = await createRichReply(harness.client);
	assert.equal(reply.comment.parentId, 'comment-seed');
	assert.equal(reply.comment.subsectionId, 'word-one');
	assert.deepEqual(reply.mediaTypes.sort(), ['audio', 'image', 'video']);
	assert.equal(reply.referenceCount, 1);
	const preferences = await governActivity(harness.client);
	assert.equal(preferences.enabled, false);
	assert.equal(preferences.retentionDays, 30);
	const promotion = await promoteSeedComment(harness.client);
	assert.equal(promotion.promotion.canonical.id, 'promoted-one');
	assert.equal(promotion.posts, 2);
	await harness.screenshot(path.join(evidence, 'social-hub-desktop.png'));
	await setMobileViewport(harness.client);
	await harness.navigate(
		'/social-hub/?alias=teacher&heichel=study&series=lessons&post=teaching-one&verse=verse-one&subsection=word-one#home'
	);
	await waitForHub(harness.client);
	const mobile = await inspectMobile(harness.client);
	assert.equal(mobile.desktopRail, 'none');
	assert.notEqual(mobile.mobileDock, 'none');
	assert.equal(mobile.dockButtons, ROUTES.length);
	assert.equal(mobile.viewport.width, 390);
	const mobileNavigation = await navigateMobile(harness.client);
	assert.equal(mobileNavigation.active, 'interact');
	assert.match(mobileNavigation.coordinate, /word-one/);
	assert.equal(mobileNavigation.legalPrivacy, true);
	await harness.screenshot(path.join(evidence, 'social-hub-mobile.png'));
	await enableReducedMotion(harness.client);
	const reduced = await inspectReducedMotion(
		harness.client,
		pathValue => harness.navigate(pathValue)
	);
	assert.equal(reduced.matches, true);
	assert(reduced.pulseDuration === '0.001s' || reduced.pulseDuration === '0s');
	assert.equal(reduced.functionalRoutes, ROUTES.length);
	await harness.screenshot(path.join(evidence, 'social-hub-reduced-motion.png'));
	assert.deepEqual(harness.errors, []);
	console.log('social-hub browserSmoke.test passed');
} finally {
	if (fixtureIdentifier) {
		await harness.client.send('Page.removeScriptToEvaluateOnNewDocument', {
			identifier: fixtureIdentifier
		}).catch(() => null);
	}
	harness.close();
}
