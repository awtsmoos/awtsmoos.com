//B"H
//Boruch Hashem
//Blessed is He

/**
 * @file browserSmoke.test.mjs
 * @description
 * Real Chrome proves the premium landing, discovery, and Heichel selectors across
 * desktop, mobile, and reduced motion. Two static-server feed routes receive empty
 * read-only fixtures so visual proof remains clean without inventing live social data.
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
const evidence = path.resolve(
	here,
	'../../../ai-thoughts/2026-07-14-144700-premium-heichel-visual-system'
);
const harness = await createBrowserHarness({ directory, port: 44057 });
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
	await settle(harness.client, 1200);
	const homeDesktop = await inspectHome(harness.client);
	assert.equal(homeDesktop.premium, true);
	assert.equal(homeDesktop.actions, 4);
	assert.equal(homeDesktop.feed, true);
	assert(homeDesktop.columns.split(' ').length >= 2);
	assert(homeDesktop.titleSize >= 48);
	await harness.screenshot(path.join(evidence, 'premium-home-desktop.png'));

	await harness.navigate('/tests/premium-visual/discovery-fixture.html');
	await settle(harness.client);
	const discovery = await inspectDiscovery(harness.client);
	assert.equal(discovery.cards, 3);
	assert(discovery.columns.split(' ').length >= 3);
	assert(discovery.height >= 260);
	assert.equal(discovery.searchPosition, 'sticky');
	await harness.screenshot(path.join(evidence, 'premium-discovery-desktop.png'));

	await harness.navigate('/tests/premium-visual/heichel-fixture.html');
	await settle(harness.client);
	const heichelDesktop = await inspectHeichel(harness.client);
	assert.equal(heichelDesktop.cards, 3);
	assert(heichelDesktop.columns.split(' ').length >= 2);
	assert(heichelDesktop.gridColumns.split(' ').length >= 3);
	assert(parseFloat(heichelDesktop.cardRadius) >= 12);
	await harness.screenshot(path.join(evidence, 'premium-heichel-desktop.png'));

	await harness.client.send('Emulation.setDeviceMetricsOverride', {
		width: 390,
		height: 844,
		deviceScaleFactor: 2,
		mobile: true
	});
	await harness.navigate('/');
	await settle(harness.client, 800);
	const homeMobile = await inspectHome(harness.client);
	assert.equal(homeMobile.viewport[0], 390);
	assert.equal(homeMobile.columns.split(' ').length, 1);
	assert.equal(homeMobile.dockPosition, 'sticky');
	await harness.screenshot(path.join(evidence, 'premium-home-mobile.png'));

	await harness.navigate('/tests/premium-visual/heichel-fixture.html');
	await settle(harness.client);
	const heichelMobile = await inspectHeichel(harness.client);
	assert.equal(heichelMobile.viewport[0], 390);
	assert.equal(heichelMobile.columns.split(' ').length, 1);
	assert.notEqual(heichelMobile.dockDisplay, 'none');
	assert.equal(heichelMobile.dockPosition, 'fixed');
	await harness.screenshot(path.join(evidence, 'premium-heichel-mobile.png'));

	await harness.client.send('Emulation.setEmulatedMedia', {
		media: 'screen',
		features: [{ name: 'prefers-reduced-motion', value: 'reduce' }]
	});
	await harness.navigate('/tests/premium-visual/heichel-fixture.html');
	await settle(harness.client);
	const reduced = await inspectReducedMotion(harness.client);
	assert.equal(reduced.matches, true);
	assert(['0s', '0.001s'].includes(reduced.heroAnimation));
	assert(reduced.cardTransition === '0s' || reduced.cardTransition.includes('0.001s'));
	await harness.screenshot(path.join(evidence, 'premium-heichel-reduced-motion.png'));
	assert.deepEqual(harness.errors, []);
	console.log('premium visual browserSmoke.test passed');
} finally {
	if (fixtureIdentifier) {
		await harness.client.send('Page.removeScriptToEvaluateOnNewDocument', {
			identifier: fixtureIdentifier
		}).catch(() => null);
	}
	harness.close();
}
