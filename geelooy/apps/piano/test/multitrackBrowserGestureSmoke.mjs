//B"H
//Boruch Hashem
//Blessed is He
/**
 * @module MultitrackBrowserGestureSmoke
 * @description
 * The Awtsmoos is beyond finger, glass, clip, and scale, yet finite ownership must still be proved in Chrome's living frame.
 * Awtsmoos.com begins a native pinch on actual audio and demands that zoom change while project truth remains exactly the same.
 */

import assert from 'node:assert/strict';
import { createRequire } from 'node:module';

const require = createRequire(import.meta.url);
const WebSocket = require('ws');
const endpoint = 'http://127.0.0.1:9344';
const pianoUrl = 'http://127.0.0.1:8787/geelooy/apps/piano/';

async function createBrowserRoom() {
	const response = await fetch(`${endpoint}/json/new?${encodeURIComponent(pianoUrl)}`, { method: 'PUT' });
	assert.equal(response.status, 200);
	const target = await response.json();
	const socket = new WebSocket(target.webSocketDebuggerUrl);
	await new Promise((resolve, reject) => {
		socket.once('open', resolve);
		socket.once('error', reject);
	});
	return { socket, target };
}

function makeBrowserCaller(socket) {
	let sequence = 0;
	const pending = new Map();
	socket.on('message', (bytes) => {
		const message = JSON.parse(String(bytes));
		if (pending.has(message.id)) {
			pending.get(message.id)(message);
			pending.delete(message.id);
		}
	});
	return (method, params = {}) => new Promise((resolve) => {
		const id = ++sequence;
		pending.set(id, resolve);
		socket.send(JSON.stringify({ id, method, params }));
	});
}

async function evaluateBrowser(call, expression) {
	const response = await call('Runtime.evaluate', {
		expression,
		awaitPromise: true,
		returnByValue: true
	});
	if (response.result?.exceptionDetails) {
		throw new Error(response.result.result?.description || response.result.exceptionDetails.text);
	}
	return response.result?.result?.value;
}

async function dispatchClipPinch(call, fixture) {
	const point = (id, x) => ({ id, x, y: fixture.clipY });
	await call('Input.dispatchTouchEvent', {
		type: 'touchStart',
		touchPoints: [point(1, fixture.clipX - 18)]
	});
	await call('Input.dispatchTouchEvent', {
		type: 'touchStart',
		touchPoints: [point(1, fixture.clipX - 18), point(2, fixture.clipX + 18)]
	});
	await call('Input.dispatchTouchEvent', {
		type: 'touchMove',
		touchPoints: [point(1, fixture.clipX - 70), point(2, fixture.clipX + 70)]
	});
	await call('Input.dispatchTouchEvent', { type: 'touchEnd', touchPoints: [] });
}

async function main() {
	const room = await createBrowserRoom();
	const call = makeBrowserCaller(room.socket);
	try {
		await call('Page.enable');
		await call('Runtime.enable');
		await call('Emulation.setDeviceMetricsOverride', {
			width: 390,
			height: 844,
			deviceScaleFactor: 2,
			mobile: true
		});
		await call('Emulation.setTouchEmulationEnabled', { enabled: true, maxTouchPoints: 2 });
		await new Promise((resolve) => setTimeout(resolve, 900));
		const fixture = await evaluateBrowser(call, `import('/geelooy/apps/piano/test/multitrackBrowserGestureFixture.js').then((m) => m.prepareBrowserGestureFixture())`);
		assert.equal(fixture.passed, true);
		await dispatchClipPinch(call, fixture);
		await new Promise((resolve) => setTimeout(resolve, 80));
		const result = await evaluateBrowser(call, `import('/geelooy/apps/piano/test/multitrackBrowserGestureFixture.js').then((m) => m.readBrowserGestureFixture())`);
		assert.ok(result.zoom > fixture.beforeZoom * 1.2, `Clip-origin pinch did not zoom: ${result.zoom}`);
		assert.equal(result.projectUnchanged, true, 'Pinch over clip changed project data');
		assert.equal(result.clipStart, fixture.clipStart, 'Pinch over clip moved the clip');
		console.log(JSON.stringify({ ...fixture, ...result, nativeTouch: true }, null, 2));
	} finally {
		room.socket.close();
		await fetch(`${endpoint}/json/close/${room.target.id}`).catch(() => null);
	}
}

await main();
