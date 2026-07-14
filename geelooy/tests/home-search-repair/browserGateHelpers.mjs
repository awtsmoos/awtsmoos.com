// B"H
// Boruch Hashem
// Blessed is He

/**
 * @module HomeSearchBrowserGateHelpers
 * @description
 * Browser sizing, navigation, contrast thresholds, and stylesheet ownership remain
 * reusable without obscuring the four-step visual journey.
 */

import assert from 'node:assert/strict';
import path from 'node:path';
import { inspectPage } from './ContrastProbe.mjs';

export async function configureFreshBrowser(client) {
	await client.send('Network.setCacheDisabled', {
		cacheDisabled: true
	});
	await client.send('Network.setBypassServiceWorker', {
		bypass: true
	});
}

export async function setViewport(client, width, height, mobile) {
	await client.send('Emulation.setDeviceMetricsOverride', {
		width,
		height,
		deviceScaleFactor: mobile ? 2 : 1,
		mobile
	});
}

export async function visit({
	harness,
	url,
	selectors,
	evidence,
	screenshot
}) {
	await harness.navigate(url);
	await new Promise(resolve => setTimeout(resolve, 900));
	const result = await inspectPage(harness.client, selectors);
	await harness.screenshot(path.join(evidence, screenshot));
	return result;
}

export async function columnCount(client, selector) {
	return client.evaluate(`(() => {
		const node = document.querySelector(${JSON.stringify(selector)});
		const value = getComputedStyle(node).gridTemplateColumns;
		return value.split(' ').filter(Boolean).length;
	})()`);
}

export function assertContrast(result, label) {
	assert(result.rows.length, `${label} produced no visible text rows.`);
	for (const row of result.rows) {
		const large = row.fontSize >= 24
			|| (row.fontSize >= 18.66 && row.fontWeight >= 700);
		const minimum = large ? 3 : 4.5;
		assert(
			row.contrast >= minimum,
			`${label}: ${row.selector} contrast ${row.contrast} < ${minimum}`
		);
	}
}

export function assertHomeStyles(result) {
	assert.equal(result.stylesheets.some(value => {
		return /geelooy-app\/index|profile-dropdown|social\/home\/(?:lux|future|fit|finish|sovereign|awake|recovery|premium|overhaul|beauty)/.test(value);
	}), false);
}

export function assertLibraryStyles(result) {
	assert.equal(result.stylesheets.some(value => {
		return /geelooy-app\/index|premium|aurora|glass/.test(value);
	}), false);
}
