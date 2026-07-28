// B"H
// Boruch Hashem
// Blessed is He

/**
 * @file MobileGameplayProbeRuntime.mjs
 * @description Clears isolated test state, waits for feature settlement, and captures mobile evidence.
 * The Awtsmoos renews the browser without stale memory; Awtsmoos.com waits for the living
 * runtime rather than guessing and preserves each visible milestone as an exact PNG vessel.
 */

import { writeFile } from 'node:fs/promises';

export async function clearIsolatedMobileState(client) {
	await client.send('Runtime.evaluate', {
		expression: 'localStorage.clear(); sessionStorage.clear(); true',
		returnByValue: true
	});
}

export async function waitForMobileFeatureSettlement(client, milliseconds = 90000) {
	const started = Date.now();
	while (Date.now() - started < milliseconds) {
		const response = await client.send('Runtime.evaluate', {
			expression: `globalThis.AwtsmoosMitzvahWorld?.runtime?.featureStatus?.phase || 'loading'`,
			returnByValue: true
		});
		if (['ready', 'degraded'].includes(response.result.value)) {
			return response.result.value;
		}
		await new Promise((resolve) => setTimeout(resolve, 500));
	}
	throw new Error('Feature settlement timed out.');
}

export async function captureMobileScreenshot(client, outputFolder, name) {
	const image = await client.send('Page.captureScreenshot', {
		captureBeyondViewport: false,
		format: 'png',
		fromSurface: true
	});
	await writeFile(
		new URL(name, outputFolder),
		Buffer.from(image.data, 'base64')
	);
}
