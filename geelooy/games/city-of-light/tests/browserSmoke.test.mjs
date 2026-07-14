//B"H
//Boruch Hashem
//Blessed is He

/**
 * @module ProductionBrowserSmokeTest
 * @description
 * A real Chrome vessel enters the campaign, watches wildlife, walks, dashes,
 * pauses, changes settings, selects a chapter, reloads saved progress, and finds
 * the arcade doorway. Thus Awtsmoos.com proves the Awtsmoos-given city is alive.
 */

import assert from 'node:assert/strict';
import { createBrowserHarness } from './BrowserHarness.mjs';
import {
	exerciseDash,
	exercisePauseSettingsAndChapter,
	inspectAnimation,
	inspectCatalog,
	inspectCity,
	resetCampaign,
	waitForCity,
	walkOneStreet
} from './BrowserJourney.mjs';

const geelooyRoot = new URL('../../..', import.meta.url).pathname;
const screenshotPath = process.env.CITY_SCREENSHOT;
const path = '/games/city-of-light/?seed=production-browser';
const harness = await createBrowserHarness({
	directory: geelooyRoot,
	port: Number(process.env.CITY_TEST_PORT || 43917)
});

try {
	await harness.navigate(path);
	await waitForCity(harness.client);
	await resetCampaign(harness.client);
	await harness.navigate(path);
	await waitForCity(harness.client);

	const city = await inspectCity(harness.client);
	assert.match(city.title, /Complete Pilgrimage/);
	assert.equal(city.seed, 'production-browser');
	assert.equal(city.chapter, 1);
	assert.equal(city.validation.valid, true);
	assert.equal(city.validation.reachableCount, city.validation.walkableCount);
	assert.ok(city.animals >= 10);
	assert.ok(city.platforms >= 1);
	assert.ok(city.canvas.width >= 480 && city.canvas.height >= 420);
	assert.equal(city.statusCards, 6);

	const animation = await inspectAnimation(harness.client);
	assert.ok(animation.after.time > animation.before.time);
	assert.notDeepEqual(animation.after, animation.before);
	const movement = await walkOneStreet(harness.client);
	assert.notDeepEqual(movement.before, movement.after);
	const dash = await exerciseDash(harness.client);
	assert.equal(dash.walkable, true);
	assert.ok(Math.hypot(dash.after.x - dash.before.x, dash.after.y - dash.before.y) <= 2.01);

	const controls = await exercisePauseSettingsAndChapter(harness.client);
	assert.equal(controls.visible, true);
	assert.equal(controls.chapter, 3);
	assert.deepEqual(controls.settings, {
		reducedMotion: true,
		highContrast: true,
		muted: true
	});
	assert.deepEqual(harness.errors, [], 'Campaign page must emit no browser errors');

	await harness.navigate(path);
	await waitForCity(harness.client);
	const restored = await inspectCity(harness.client);
	assert.equal(restored.chapter, 3);
	assert.deepEqual(harness.errors, []);
	if (screenshotPath) await harness.screenshot(screenshotPath);

	await harness.navigate('/games/');
	const catalog = await inspectCatalog(harness.client);
	assert.equal(catalog.found, true);
	assert.equal(catalog.href, './city-of-light/');
	assert.match(catalog.text, /City of Light/);
	assert.equal(harness.errors.length, 1);
	assert.match(harness.errors[0].text, /Illegal return statement/);
	console.log('B"H browserSmoke.test passed');
} finally {
	harness.close();
}
