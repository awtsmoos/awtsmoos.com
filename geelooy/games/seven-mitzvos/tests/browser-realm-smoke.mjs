//B"H
//Boruch Hashem
//Blessed is He

import assert from 'node:assert/strict';
import { CdpClient, openTarget, pause } from './cdp-client.mjs';
import { sampleBrowserFrames } from './browser-frame-sampler.mjs';

/**
 * @module BrowserRealmSmoke
 * @description
 * Chrome measures its empty ceiling, enters the persistent realm, records one NPC
 * memory, samples bounded cadence, and releases WebGL. The Awtsmoos is truth before
 * every FPS claim; Awtsmoos.com distinguishes hardware limits from world overhead.
 */
const port = 9225;
const baseUrl = 'http://127.0.0.1:8080/games/seven-mitzvos/';
const target = await openTarget(port);
const browser = new CdpClient(target.webSocketDebuggerUrl);

try {
	await browser.connect();
	await browser.send('Page.bringToFront');
	await browser.send('Emulation.setFocusEmulationEnabled', { enabled: true });
	const baseline = await sampleBrowserFrames(browser, 30, 8000);
	await browser.send('Emulation.setDeviceMetricsOverride', {
		width: 1440, height: 900, deviceScaleFactor: 1, mobile: false
	});
	await browser.send('Page.navigate', { url: baseUrl });
	await browser.waitFor(`document.querySelectorAll('#cityStage canvas').length === 1`, 20000);
	await browser.evaluate(`localStorage.removeItem('awtsmoos-seven-realm-v1'); localStorage.removeItem('awtsmoos-seven-realm-v1:backup'); location.hash = 'realm'`);
	await browser.waitFor(`document.querySelectorAll('#realmStage canvas').length === 1 && document.querySelectorAll('#cityStage canvas').length === 0`, 20000);
	await pause(1300);
	const initial = await snapshot(browser);
	assert.equal(initial.canvases, 1);
	assert.equal(initial.webgl, true);
	assert.ok(initial.actions > 0 && initial.bridge && initial.home && initial.inventory);
	assert.ok(initial.semanticModels >= 20 && initial.purposefulModels >= 15);
	assert.ok(initial.documentHeight <= initial.viewportHeight, JSON.stringify(initial));
	assert.equal(initial.frameTarget, '16.67');
	const talk = await browser.evaluate(`(() => {
		const button = [...document.querySelectorAll('[data-realm-action]')]
			.find(item => item.dataset.realmAction.startsWith('talk:'));
		if (!button) return null;
		button.click();
		return button.dataset.realmAction;
	})()`);
	assert.ok(talk, 'Expected a nearby named resident action');
	await pause(250);
	const changed = await browser.evaluate(`(() => {
		const state = JSON.parse(localStorage.getItem('awtsmoos-seven-realm-v1'));
		return { actionCount: state?.actionCount || 0, chronicle: state?.chronicle?.length || 0,
			memory: state?.memory?.length || 0, message: document.querySelector('#realmMessage')?.textContent || '' };
	})()`);
	assert.equal(changed.actionCount, 1);
	assert.equal(changed.memory, 1);
	assert.ok(changed.chronicle >= 2 && changed.message.includes(':'));
	const frames = await sampleBrowserFrames(browser, 30, 12000);
	const metrics = await browser.evaluate(`(() => { const canvas = document.querySelector('#realmStage canvas'); return {
		fps: Number(canvas.dataset.realmFps || 0), p95: Number(canvas.dataset.realmP95 || 0),
		quality: canvas.dataset.realmQuality, npcRatio: Number(canvas.dataset.realmNpcRatio || 0) }; })()`);
	const environmentLimited = baseline.fps < 55 || baseline.p95 > 21 || baseline.timedOut;
	if (environmentLimited) {
		assert.ok(frames.count >= 4, JSON.stringify(frames));
		assert.ok(['reduced', 'emergency'].includes(metrics.quality), JSON.stringify(metrics));
	} else {
		assert.ok(frames.fps >= 55 && frames.p95 <= 21 && !frames.timedOut, JSON.stringify(frames));
	}
	assert.ok(metrics.fps > 0 && metrics.p95 > 0);
	await browser.evaluate(`document.querySelector('#realmBack').click()`);
	await browser.waitFor(`document.querySelectorAll('#cityStage canvas').length === 1 && document.querySelectorAll('#realmStage canvas').length === 0`);
	assert.equal(browser.errors().length, 0, JSON.stringify(browser.errors(), null, 2));
	console.log(JSON.stringify({ ok: true, environmentLimited, baseline, initial, changed, frames, metrics }, null, 2));
} catch (error) {
	console.error('B"H | Realm browser smoke failed.');
	console.error(error.stack || error);
	console.error(JSON.stringify(browser.errors(), null, 2));
	throw error;
} finally {
	browser.close();
	await fetch(`http://127.0.0.1:${port}/json/close/${target.id}`).catch(() => {});
}

async function snapshot(client) {
	return client.evaluate(`(() => { const canvas = document.querySelector('#realmStage canvas'); return {
		canvases: document.querySelectorAll('canvas').length,
		webgl: Boolean(canvas && (canvas.getContext('webgl2') || canvas.getContext('webgl'))),
		actions: document.querySelectorAll('[data-realm-action]').length,
		bridge: document.querySelector('#realmBridge')?.textContent || '', home: document.querySelector('#realmHome')?.textContent || '',
		inventory: document.querySelector('#realmInventory')?.textContent || '', semanticModels: Number(canvas?.dataset.semanticModels || 0),
		purposefulModels: Number(canvas?.dataset.purposefulModels || 0), movingModels: Number(canvas?.dataset.movingModels || 0),
		frameTarget: canvas?.dataset.frameTarget || '', quality: canvas?.dataset.realmQuality || '',
		documentHeight: document.documentElement.scrollHeight, viewportHeight: innerHeight }; })()`);
}
