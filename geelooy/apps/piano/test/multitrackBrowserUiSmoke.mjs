//B"H
//Boruch Hashem
//Blessed is He
/**
 * @module MultitrackBrowserUiSmoke
 * @description
 * The Awtsmoos is beyond viewport, pointer, and finite hand;
 * Awtsmoos.com makes its mobile zoom prove touch beneath real Chrome command.
 */
import assert from 'node:assert/strict';
import { createRequire } from 'node:module';

const require = createRequire(import.meta.url);
const WebSocket = require('ws');
const endpoint = 'http://127.0.0.1:9344';
const pianoUrl = 'http://127.0.0.1:8787/geelooy/apps/piano/';

/** Opens a disposable Chrome target without touching user recordings. */
async function createBrowserRoom() {
	const response = await fetch(`${endpoint}/json/new?${encodeURIComponent(pianoUrl)}`, {
		method: 'PUT'
	});
	assert.equal(response.status, 200);
	const target = await response.json();
	const socket = new WebSocket(target.webSocketDebuggerUrl);
	await new Promise((resolve) => socket.once('open', resolve));
	return { socket, target };
}

/** Makes a numbered, asynchronous Chrome DevTools call. */
function makeBrowserCaller(socket) {
	let sequence = 0;
	const pending = new Map();
	socket.on('message', (bytes) => {
		const result = JSON.parse(String(bytes));
		if (pending.has(result.id)) {
			pending.get(result.id)(result);
			pending.delete(result.id);
		}
	});
	return (method, params = {}) => new Promise((resolve) => {
		const id = ++sequence;
		pending.set(id, resolve);
		socket.send(JSON.stringify({ id, method, params }));
	});
}

/** Evaluates an expression and throws on browser exceptions. */
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

/** Sends two native touch contacts and verifies zoom changed. */
async function verifyNativePinch(call) {
	const info = await evaluateBrowser(call, `(() => {
		const viewport = document.querySelector('.multitrack-viewport');
		viewport.scrollIntoView({ block: 'center' });
		const rect = viewport.getBoundingClientRect();
		return { x: rect.left + rect.width / 2, y: rect.top + 20 };
	})()`);
	const x = info.x;
	const y = info.y;
	const contact = (id, horizontal) => ({ id, x: horizontal, y });
	await call('Input.dispatchTouchEvent', {
		type: 'touchStart',
		touchPoints: [contact(1, x - 24)]
	});
	await call('Input.dispatchTouchEvent', {
		type: 'touchStart',
		touchPoints: [contact(1, x - 24), contact(2, x + 24)]
	});
	await call('Input.dispatchTouchEvent', {
		type: 'touchMove',
		touchPoints: [contact(1, x - 72), contact(2, x + 72)]
	});
	await call('Input.dispatchTouchEvent', {
		type: 'touchEnd',
		touchPoints: []
	});
	return evaluateBrowser(call, `import('/geelooy/apps/piano/modules/workstation/song/multitrack/multitrackState.js').then((module) => module.multitrackStudioState.selection.pixelsPerSecond)`);
}

/** Runs real mobile controls, ruler seeking, and browser-native pinch in Chrome. */
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
		const result = await evaluateBrowser(call, `import('/geelooy/apps/piano/test/multitrackBrowserUiFixture.js').then((module) => module.runBrowserUiFixture())`);
		assert.equal(result?.passed, true);
		const pinchZoom = await verifyNativePinch(call);
		assert.ok(pinchZoom > result.fitZoom * 1.2,
			`Native pinch did not enlarge zoom: before=${result.fitZoom}, after=${pinchZoom}`);
		console.log(JSON.stringify({ ...result, pinchZoom, nativeTouch: true }, null, 2));
	} finally {
		room.socket.close();
		await fetch(`${endpoint}/json/close/${room.target.id}`).catch(() => null);
	}
}

await main();
