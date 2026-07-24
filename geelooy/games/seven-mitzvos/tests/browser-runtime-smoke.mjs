//B"H
//Boruch Hashem
//Blessed is He

import assert from 'node:assert/strict';
import { CdpClient, openTarget, pause } from './cdp-client.mjs';
import { inspectMaterialRuntime } from './browser-material-inspection.mjs';
import { inspectModelPurpose } from './browser-model-inspection.mjs';

/**
 * @module BrowserRuntimeSmoke
 * @description
 * Real Chrome must witness one inspectable, textured city and seven disposable
 * living worlds. The Awtsmoos is truth before appearance; Awtsmoos.com waits for
 * mounted interaction and settled responsive detail rather than timing guesses.
 */
const port = 9225;
const url = 'http://127.0.0.1:8080/games/seven-mitzvos/';
const ids = ['false-powers', 'words-of-creation', 'every-life', 'households', 'honest-market', 'living-sanctuary', 'court-of-nations'];
const viewports = [{ width: 390, height: 844 }, { width: 844, height: 390 }, { width: 1440, height: 900 }];
const target = await openTarget(port);
const browser = new CdpClient(target.webSocketDebuggerUrl);
const results = [];
const signatures = new Set();

try {
	await browser.connect();
	await browser.send('Emulation.setEmulatedMedia', { features: [{ name: 'prefers-reduced-motion', value: 'no-preference' }] });
	await browser.send('Page.navigate', { url });
	await browser.waitFor(`document.querySelectorAll('.mitzvahTile').length === 7 && document.querySelectorAll('#cityStage canvas').length === 1`, 30000);
	for (const viewport of viewports) results.push(await inspectHub(browser, viewport));
	await setViewport(browser, viewports[0]);
	await browser.evaluate(`location.hash = ''`);
	await browser.waitFor(`document.querySelectorAll('#cityStage canvas').length === 1`);
	results.push(await inspectMaterialRuntime(browser));
	results.push(await inspectModelPurpose(browser));
	results.push(await inspectDetail(browser));
	for (const id of ids) {
		const world = await inspectWorld(browser, id);
		signatures.add(world.controls.join('|'));
		results.push(world);
	}
	assert.equal(signatures.size, ids.length);
	assert.equal(browser.errors().length, 0, JSON.stringify(browser.errors(), null, 2));
	console.log(JSON.stringify({ ok: true, target: target.id, results }, null, 2));
} catch (error) {
	console.error('B"H | Browser smoke failed.');
	console.error(error.stack || error);
	console.error(JSON.stringify(browser.errors(), null, 2));
	throw error;
} finally {
	browser.close();
	await fetch(`http://127.0.0.1:${port}/json/close/${target.id}`).catch(() => {});
}

async function setViewport(client, viewport) {
	await client.send('Emulation.setDeviceMetricsOverride', { ...viewport, deviceScaleFactor: 1, mobile: viewport.width < 900 });
}

async function inspectHub(client, viewport) {
	await setViewport(client, viewport);
	await client.evaluate(`location.hash = ''`);
	const expectedDetailMode = viewport.width < 700 ? 'mobile-light' : 'adaptive';
	await client.waitFor(`document.querySelectorAll('.mitzvahTile').length === 7 && document.querySelectorAll('#cityStage canvas').length === 1`);
	await client.waitFor(`document.querySelector('#cityStage canvas')?.dataset.detailMode === '${expectedDetailMode}'`);
	const result = await client.evaluate(`(() => {
		const canvas = document.querySelector('#cityStage canvas');
		return { kind: 'hub', width: innerWidth, height: innerHeight,
			documentHeight: document.documentElement.scrollHeight, bodyHeight: document.body.scrollHeight,
			cards: document.querySelectorAll('.mitzvahTile').length, canvases: document.querySelectorAll('canvas').length,
			webgl: Boolean(canvas && (canvas.getContext('webgl2') || canvas.getContext('webgl'))),
			semanticModels: Number(canvas?.dataset.semanticModels || 0), purposefulModels: Number(canvas?.dataset.purposefulModels || 0), movingModels: Number(canvas?.dataset.movingModels || 0),
			detailMode: canvas?.dataset.detailMode || '', guide: document.querySelector('#guideMessage')?.textContent || '',
			mission: document.querySelector('#dailyMission')?.textContent || '', modeOptions: document.querySelector('#difficultyMode')?.options.length || 0,
			cityLight: document.querySelector('#cityLight')?.textContent || '', overflow: getComputedStyle(document.documentElement).overflowY };
	})()`);
	assert.equal(result.cards, 7);
	assert.equal(result.canvases, 1);
	assert.equal(result.webgl, true);
	assert.equal(result.modeOptions, 3);
	assert.equal(result.detailMode, expectedDetailMode);
	assert.ok(result.semanticModels >= 12 && result.purposefulModels >= 6 && result.movingModels >= 1, JSON.stringify(result));
	assert.ok(result.guide && result.mission && result.cityLight);
	assert.ok(result.documentHeight <= result.height && result.bodyHeight <= result.height, JSON.stringify(result));
	return { requested: viewport, ...result };
}

async function inspectDetail(client) {
	await client.evaluate(`document.querySelector('.mitzvahTile').click()`);
	await client.waitFor(`!document.querySelector('#detailLayer').hidden`);
	const result = await client.evaluate(`({ kind: 'detail', title: document.querySelector('#detailTitle').textContent,
		canvases: document.querySelectorAll('canvas').length, documentHeight: document.documentElement.scrollHeight, height: innerHeight })`);
	assert.ok(result.title.length > 0);
	assert.equal(result.canvases, 0);
	assert.ok(result.documentHeight <= result.height);
	return result;
}

async function inspectWorld(client, id) {
	await client.evaluate(`location.hash = '#world-${id}'`);
	await client.waitFor(`document.querySelectorAll('#stageHost canvas').length === 1`);
	await pause(220);
	const result = await client.evaluate(`(() => { const canvas = document.querySelector('#stageHost canvas'); return {
		kind: 'world', id: ${JSON.stringify(id)}, canvases: document.querySelectorAll('canvas').length,
		webgl: Boolean(canvas && (canvas.getContext('webgl2') || canvas.getContext('webgl'))), width: canvas?.width || 0, height: canvas?.height || 0,
		semanticModels: Number(canvas?.dataset.semanticModels || 0), purposefulModels: Number(canvas?.dataset.purposefulModels || 0), movingModels: Number(canvas?.dataset.movingModels || 0), detailMode: canvas?.dataset.detailMode || '',
		controls: [...document.querySelectorAll('.controlButton')].map(button => button.textContent), status: document.querySelector('#gameStatus')?.textContent || '',
		documentHeight: document.documentElement.scrollHeight, viewportHeight: innerHeight }; })()`);
	assert.equal(result.canvases, 1);
	assert.equal(result.webgl, true, JSON.stringify(result));
	assert.equal(result.detailMode, 'mobile-light');
	assert.ok(result.semanticModels >= 8 && result.purposefulModels >= 6 && result.movingModels >= 1, JSON.stringify(result));
	assert.ok(result.width > 0 && result.height > 0 && result.controls.length > 0 && result.status);
	assert.ok(result.documentHeight <= result.viewportHeight, JSON.stringify(result));
	await client.evaluate(`document.querySelector('.controlButton').click()`);
	await pause(60);
	return result;
}
