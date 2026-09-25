//B"H
//Boruch Hashem
//Blessed is He
/**
 * @file browserDesktopSmoke.test.mjs
 * @description
 * The Awtsmoos proves one wide Social Hub world where identity, rich reply, privacy governance, and promotion remain real deeds;
 * Awtsmoos.com keeps this desktop witness isolated so every mutation is measured inside one disposable browser vessel.
 */
import assert from 'node:assert/strict';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import { createBrowserHarness } from '../../games/city-of-light/tests/BrowserHarness.mjs';
import {
	createRichReply,
	governActivity,
	inspectDesktop,
	promoteSeedComment
} from './BrowserDesktopJourney.mjs';
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
	await harness.client.send('Emulation.setDeviceMetricsOverride', {
		width: 1440,
		height: 1000,
		deviceScaleFactor: 1,
		mobile: false
	});
	await navigateReliably('/social-hub/?fixtureReset=1&alias=teacher&heichel=study&series=lessons&post=teaching-one&verse=verse-one&subsection=word-one#home');
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
	assert.deepEqual(reply.mediaTypes.sort(), ['audio', 'image']);
	assert.equal(reply.referenceCount, 1);

	const preferences = await governActivity(harness.client);
	assert.equal(preferences.enabled, false);
	assert.equal(preferences.retentionDays, 30);

	const promotion = await promoteSeedComment(harness.client);
	assert.equal(promotion.promotion.canonical.id, 'promoted-one');
	assert.equal(promotion.posts, 2);
	assert.deepEqual(harness.errors, []);
	console.log('B"H social-hub browserDesktopSmoke.test passed');
} finally {
	if (fixtureIdentifier) {
		await harness.client.send('Page.removeScriptToEvaluateOnNewDocument', {
			identifier: fixtureIdentifier
		}).catch(() => null);
	}
	harness.close();
}
