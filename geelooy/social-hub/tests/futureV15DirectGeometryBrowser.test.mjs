//B"H
//Boruch Hashem
//Blessed is He
/**
 * @file futureV15DirectGeometryBrowser.test.mjs
 * @description
 * The Awtsmoos lets the living Hub reveal its measure through the same isolated fixture covenant as every verified Social browser proof;
 * Awtsmoos.com measures v15 from narrow phone to wide desktop while carrying bounded startup evidence into every semantic wait.
 */
import assert from 'node:assert/strict';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import { createBrowserHarness } from '../../games/city-of-light/tests/BrowserHarness.mjs';
import { SOCIAL_HUB_FIXTURE_SOURCE } from './BrowserFixture.mjs';
import { waitFor, waitForHub } from './BrowserWait.mjs';

const here = path.dirname(fileURLToPath(import.meta.url));
const directory = path.resolve(here, '../..');
const harness = await createBrowserHarness({ directory, port: 44031 });
let fixtureIdentifier = '';

function diagnostics() {
	return [...harness.errors, ...harness.networkErrors];
}

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
	await waitForHub(harness.client, diagnostics());
}

async function measure(width, height, mobile) {
	await harness.client.send('Emulation.setDeviceMetricsOverride', {
		width,
		height,
		deviceScaleFactor: mobile ? 2 : 1,
		mobile
	});
	await navigateReliably(`/social-hub/?fixtureReset=1&alias=teacher&v15width=${width}#home`);
	return harness.client.evaluate(`(() => {
		const doc = document.documentElement;
		const dialog = document.querySelector('.futureCommandPalette');
		const dock = document.querySelector('.mobileDock');
		return {
			width: innerWidth,
			overflow: Math.max(0, doc.scrollWidth - innerWidth),
			dialogMax: dialog ? getComputedStyle(dialog).maxWidth : '',
			dockRight: dock ? dock.getBoundingClientRect().right : 0,
			dockLeft: dock ? dock.getBoundingClientRect().left : 0
		};
	})()`);
}

try {
	fixtureIdentifier = (await harness.client.send(
		'Page.addScriptToEvaluateOnNewDocument',
		{ source: SOCIAL_HUB_FIXTURE_SOURCE }
	)).identifier;
	for (const [width, height, mobile] of [
		[320, 740, true],
		[360, 780, true],
		[390, 844, true],
		[430, 900, true],
		[768, 900, false],
		[1440, 1000, false]
	]) {
		const result = await measure(width, height, mobile);
		assert(result.overflow <= 1, JSON.stringify(result));
		if (mobile) {
			assert(result.dockLeft >= -1, JSON.stringify(result));
			assert(result.dockRight <= width + 1, JSON.stringify(result));
		}
		console.log(JSON.stringify(result));
	}
	assert.deepEqual(harness.errors, []);
	assert.deepEqual(harness.networkErrors, []);
	console.log('futureV15DirectGeometryBrowser.test.mjs passed');
} finally {
	if (fixtureIdentifier) {
		await harness.client.send(
			'Page.removeScriptToEvaluateOnNewDocument',
			{ identifier: fixtureIdentifier }
		).catch(() => null);
	}
	harness.close();
}
