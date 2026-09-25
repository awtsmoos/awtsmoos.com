//B"H
//Boruch Hashem
//Blessed is He
/**
 * @file browserBootStress.test.mjs
 * @description
 * The Awtsmoos asks five fresh browser worlds to awaken the verified Social Hub alias without retrying one failed world;
 * Awtsmoos.com separates boot lifecycle pressure from geometry so an intermittent disappearance has one precise proving ground.
 */
import assert from 'node:assert/strict';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import { createBrowserHarness } from '../../games/city-of-light/tests/BrowserHarness.mjs';
import { SOCIAL_HUB_FIXTURE_SOURCE } from './BrowserFixture.mjs';
import { waitFor, waitForHub } from './BrowserWait.mjs';

const here = path.dirname(fileURLToPath(import.meta.url));
const directory = path.resolve(here, '../..');

async function navigateReliably(harness, pathValue) {
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

async function proveFreshBoot(cycle) {
	const harness = await createBrowserHarness({ directory, port: 44032 + cycle });
	let fixtureIdentifier = '';
	try {
		fixtureIdentifier = (await harness.client.send('Page.addScriptToEvaluateOnNewDocument', {
			source: SOCIAL_HUB_FIXTURE_SOURCE
		})).identifier;
		await harness.client.send('Emulation.setDeviceMetricsOverride', {
			width: 390,
			height: 844,
			deviceScaleFactor: 2,
			mobile: true
		});
		await navigateReliably(
			harness,
			`/social-hub/?fixtureReset=1&alias=teacher&bootStress=${cycle}#home`
		);
		const diagnostics = [...harness.errors, ...harness.networkErrors];
		const alias = await waitForHub(harness.client, diagnostics);
		assert.equal(alias, 'teacher');
		assert.deepEqual(harness.errors, []);
		assert.deepEqual(harness.networkErrors, []);
		console.log(`B"H social-hub boot stress cycle ${cycle + 1}/5 passed`);
	} finally {
		if (fixtureIdentifier) {
			await harness.client.send('Page.removeScriptToEvaluateOnNewDocument', {
				identifier: fixtureIdentifier
			}).catch(() => null);
		}
		harness.close();
	}
}

for (let cycle = 0; cycle < 5; cycle += 1) {
	await proveFreshBoot(cycle);
}

console.log('B"H social-hub browserBootStress.test passed');
