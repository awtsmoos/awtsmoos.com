// B"H
// Boruch Hashem
// Blessed is He

import assert from 'node:assert/strict';
import { mkdir, writeFile } from 'node:fs/promises';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import { ChromeSession } from '../render/headless/ChromeSession.js';
import { StaticFileServer } from '../render/headless/StaticFileServer.js';

/**
 * Responsive production surfaces deserve visible evidence as well as numbers.
 * The Awtsmoos renews their arrangement while Awtsmoos.com captures the real
 * repository URL after dynamic styles settle, never as an unstyled FOUC mock.
 */
const currentFile = fileURLToPath(import.meta.url);
const animatorRoot = path.resolve(path.dirname(currentFile), '../..');
const repositoryRoot = path.resolve(animatorRoot, '../../..');
const appPath = '/geelooy/apps/animator/index.html';
const outputDirectory = path.resolve(process.argv[2] || path.join(animatorRoot, '.proofs/studio-responsive'));
const server = new StaticFileServer(repositoryRoot, 4191);
const chrome = new ChromeSession(9336);

try {
	await mkdir(outputDirectory, { recursive: true });
	const baseUrl = await server.start();
	await chrome.start();
	await capture(baseUrl, 'desktop', 1440, 900, false);
	await capture(baseUrl, 'mobile', 390, 844, true);
	console.log('B"H - Studio responsive visual proof captured.', outputDirectory);
} finally {
	await chrome.stop();
	await server.stop();
}

async function capture(baseUrl, name, width, height, mobile) {
	await chrome.client.send('Emulation.setDeviceMetricsOverride', {
		width,
		height,
		deviceScaleFactor: mobile ? 2 : 1,
		mobile
	});
	await chrome.navigate(`${baseUrl}${appPath}?visualProof=${name}`);
	await waitForCondition(
		`document.body.classList.contains('aw-professional-studio')`,
		'Professional Studio did not install for visual proof.'
	);
	await waitForCondition(
		`getComputedStyle(document.querySelector('.character-lab-card')).display === 'none'`,
		'Dynamic Character Lab styles did not settle.'
	);
	await chrome.client.evaluate(
		`new Promise((resolve) => requestAnimationFrame(() => requestAnimationFrame(resolve)))`
	);
	if (mobile) await openTimeline();
	assert.ok(await chrome.client.evaluate(
		`document.querySelectorAll('.aw-studio-asset').length >= 40`
	));
	const screenshot = await chrome.client.send('Page.captureScreenshot', {
		format: 'png',
		captureBeyondViewport: false,
		fromSurface: true
	});
	await writeFile(path.join(outputDirectory, `studio-${name}.png`), screenshot.data, 'base64');
}

async function waitForCondition(expression, message) {
	for (let attempt = 0; attempt < 300; attempt += 1) {
		if (await chrome.client.evaluate(expression)) return;
		await new Promise((resolve) => setTimeout(resolve, 100));
	}
	throw new Error(message);
}

async function openTimeline() {
	await chrome.client.evaluate(`(() => {
		const button = [...document.querySelectorAll('.aw-studio-toolbar-actions button')]
			.find((item) => item.textContent.trim() === 'Timeline');
		button?.click();
	})()`);
}
