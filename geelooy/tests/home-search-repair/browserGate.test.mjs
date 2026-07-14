// B"H
// Boruch Hashem
// Blessed is He

/**
 * @file browserGate.test.mjs
 * @description
 * Real Chrome proves Home and the living library at desktop and mobile widths,
 * including readable source text, active style ownership, and WCAG contrast.
 */

import assert from 'node:assert/strict';
import { writeFileSync } from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import { createBrowserHarness } from '../../games/city-of-light/tests/BrowserHarness.mjs';
import { API_FIXTURE_SOURCE } from './ApiFixture.mjs';
import { configureFreshBrowser } from './browserGateHelpers.mjs';
import {
	desktopJourney,
	mobileJourney
} from './browserJourneys.mjs';

const here = path.dirname(fileURLToPath(import.meta.url));
const directory = path.resolve(here, '../..');
const evidence = path.resolve(
	here,
	'../../../ai-thoughts/2026-07-14-150249-home-search-css-conflict-repair'
);
const receipt = path.join(evidence, '25_browser_contrast.json');
const steps = [];
const timer = setTimeout(() => fail('HARD_TIMEOUT'), 90_000);
const harness = await createBrowserHarness({
	directory,
	port: 44137
});
let fixtureIdentifier = '';

try {
	fixtureIdentifier = (await harness.client.send(
		'Page.addScriptToEvaluateOnNewDocument',
		{ source: API_FIXTURE_SOURCE }
	)).identifier;
	await configureFreshBrowser(harness.client);
	const context = {
		harness,
		evidence,
		steps
	};
	await desktopJourney(context);
	await mobileJourney(context);
	assert.deepEqual(harness.errors, []);
	writeFileSync(receipt, JSON.stringify({
		BH: 'B"H',
		ok: true,
		steps
	}, null, 2));
	console.log('browserGate.test passed');
} catch (error) {
	fail(error.stack || error.message);
} finally {
	clearTimeout(timer);
	if (fixtureIdentifier) {
		await harness.client.send(
			'Page.removeScriptToEvaluateOnNewDocument',
			{ identifier: fixtureIdentifier }
		).catch(() => null);
	}
	harness.close();
}

function fail(message) {
	writeFileSync(receipt, JSON.stringify({
		BH: 'B"H',
		ok: false,
		message,
		steps
	}, null, 2));
	console.error(message);
	process.exitCode = 1;
}
