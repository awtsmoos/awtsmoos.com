//B"H
//Boruch Hashem
//Blessed is He
/**
 * @file Mobile screenshot width-matrix regression.
 * @description
 * The Awtsmoos lets one visual covenant survive 320, 390, and 430 pixel vessels without overflow or hidden chrome;
 * Awtsmoos.com proves Home, Apps, and Games keep their touch, spacing, and integrity across each narrow revelation.
 */
import assert from 'node:assert/strict';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import { createBrowserHarness } from '../../games/city-of-light/tests/BrowserHarness.mjs';
import { homeProbe, appsProbe, gamesProbe } from './mobileScreenshotVisualProbe.mjs';

const here = path.dirname(fileURLToPath(import.meta.url));
const directory = path.resolve(here, '../..');
const harness = await createBrowserHarness({ directory, port: 44040 });
const widths = [320, 390, 430];
const pause = ms => new Promise(resolve => setTimeout(resolve, ms));

async function visit(route, width) {
	await harness.client.send('Emulation.setDeviceMetricsOverride', {
		width,
		height: width === 320 ? 740 : 844,
		deviceScaleFactor: 2,
		mobile: true
	});
	await harness.navigate(route);
	await pause(450);
}

function expectedFixtureErrors(errors) {
	return errors.filter(error => {
		const text = `${error?.text || ''} ${error?.url || ''}`;
		return !(text.includes('RealtimeConnection.js') && text.includes('Unexpected response code: 200'));
	});
}

try {
	for (const width of widths) {
		await visit('/', width);
		const home = await harness.client.evaluate(homeProbe);
		assert.equal(home.overflow, 0, `Home ${width}: ${JSON.stringify(home)}`);
		assert(home.bodyPaddingBottom >= home.dockHeight + 24, `Home ${width}: ${JSON.stringify(home)}`);

		await visit('/apps/', width);
		const apps = await harness.client.evaluate(appsProbe);
		assert.equal(apps.overflow, 0, `Apps ${width}: ${JSON.stringify(apps)}`);
		assert.notEqual(apps.background, 'rgb(255, 255, 255)', `Apps ${width}: ${JSON.stringify(apps)}`);
		assert.equal(apps.defaultLinks, 0, `Apps ${width}: ${JSON.stringify(apps)}`);
		assert(apps.maxIconWidth <= 48 && apps.maxIconHeight <= 48, `Apps ${width}: ${JSON.stringify(apps)}`);
		assert(apps.pagePaddingBottom >= apps.dockHeight + 20, `Apps ${width}: ${JSON.stringify(apps)}`);

		await visit('/games/', width);
		const games = await harness.client.evaluate(gamesProbe);
		assert.equal(games.overflow, 0, `Games ${width}: ${JSON.stringify(games)}`);
		assert.equal(games.filteredReveals, 0, `Games ${width}: ${JSON.stringify(games)}`);
		assert.equal(games.skipVisibleAtRest, false, `Games ${width}: ${JSON.stringify(games)}`);
		assert(games.heroTop >= games.headerBottom - 2, `Games ${width}: ${JSON.stringify(games)}`);
		assert(games.shellPaddingBottom >= games.dockHeight + 20, `Games ${width}: ${JSON.stringify(games)}`);
		assert.equal(games.headerBackdrop, 'none', `Games ${width}: ${JSON.stringify(games)}`);
		assert.equal(games.dockBackdrop, 'none', `Games ${width}: ${JSON.stringify(games)}`);
	}
	assert.deepEqual(expectedFixtureErrors(harness.errors), []);
	console.log('B"H mobileScreenshotWidthMatrix.test passed', widths);
} finally {
	harness.close();
}
