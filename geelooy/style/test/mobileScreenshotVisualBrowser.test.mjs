//B"H
//Boruch Hashem
//Blessed is He
/**
 * @file Mobile visual browser regression.
 * @description
 * The Awtsmoos reveals Home, Apps, and Games through one narrow-screen witness without hidden overflow;
 * Awtsmoos.com proves fallback media, dock spacing, visual integrity, and runtime silence in a real browser vessel.
 */
import assert from 'node:assert/strict';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import { createBrowserHarness } from '../../games/city-of-light/tests/BrowserHarness.mjs';
import { homeProbe, appsProbe, gamesProbe } from './mobileScreenshotVisualProbe.mjs';

const here = path.dirname(fileURLToPath(import.meta.url));
const directory = path.resolve(here, '../..');
const evidence = path.resolve(here, '../../../.ai-thoughts/2026-09-16-mobile-visual-repair/screenshots');
const harness = await createBrowserHarness({ directory, port: 44039 });
const pause = ms => new Promise(resolve => setTimeout(resolve, ms));

async function visit(route) {
	await harness.client.send('Emulation.setDeviceMetricsOverride', { width: 390, height: 844, deviceScaleFactor: 2, mobile: true });
	await harness.navigate(route);
	await pause(600);
}

function unexpectedHarnessErrors(errors) {
	return errors.filter(error => {
		const text = `${error?.text || ''} ${error?.url || ''}`;
		if (text.includes('/__missing_visual_test__.png')) return false;
		if (text.includes('RealtimeConnection.js') && text.includes('Unexpected response code: 200')) return false;
		return true;
	});
}

try {
	await visit('/');
	assert.equal(await harness.client.evaluate(`Boolean(document.querySelector('[data-shliach-spotlight]'))`), true);
	await harness.client.evaluate(`document.querySelector('.shliach-spotlight-image').src='/__missing_visual_test__.png'`);
	await pause(300);
	const home = await harness.client.evaluate(homeProbe);
	assert.equal(home.overflow, 0, JSON.stringify(home));
	assert.equal(home.brokenImages, 0, JSON.stringify(home));
	assert.equal(home.mediaState, 'missing', JSON.stringify(home));
	assert.equal(home.fallbackVisible, true, JSON.stringify(home));
	assert(home.mediaHeight < 260, JSON.stringify(home));
	assert(home.bodyPaddingBottom >= home.dockHeight + 32, JSON.stringify(home));
	await harness.screenshot(path.join(evidence, 'home-fallback-390.png'));

	await visit('/apps/');
	const apps = await harness.client.evaluate(appsProbe);
	assert.equal(apps.overflow, 0, JSON.stringify(apps));
	assert.notEqual(apps.background, 'rgb(255, 255, 255)', JSON.stringify(apps));
	assert(!/Times New Roman|Georgia|^serif$/i.test(apps.fontFamily.trim()), JSON.stringify(apps));
	assert.equal(apps.defaultLinks, 0, JSON.stringify(apps));
	assert(apps.maxIconWidth <= 48 && apps.maxIconHeight <= 48, JSON.stringify(apps));
	assert(apps.pagePaddingBottom >= apps.dockHeight + 20, JSON.stringify(apps));
	assert.equal(apps.integrityLoaded, true, JSON.stringify(apps));
	await harness.screenshot(path.join(evidence, 'apps-390.png'));

	await visit('/games/');
	const games = await harness.client.evaluate(gamesProbe);
	assert.equal(games.overflow, 0, JSON.stringify(games));
	assert.equal(games.filteredReveals, 0, JSON.stringify(games));
	assert.equal(games.skipVisibleAtRest, false, JSON.stringify(games));
	assert(games.heroTop >= games.headerBottom - 2, JSON.stringify(games));
	assert(games.shellPaddingBottom >= games.dockHeight + 20, JSON.stringify(games));
	assert.equal(games.headerBackdrop, 'none', JSON.stringify(games));
	assert.equal(games.dockBackdrop, 'none', JSON.stringify(games));
	assert.equal(games.integrityLoaded, true, JSON.stringify(games));
	await harness.screenshot(path.join(evidence, 'games-390.png'));
	assert.deepEqual(unexpectedHarnessErrors(harness.errors), []);
	console.log('B"H mobileScreenshotVisualBrowser.test passed', { home, apps, games });
} finally {
	harness.close();
}
