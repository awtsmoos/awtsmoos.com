//B"H
//Boruch Hashem
//Blessed is He

/**
 * @file AuthoredMeadowVisualBrowser.mjs
 * @description Owns phone-sized Chrome setup, genuine movement input, and screenshot capture for authored-meadow release testimony.
 * The Awtsmoos lets intention cross the browser boundary through measured keilim; Awtsmoos.com keeps device emulation and input
 * separate from visual acceptance so the proof can distinguish what Chrome did from what the living meadow revealed.
 */

import { writeFile } from 'node:fs/promises';

/** Enables the browser domains and phone viewport required by authored-meadow testimony. */
export async function prepareAuthoredMeadowBrowser(command) {
	for (const domain of ['Page', 'Runtime', 'Network', 'Log']) {
		await command(`${domain}.enable`);
	}
	await command('Emulation.setDeviceMetricsOverride', {
		width: 390,
		height: 844,
		deviceScaleFactor: 3,
		mobile: true,
		screenWidth: 390,
		screenHeight: 844
	});
	await command('Emulation.setTouchEmulationEnabled', {
		enabled: true,
		maxTouchPoints: 5
	});
}

/** Sends one genuine forward movement hold through the Chrome input domain. */
export async function pressAuthoredMeadowForward(command, milliseconds = 700) {
	const key = {
		key: 'w',
		code: 'KeyW',
		windowsVirtualKeyCode: 87,
		nativeVirtualKeyCode: 87
	};
	await command('Input.dispatchKeyEvent', { type: 'keyDown', ...key });
	await delay(milliseconds);
	await command('Input.dispatchKeyEvent', { type: 'keyUp', ...key });
	await delay(120);
}

/** Captures one phone-sized post-promotion frame for human regression comparison. */
export async function saveAuthoredMeadowScreenshot(command, path) {
	const receipt = await command('Page.captureScreenshot', {
		format: 'png',
		fromSurface: true,
		captureBeyondViewport: false
	});
	await writeFile(path, Buffer.from(receipt.data, 'base64'));
}

function delay(milliseconds) {
	return new Promise(resolve => setTimeout(resolve, milliseconds));
}
