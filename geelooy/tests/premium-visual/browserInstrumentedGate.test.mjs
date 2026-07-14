//B"H
//Boruch Hashem
//Blessed is He

/**
 * @file browserInstrumentedGate.test.mjs
 * @description
 * A hard-bounded real-Chrome journey writes each completed visual step immediately.
 * The Awtsmoos sees the whole while Awtsmoos.com prevents transport teardown from
 * hiding completed desktop, mobile, label, blur, transform, or motion assertions.
 */

import assert from 'node:assert/strict';
import { appendFileSync, writeFileSync } from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import { createBrowserHarness } from '../../games/city-of-light/tests/BrowserHarness.mjs';
import { HOME_API_FIXTURE_SOURCE } from './HomeApiFixture.mjs';
import {
	inspectDiscovery,
	inspectHeichel,
	inspectHome,
	inspectReducedMotion,
	settle
} from './BrowserVisualProbe.mjs';

const here = path.dirname(fileURLToPath(import.meta.url));
const directory = path.resolve(here, '../..');
const receipt = path.resolve(
	here,
	'../../../ai-thoughts/2026-07-14-203843-unified-style-consolidation/31_browser_steps.txt'
);
writeFileSync(receipt, 'B"H\nSTART\n');
const mark = value => appendFileSync(receipt, `${value}\n`);
const timeout = setTimeout(() => {
	mark('HARD_TIMEOUT');
	process.exit(124);
}, 45000);
const harness = await createBrowserHarness({ directory, port: 44097 });
let fixtureIdentifier = '';

try {
	mark('HARNESS_READY');
	fixtureIdentifier = (await harness.client.send(
		'Page.addScriptToEvaluateOnNewDocument',
		{ source: HOME_API_FIXTURE_SOURCE }
	)).identifier;
	await harness.client.send('Emulation.setDeviceMetricsOverride', {
		width: 1440,
		height: 1000,
		deviceScaleFactor: 1,
		mobile: false
	});
	await harness.navigate('/');
	await settle(harness.client, 600);
	const home = await inspectHome(harness.client);
	assert(home.columns.split(' ').length >= 2);
	assert(home.labelWeight >= 700);
	mark(`HOME_DESKTOP ${home.columns}`);

	await harness.navigate('/tests/premium-visual/discovery-fixture.html');
	await settle(harness.client, 250);
	const discovery = await inspectDiscovery(harness.client);
	assert(discovery.columns.split(' ').length >= 3);
	assert(['none', ''].includes(discovery.backdrop));
	mark(`DISCOVERY_DESKTOP ${discovery.columns}`);

	await harness.navigate('/tests/premium-visual/heichel-fixture.html');
	await settle(harness.client, 250);
	const heichel = await inspectHeichel(harness.client);
	assert(heichel.columns.split(' ').length >= 2);
	assert(heichel.gridColumns.split(' ').length >= 3);
	assert.equal(heichel.cardTransform, 'none');
	mark(`HEICHEL_DESKTOP ${heichel.gridColumns}`);

	await harness.client.send('Emulation.setDeviceMetricsOverride', {
		width: 390,
		height: 844,
		deviceScaleFactor: 2,
		mobile: true
	});
	await harness.navigate('/');
	await settle(harness.client, 400);
	const mobileHome = await inspectHome(harness.client);
	assert.equal(mobileHome.columns.split(' ').length, 1);
	mark(`HOME_MOBILE ${mobileHome.columns}`);

	await harness.navigate('/tests/premium-visual/heichel-fixture.html');
	await settle(harness.client, 250);
	const mobileHeichel = await inspectHeichel(harness.client);
	assert.equal(mobileHeichel.columns.split(' ').length, 1);
	assert.equal(mobileHeichel.dockPosition, 'fixed');
	mark(`HEICHEL_MOBILE ${mobileHeichel.columns}`);

	await harness.client.send('Emulation.setEmulatedMedia', {
		media: 'screen',
		features: [{ name: 'prefers-reduced-motion', value: 'reduce' }]
	});
	await harness.navigate('/tests/premium-visual/heichel-fixture.html');
	await settle(harness.client, 200);
	const reduced = await inspectReducedMotion(harness.client);
	assert.equal(reduced.matches, true);
	assert(['0s', '0.001s'].includes(reduced.heroAnimation));
	mark(`REDUCED_MOTION ${reduced.heroAnimation}`);
	assert.deepEqual(harness.errors, []);
	mark('ALL_ASSERTIONS_PASSED');
} finally {
	clearTimeout(timeout);
	if (fixtureIdentifier) {
		await harness.client.send('Page.removeScriptToEvaluateOnNewDocument', {
			identifier: fixtureIdentifier
		}).catch(() => null);
	}
	harness.close();
	mark('HARNESS_CLOSED');
}

console.log('unified style browserInstrumentedGate.test passed');
process.exit(0);
