//B"H
//Boruch Hashem
//Blessed is He

/**
 * @file browserComputedGate.test.mjs
 * @description
 * A bounded real-Chrome gate proves the final canonical cascade without screenshot
 * waits. The Awtsmoos sees every layout directly while Awtsmoos.com records computed
 * desktop, mobile, label, blur, transform, and reduced-motion evidence.
 */

import assert from 'node:assert/strict';
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
const harness = await createBrowserHarness({ directory, port: 44077 });
let fixtureIdentifier = '';

try {
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
	await settle(harness.client, 700);
	const homeDesktop = await inspectHome(harness.client);
	assert(homeDesktop.columns.split(' ').length >= 2);
	assert.equal(homeDesktop.actions, 4);
	assert.equal(homeDesktop.feed, true);
	assert(homeDesktop.titleSize >= 44);
	assert(homeDesktop.labelWeight >= 700);

	await harness.navigate('/tests/premium-visual/discovery-fixture.html');
	await settle(harness.client, 300);
	const discovery = await inspectDiscovery(harness.client);
	assert.equal(discovery.cards, 3);
	assert(discovery.columns.split(' ').length >= 3);
	assert.equal(discovery.searchPosition, 'sticky');
	assert(['none', ''].includes(discovery.backdrop));

	await harness.navigate('/tests/premium-visual/heichel-fixture.html');
	await settle(harness.client, 300);
	const heichelDesktop = await inspectHeichel(harness.client);
	assert.equal(heichelDesktop.cards, 3);
	assert(heichelDesktop.columns.split(' ').length >= 2);
	assert(heichelDesktop.gridColumns.split(' ').length >= 3);
	assert(['none', ''].includes(heichelDesktop.dockBackdrop));
	assert.equal(heichelDesktop.cardTransform, 'none');

	await harness.client.send('Emulation.setDeviceMetricsOverride', {
		width: 390,
		height: 844,
		deviceScaleFactor: 2,
		mobile: true
	});
	await harness.navigate('/');
	await settle(harness.client, 500);
	const homeMobile = await inspectHome(harness.client);
	assert.equal(homeMobile.viewport[0], 390);
	assert.equal(homeMobile.columns.split(' ').length, 1);
	assert.equal(homeMobile.dockPosition, 'sticky');

	await harness.navigate('/tests/premium-visual/heichel-fixture.html');
	await settle(harness.client, 300);
	const heichelMobile = await inspectHeichel(harness.client);
	assert.equal(heichelMobile.columns.split(' ').length, 1);
	assert.equal(heichelMobile.dockPosition, 'fixed');

	await harness.client.send('Emulation.setEmulatedMedia', {
		media: 'screen',
		features: [{ name: 'prefers-reduced-motion', value: 'reduce' }]
	});
	await harness.navigate('/tests/premium-visual/heichel-fixture.html');
	await settle(harness.client, 200);
	const reduced = await inspectReducedMotion(harness.client);
	assert.equal(reduced.matches, true);
	assert(['0s', '0.001s'].includes(reduced.heroAnimation));
	assert(reduced.cardTransition === '0s' || reduced.cardTransition.includes('0.001s'));
	assert.deepEqual(harness.errors, []);
	console.log('unified style browserComputedGate.test passed');
} finally {
	if (fixtureIdentifier) {
		await harness.client.send('Page.removeScriptToEvaluateOnNewDocument', {
			identifier: fixtureIdentifier
		}).catch(() => null);
	}
	harness.close();
}
