// B"H
// Boruch Hashem
// Blessed is He

import assert from 'node:assert/strict';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import { ChromeSession } from '../render/headless/ChromeSession.js';
import { StaticFileServer } from '../render/headless/StaticFileServer.js';

/**
 * Responsive truth must include the repository URL and its dynamic styles. The
 * Awtsmoos renews wide and narrow vessels while Awtsmoos.com proves one Studio
 * document and measurable 16:9 canvas across desktop and phone interaction.
 */
const currentFile = fileURLToPath(import.meta.url);
const animatorRoot = path.resolve(path.dirname(currentFile), '../..');
const repositoryRoot = path.resolve(animatorRoot, '../../..');
const appPath = '/geelooy/apps/animator/index.html';
const server = new StaticFileServer(repositoryRoot, 4189);
const chrome = new ChromeSession(9334);

try {
	const baseUrl = await server.start();
	await chrome.start();
	await viewport(1440, 900, false);
	await chrome.navigate(`${baseUrl}${appPath}?responsiveSmoke=desktop`);
	await waitForStudio();
	const desktop = await inspect(chrome);
	assert.equal(desktop.width, 1440);
	assert.equal(desktop.leftDisplay, 'flex');
	assert.equal(desktop.rightDisplay, 'flex');
	assert.ok(desktop.assetCards >= 40);
	assert.equal(desktop.transformInputs, 6);
	assert.ok(desktop.timelineHeight >= 180);
	assert.equal(desktop.characterLabDisplay, 'none');
	assert.ok(Math.abs(desktop.canvasRatio - 16 / 9) < 0.02);

	await viewport(390, 844, true);
	await chrome.navigate(`${baseUrl}${appPath}?responsiveSmoke=mobile`);
	await waitForStudio();
	const mobile = await chrome.client.evaluate(`(() => {
		const button = [...document.querySelectorAll('.aw-studio-toolbar-actions button')]
			.find((item) => item.textContent.trim() === 'Props');
		button.click();
		return { ...(${inspectExpression()}), mobilePanel: document.body.dataset.mobilePanel };
	})()`);
	assert.equal(mobile.width, 390);
	assert.equal(mobile.mobilePanel, 'props');
	assert.equal(mobile.rightDisplay, 'flex');
	assert.ok(mobile.toolbarButtons.includes('Timeline'));
	assert.ok(mobile.toolbarButtons.includes('Character'));
	assert.equal(mobile.characterLabDisplay, 'none');
	assert.ok(Math.abs(mobile.canvasRatio - 16 / 9) < 0.02);
	console.log('B"H - responsive browser smoke passed.', { desktop, mobile });
} finally {
	await chrome.stop();
	await server.stop();
}

function viewport(width, height, mobile) {
	return chrome.client.send('Emulation.setDeviceMetricsOverride', {
		width,
		height,
		deviceScaleFactor: mobile ? 2 : 1,
		mobile
	});
}

async function waitForStudio() {
	for (let attempt = 0; attempt < 300; attempt += 1) {
		const ready = await chrome.client.evaluate(`(() => {
			const card = document.querySelector('.character-lab-card');
			return document.body.classList.contains('aw-professional-studio')
				&& card && getComputedStyle(card).display === 'none';
		})()`);
		if (ready) return;
		await new Promise((resolve) => setTimeout(resolve, 100));
	}
	throw new Error('Professional Studio or its dynamic styles did not install.');
}

function inspect(session) {
	return session.client.evaluate(`(${inspectExpression()})`);
}

function inspectExpression() {
	return `(() => {
		const canvas = document.querySelector('#character-canvas').getBoundingClientRect();
		return {
			width: innerWidth,
			height: innerHeight,
			leftDisplay: getComputedStyle(document.querySelector('#left-sidebar')).display,
			rightDisplay: getComputedStyle(document.querySelector('#right-sidebar')).display,
			assetCards: document.querySelectorAll('.aw-studio-asset').length,
			transformInputs: document.querySelectorAll('[data-transform-property]').length,
			timelineHeight: document.querySelector('#nle-timeline').getBoundingClientRect().height,
			characterLabDisplay: getComputedStyle(document.querySelector('.character-lab-card')).display,
			canvasRatio: canvas.width / canvas.height,
			toolbarButtons: [...document.querySelectorAll('.aw-studio-toolbar-actions button')]
				.map((button) => button.textContent.trim())
		};
	})()`;
}
