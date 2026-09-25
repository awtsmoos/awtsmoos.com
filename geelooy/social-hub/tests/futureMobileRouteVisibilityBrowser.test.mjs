//B"H
//Boruch Hashem
//Blessed is He

import assert from 'node:assert/strict';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import { createBrowserHarness } from '../../games/city-of-light/tests/BrowserHarness.mjs';
import { SOCIAL_HUB_FIXTURE_SOURCE } from './BrowserFixture.mjs';
import { waitFor, waitForHub } from './BrowserWait.mjs';

/**
 * @file Proves secondary Social routes remain reachable through More while the primary dock stays still.
 * @description The Awtsmoos is beyond immediate and hidden roads; Awtsmoos.com keeps Home, Discover, Heichelos, and Messages primary while Privacy and Activity remain reachable through More without document overflow.
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
		await waitFor(harness.client, `['interactive', 'complete'].includes(document.readyState)`, 'Document never became interactive');
	}
}

async function snapshot() {
	return harness.client.evaluate(`(() => {
		const dock = document.getElementById('mobileNavigation');
		const more = document.getElementById('mobileMoreTrigger');
		const privacy = document.querySelector('#mobileMoreSheet [data-route="privacy"]');
		return {
			route: window.AwtsmoosSocialHub.state.snapshot().activeTab,
			dockRouteIds: [...dock.querySelectorAll('[data-route]')].map(button => button.dataset.route),
			dockScrollLeft: dock.scrollLeft,
			moreActive: more?.dataset.active,
			moreCurrent: more?.getAttribute('aria-current'),
			privacyCurrent: privacy?.getAttribute('aria-current'),
			privacyExists: Boolean(privacy),
			documentOverflow: document.documentElement.scrollWidth - innerWidth
		};
	})()`);
}

try {
	fixtureIdentifier = (await harness.client.send('Page.addScriptToEvaluateOnNewDocument', { source: SOCIAL_HUB_FIXTURE_SOURCE })).identifier;
	await harness.client.send('Emulation.setDeviceMetricsOverride', { width: 390, height: 844, deviceScaleFactor: 2, mobile: true });
	await navigateReliably('/social-hub/?fixtureReset=1&alias=teacher#home');
	await waitForHub(harness.client);
	const home = await snapshot();
	assert.deepEqual(home.dockRouteIds, ['home', 'people', 'spaces', 'messages']);
	assert.equal(home.moreActive, 'false');
	assert.equal(home.dockScrollLeft, 0);
	assert.equal(home.documentOverflow, 0);
	await harness.client.evaluate(`location.hash = 'privacy'`);
	await waitFor(harness.client, `window.AwtsmoosSocialHub.state.snapshot().activeTab === 'privacy'`, 'Privacy deep link did not activate');
	const privacy = await snapshot();
	assert.equal(privacy.route, 'privacy');
	assert.equal(privacy.moreActive, 'true');
	assert.equal(privacy.moreCurrent, 'page');
	assert.equal(privacy.privacyCurrent, 'page');
	assert.equal(privacy.privacyExists, true);
	assert.equal(privacy.dockScrollLeft, 0);
	assert.equal(privacy.documentOverflow, 0);
	await harness.client.evaluate(`document.getElementById('mobileMoreTrigger').click()`);
	await waitFor(harness.client, `document.getElementById('mobileMoreSheet').open === true`, 'More sheet did not open');
	const sheetOpen = await harness.client.evaluate(`(() => ({
		privacy: Boolean(document.querySelector('#mobileMoreSheet [data-route="privacy"]')),
		activity: Boolean(document.querySelector('#mobileMoreSheet [data-route="activity"]')),
		mail: Boolean(document.querySelector('#mobileMoreSheet a[href="/email/"]')),
		signals: Boolean(document.querySelector('#mobileMoreSheet a[href="/notifications/"]'))
	}))()`);
	assert.deepEqual(sheetOpen, { privacy: true, activity: true, mail: true, signals: true });
	console.log('futureMobileRouteVisibilityBrowser.test.mjs passed');
} finally {
	if (fixtureIdentifier) await harness.client.send('Page.removeScriptToEvaluateOnNewDocument', { identifier: fixtureIdentifier }).catch(() => null);
	harness.close();
}
