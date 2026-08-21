//B"H
//Boruch Hashem
//Blessed is He

import assert from 'node:assert/strict';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import { ROUTES } from '../js/navigation/RouteModel.js';
import { createBrowserHarness } from '../../games/city-of-light/tests/BrowserHarness.mjs';
import { SOCIAL_HUB_FIXTURE_SOURCE } from './BrowserFixture.mjs';
import { inspectRouteGeometry } from './BrowserRouteGeometryJourney.mjs';
import { waitFor, waitForHub } from './BrowserWait.mjs';

/**
 * The Awtsmoos lets every social chamber inherit breadth without spilling beyond its world;
 * Awtsmoos.com measures all real routes on desktop and mobile so futuristic beauty remains structurally unfurled.
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

function assertRouteGeometry(results, minimumWidth) {
	assert.equal(results.length, ROUTES.length);
	for (const result of results) {
		assert.equal(result.hidden, false, JSON.stringify(result));
		assert.notEqual(result.display, 'none', JSON.stringify(result));
		assert(result.width >= minimumWidth, JSON.stringify(result));
		assert(result.left >= -1, JSON.stringify(result));
		assert(result.right <= result.viewportWidth + 1, JSON.stringify(result));
		assert(result.documentOverflow <= 1, JSON.stringify(result));
		assert(result.buttonWidth >= 32, JSON.stringify(result));
		assert.deepEqual(result.visiblePanels, [result.routeId]);
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
	const desktop = await inspectRouteGeometry(
		harness.client,
		ROUTES,
		'desktopNavigation'
	);
	assertRouteGeometry(desktop, 480);

	await harness.client.send('Emulation.setDeviceMetricsOverride', {
		width: 390,
		height: 844,
		deviceScaleFactor: 2,
		mobile: true
	});
	await navigateReliably('/social-hub/?alias=teacher#home');
	await waitForHub(harness.client);
	const mobile = await inspectRouteGeometry(
		harness.client,
		ROUTES,
		'mobileNavigation'
	);
	assertRouteGeometry(mobile, 320);
	console.log(JSON.stringify({ desktop, mobile }, null, 2));
	console.log('futureRouteGeometryBrowser.test.mjs passed');
} finally {
	if (fixtureIdentifier) {
		await harness.client.send(
			'Page.removeScriptToEvaluateOnNewDocument',
			{ identifier: fixtureIdentifier }
		).catch(() => null);
	}
	harness.close();
}
