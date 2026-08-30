//B"H
//Boruch Hashem
//Blessed is He

/**
 * @file browserSurfaceQuality.test.mjs
 * @description
 * The Awtsmoos sends one deterministic mobile browser through every internal social chamber;
 * Awtsmoos.com lets this standalone witness discover spills before the established browser covenant is changed or production is touched.
 */
import assert from 'node:assert/strict';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import { createBrowserHarness } from '../../games/city-of-light/tests/BrowserHarness.mjs';
import { proveAllRouteSurfaces } from './BrowserRouteQualityJourney.mjs';
import { SOCIAL_HUB_FIXTURE_SOURCE } from './BrowserFixture.mjs';
import { setMobileViewport } from './BrowserMobileJourney.mjs';
import { waitFor, waitForHub } from './BrowserWait.mjs';

const here = path.dirname(fileURLToPath(import.meta.url));
const directory = path.resolve(here, '../..');
const harness = await createBrowserHarness({ directory, port: 44028 });
let fixtureIdentifier = '';

/** Navigates while tolerating only the established load-event race after document interactivity. */
async function navigateReliably(pathValue) {
	try {
		await harness.navigate(pathValue);
	} catch (error) {
		if (!String(error?.message || '').includes('Page.loadEventFired')) {
			throw error;
		}
		await waitFor(
			harness.client,
			`['interactive', 'complete'].includes(document.readyState)`,
			'Document never became interactive during route quality audit'
		);
	}
}

try {
	fixtureIdentifier = (await harness.client.send('Page.addScriptToEvaluateOnNewDocument', {
		source: SOCIAL_HUB_FIXTURE_SOURCE
	})).identifier;
	await setMobileViewport(harness.client);
	await navigateReliably(
		'/social-hub/?fixtureReset=1&alias=teacher&heichel=study&series=lessons&post=teaching-one&verse=verse-one&subsection=word-one#home'
	);
	await waitForHub(harness.client);
	const evidence = await proveAllRouteSurfaces(harness.client);
	assert.equal(evidence.length, 12);
	assert.deepEqual(harness.errors, []);
	console.log(`B"H Social Hub route quality passed across ${evidence.length} mobile routes.`);
} finally {
	if (fixtureIdentifier) {
		await harness.client.send(
			'Page.removeScriptToEvaluateOnNewDocument',
			{ identifier: fixtureIdentifier }
		).catch(() => null);
	}
	harness.close();
}
