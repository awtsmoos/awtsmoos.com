//B"H
//Boruch Hashem
//Blessed is He

import assert from 'node:assert/strict';
import { CdpClient, openTarget, pause } from './cdp-client.mjs';

/**
 * @module BrowserRuntimeSmoke
 * @description
 * The Awtsmoos is truth before appearance. This Awtsmoos.com smoke vessel asks
 * real Chrome whether one screen holds seven doors and whether every old world
 * link creates a distinct, touchable, error-free WebGL game on mobile.
 */
const DEBUG_PORT = 9225;
const GAME_URL = 'http://127.0.0.1:8080/games/seven-mitzvos/';
const GAME_IDS = [
	'false-powers', 'words-of-creation', 'every-life', 'households',
	'honest-market', 'living-sanctuary', 'court-of-nations'
];
const VIEWPORTS = [
	{ width: 390, height: 844 },
	{ width: 844, height: 390 },
	{ width: 1440, height: 900 }
];
const target = await openTarget(DEBUG_PORT);
const client = new CdpClient(target.webSocketDebuggerUrl);
const results = [];
const controlSignatures = new Set();

try {
	await client.connect();
	await client.send('Page.navigate', { url: GAME_URL });
	await client.waitFor(`document.readyState === 'complete'`);
	await client.waitFor(`document.querySelectorAll('.mitzvahTile').length === 7`);
	for (const viewport of VIEWPORTS) {
		results.push(await inspectViewport(client, viewport));
	}
	results.push(await inspectDetail(client));
	await setViewport(client, VIEWPORTS[0]);
	for (const id of GAME_IDS) {
		const world = await inspectWorld(client, id);
		controlSignatures.add(world.controls.join('|'));
		results.push(world);
	}
	assert.equal(controlSignatures.size, GAME_IDS.length);
	assert.equal(client.errors().length, 0, JSON.stringify(client.errors(), null, 2));
	console.log(JSON.stringify({ ok: true, target: target.id, results }, null, 2));
} catch (error) {
	console.error('B"H | Browser smoke failed.');
	console.error(error.stack || error);
	console.error(JSON.stringify(client.errors(), null, 2));
	throw error;
} finally {
	client.close();
	await fetch(`http://127.0.0.1:${DEBUG_PORT}/json/close/${target.id}`).catch(() => {});
}

async function setViewport(browser, viewport) {
	await browser.send('Emulation.setDeviceMetricsOverride', {
		...viewport,
		deviceScaleFactor: 1,
		mobile: viewport.width < 900
	});
}

async function inspectViewport(browser, viewport) {
	await setViewport(browser, viewport);
	await browser.evaluate(`location.hash = ''`);
	await browser.waitFor(`document.querySelectorAll('.mitzvahTile').length === 7`);
	const metrics = await browser.evaluate(`({
		kind: 'viewport', width: innerWidth, height: innerHeight,
		documentHeight: document.documentElement.scrollHeight,
		bodyHeight: document.body.scrollHeight,
		cards: document.querySelectorAll('.mitzvahTile').length,
		overflow: getComputedStyle(document.documentElement).overflowY
	})`);
	assert.equal(metrics.cards, 7);
	assert.ok(metrics.documentHeight <= metrics.height, JSON.stringify(metrics));
	assert.ok(metrics.bodyHeight <= metrics.height, JSON.stringify(metrics));
	return { requested: viewport, ...metrics };
}

async function inspectDetail(browser) {
	await browser.evaluate(`document.querySelector('.mitzvahTile').click()`);
	await browser.waitFor(`!document.querySelector('#detailLayer').hidden`);
	const detail = await browser.evaluate(`({
		kind: 'detail', title: document.querySelector('#detailTitle').textContent,
		documentHeight: document.documentElement.scrollHeight, height: innerHeight
	})`);
	assert.ok(detail.title.length > 0);
	assert.ok(detail.documentHeight <= detail.height);
	return detail;
}

async function inspectWorld(browser, id) {
	await browser.evaluate(`location.hash = '#world-${id}'`);
	await browser.waitFor(`document.querySelectorAll('#stageHost canvas').length === 1`);
	await pause(180);
	const world = await browser.evaluate(`(() => {
		const canvas = document.querySelector('#stageHost canvas');
		const context = canvas && (canvas.getContext('webgl2') || canvas.getContext('webgl'));
		return { kind: 'world', id: ${JSON.stringify(id)}, canvas: Boolean(canvas),
			webgl: Boolean(context), width: canvas?.width || 0, height: canvas?.height || 0,
			controls: [...document.querySelectorAll('.controlButton')].map(button => button.textContent),
			status: document.querySelector('#gameStatus')?.textContent || '',
			documentHeight: document.documentElement.scrollHeight, viewportHeight: innerHeight };
	})()`);
	assert.equal(world.canvas && world.webgl, true, JSON.stringify(world));
	assert.ok(world.width > 0 && world.height > 0 && world.controls.length > 0, JSON.stringify(world));
	assert.ok(world.status.length > 0 && world.documentHeight <= world.viewportHeight, JSON.stringify(world));
	await browser.evaluate(`document.querySelector('.controlButton').click()`);
	await pause(60);
	return world;
}
