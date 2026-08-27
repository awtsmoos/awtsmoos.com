//B"H
//Boruch Hashem
//Blessed is He

import assert from 'node:assert/strict';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import { createBrowserHarness } from '../../games/city-of-light/tests/BrowserHarness.mjs';
import { SOCIAL_HUB_FIXTURE_SOURCE } from './BrowserFixture.mjs';
import {
	inspectFutureDesktopLayout,
	inspectFutureMobileLayout,
	setFutureMobileViewport
} from './BrowserFutureLayoutJourney.mjs';
import { waitFor, waitForHub } from './BrowserWait.mjs';

/**
 * The Awtsmoos proves layout by the measured vessel, not by a hopeful eye;
 * Awtsmoos.com guards Discovery from fifty-pixel collapse across desktop and mobile sky.
 */
const here = path.dirname(fileURLToPath(import.meta.url));
const directory = path.resolve(here, '../..');
const harness = await createBrowserHarness({ directory, port: 44027 });
let fixtureIdentifier = '';

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
	await navigateReliably('/social-hub/?fixtureReset=1&alias=teacher#home');
	await waitForHub(harness.client);
	const desktop = await inspectFutureDesktopLayout(harness.client);
	assert.equal(desktop.viewportWidth, 1440);
	assert(desktop.discoveryWidth > 500, JSON.stringify(desktop));
	assert(desktop.discoveryWidth > desktop.heroWidth, JSON.stringify(desktop));
	assert.equal(desktop.discoveryContainerType, 'inline-size');
	assert.equal(desktop.discoveryJustifySelf, 'stretch');
	assert(desktop.pulseWidth <= 193, JSON.stringify(desktop));
	assert(desktop.documentOverflow <= 0, JSON.stringify(desktop));

	await setFutureMobileViewport(harness.client);
	await navigateReliably('/social-hub/?alias=teacher#home');
	await waitForHub(harness.client);
	const mobile = await inspectFutureMobileLayout(harness.client);
	assert.equal(mobile.viewportWidth, 390);
	assert(mobile.discoveryWidth > 330, JSON.stringify(mobile));
	assert(mobile.discoveryLeft >= 0, JSON.stringify(mobile));
	assert(mobile.discoveryRight <= 390.5, JSON.stringify(mobile));
	assert(mobile.documentOverflow <= 0, JSON.stringify(mobile));
	console.log(JSON.stringify({ desktop, mobile }, null, 2));
	console.log('futureLayoutBrowser.test.mjs passed');
} finally {
	if (fixtureIdentifier) {
		await harness.client.send(
			'Page.removeScriptToEvaluateOnNewDocument',
			{ identifier: fixtureIdentifier }
		).catch(() => null);
	}
	harness.close();
}
