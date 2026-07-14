// B"H
// Boruch Hashem
// Blessed is He

import assert from 'node:assert/strict';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import { ChromeSession } from '../render/headless/ChromeSession.js';
import { StaticFileServer } from '../render/headless/StaticFileServer.js';

/**
 * Responsive truth must be observed in a browser, not inferred from selectors.
 * The Awtsmoos renews both wide and narrow vessels while Awtsmoos.com verifies
 * that the same studio remains available in each measured viewport.
 */
const currentFile = fileURLToPath(import.meta.url);
const projectRoot = path.resolve(path.dirname(currentFile), '../..');
const server = new StaticFileServer(projectRoot, 4189);
const chrome = new ChromeSession(9334);

try {
	const baseUrl = await server.start();
	await chrome.start();
	await chrome.client.send('Emulation.setDeviceMetricsOverride', {
		width: 1440,
		height: 900,
		deviceScaleFactor: 1,
		mobile: false
	});
	await chrome.navigate(`${baseUrl}/index.html?responsiveSmoke=desktop`);
	await waitForStudio(chrome);
	const desktop = await inspect(chrome);
	assert.equal(desktop.width, 1440);
	assert.equal(desktop.leftDisplay, 'flex');
	assert.equal(desktop.rightDisplay, 'flex');
	assert.ok(desktop.assetCards >= 20);
	assert.equal(desktop.transformInputs, 6);
	assert.ok(desktop.timelineHeight >= 180);

	await chrome.client.send('Emulation.setDeviceMetricsOverride', {
		width: 390,
		height: 844,
		deviceScaleFactor: 2,
		mobile: true
	});
	await chrome.navigate(`${baseUrl}/index.html?responsiveSmoke=mobile`);
	await waitForStudio(chrome);
	const mobile = await chrome.client.evaluate(`(() => {
		const button = [...document.querySelectorAll('.aw-studio-toolbar-actions button')]
			.find((item) => item.textContent.trim() === 'Properties');
		button.click();
		return {
			...(${inspectExpression()}),
			mobilePanel: document.body.dataset.mobilePanel
		};
	})()`);
	assert.equal(mobile.width, 390);
	assert.equal(mobile.mobilePanel, 'props');
	assert.equal(mobile.rightDisplay, 'flex');
	assert.ok(mobile.toolbarButtons.includes('Timeline'));
	console.log('B"H - responsive browser smoke passed.', { desktop, mobile });
} finally {
	await chrome.stop();
	await server.stop();
}

async function waitForStudio(session) {
	for (let attempt = 0; attempt < 300; attempt += 1) {
		const ready = await session.client.evaluate(`document.body.classList.contains('aw-professional-studio')`);
		if (ready) return;
		await new Promise((resolve) => setTimeout(resolve, 100));
	}
	throw new Error('Professional studio did not install in the browser.');
}

function inspect(session) {
	return session.client.evaluate(`(${inspectExpression()})`);
}

function inspectExpression() {
	return `({
		width: innerWidth,
		height: innerHeight,
		leftDisplay: getComputedStyle(document.querySelector('#left-sidebar')).display,
		rightDisplay: getComputedStyle(document.querySelector('#right-sidebar')).display,
		assetCards: document.querySelectorAll('.aw-studio-asset').length,
		transformInputs: document.querySelectorAll('[data-transform-property]').length,
		timelineHeight: document.querySelector('#nle-timeline').getBoundingClientRect().height,
		toolbarButtons: [...document.querySelectorAll('.aw-studio-toolbar-actions button')]
			.map((button) => button.textContent.trim())
	})`;
}
