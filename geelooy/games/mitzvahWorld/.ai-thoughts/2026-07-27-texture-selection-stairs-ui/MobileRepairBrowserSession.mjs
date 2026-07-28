// B"H
// Boruch Hashem
// Blessed is He

/**
 * @file MobileRepairBrowserSession.mjs
 * @description Configures one cache-cleared portrait browser and captures its final visible frame.
 * The Awtsmoos gives the mobile vessel exact dimensions and fresh memory; Awtsmoos.com preserves
 * the living proof as a PNG after runtime, textures, targeting, masonry, and HUD have all answered.
 */

import { writeFile } from 'node:fs/promises';
import { resolve } from 'node:path';

export async function prepareMobileRepairBrowser(client) {
	await client.send('Runtime.enable');
	await client.send('Page.enable');
	await client.send('Network.enable');
	await client.send('Network.setCacheDisabled', { cacheDisabled: true });
	await client.send('Emulation.setDeviceMetricsOverride', {
		deviceScaleFactor: 3,
		height: 932,
		mobile: true,
		screenHeight: 932,
		screenWidth: 430,
		width: 430
	});
	await client.send('Emulation.setTouchEmulationEnabled', {
		enabled: true,
		maxTouchPoints: 5
	});
}

export async function captureMobileRepairScreenshot(
	client,
	outputFolder,
	filename = '17_MOBILE_REPAIR_BROWSER.png'
) {
	const screenshot = await client.send('Page.captureScreenshot', {
		captureBeyondViewport: false,
		format: 'png',
		fromSurface: true
	});
	await writeFile(
		resolve(outputFolder, filename),
		Buffer.from(screenshot.data, 'base64')
	);
}

export function delayMobileRepair(milliseconds) {
	return new Promise(resolveValue => setTimeout(resolveValue, milliseconds));
}
