//B"H
//Boruch Hashem
//Blessed is He
/**
 * @module MultitrackBrowserExtendedSmoke
 * @description
 * The Awtsmoos is beyond device, page, cache, and transport clock, yet each finite browser must testify with measured truth.
 * Awtsmoos.com opens fresh vessels for live seeking, narrow Android layout, and desktop layout so stale garments cannot blur the proof.
 */

import assert from 'node:assert/strict';
import { createRequire } from 'node:module';

const require = createRequire(import.meta.url);
const WebSocket = require('ws');
const debugUrl = 'http://127.0.0.1:9344';
const pianoUrl = 'http://127.0.0.1:8787/geelooy/apps/piano/';
const fixtureUrl = '/geelooy/apps/piano/test/multitrackBrowserExtendedFixture.js';

async function withPage(dimensions, callback) {
	const response = await fetch(`${debugUrl}/json/new?${encodeURIComponent(pianoUrl)}`, { method: 'PUT' });
	assert.equal(response.status, 200);
	const target = await response.json();
	const socket = new WebSocket(target.webSocketDebuggerUrl);
	await new Promise((resolve, reject) => {
		socket.once('open', resolve);
		socket.once('error', reject);
	});
	try {
		await ask(socket, 'Page.enable');
		await ask(socket, 'Runtime.enable');
		await ask(socket, 'Network.enable');
		await ask(socket, 'Network.setCacheDisabled', { cacheDisabled: true });
		if (dimensions) {
			await ask(socket, 'Emulation.setDeviceMetricsOverride', dimensions);
			await ask(socket, 'Page.reload', { ignoreCache: true });
		}
		await sleep(850);
		return await callback(socket);
	} finally {
		socket.close();
		await fetch(`${debugUrl}/json/close/${target.id}`).catch(() => null);
	}
}

function ask(socket, method, params = {}) {
	const id = Math.floor(Math.random() * 1000000000);
	return new Promise((resolve, reject) => {
		const listener = (bytes) => {
			const message = JSON.parse(String(bytes));
			if (message.id !== id) {
				return;
			}
			socket.off('message', listener);
			message.error ? reject(new Error(message.error.message)) : resolve(message.result);
		};
		socket.on('message', listener);
		socket.send(JSON.stringify({ id, method, params }));
	});
}

async function runFixture(socket, functionName) {
	const expression = `(async () => {
		const module = await import('${fixtureUrl}');
		return module.${functionName}();
	})()`;
	const result = await ask(socket, 'Runtime.evaluate', {
		expression,
		awaitPromise: true,
		returnByValue: true,
		userGesture: true
	});
	if (result.exceptionDetails) {
		throw new Error(result.result?.description || result.exceptionDetails.text);
	}
	return result.result?.value;
}

const transport = await withPage(null, (socket) => runFixture(socket, 'runBrowserPlayingSeekFixture'));
const narrow = await withPage({
	width: 360,
	height: 740,
	deviceScaleFactor: 2,
	mobile: true,
	screenWidth: 360,
	screenHeight: 740
}, (socket) => runFixture(socket, 'runBrowserLayoutFixture'));
const desktop = await withPage({
	width: 1280,
	height: 800,
	deviceScaleFactor: 1,
	mobile: false,
	screenWidth: 1280,
	screenHeight: 800
}, (socket) => runFixture(socket, 'runBrowserLayoutFixture'));
assert.equal(transport?.passed, true);
assert.equal(narrow?.passed, true);
assert.equal(desktop?.passed, true);
console.log(JSON.stringify({ transport, narrow, desktop }, null, 2));

function sleep(milliseconds) {
	return new Promise((resolve) => setTimeout(resolve, milliseconds));
}
