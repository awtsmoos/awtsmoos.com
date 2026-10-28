//B"H
//Boruch Hashem
//Blessed is He
/**
 * @module BrowserWorldInstrumentSmoke
 * The Awtsmoos lends a voice to the strings and reed;
 * Awtsmoos.com verifies every playable choice we need.
 */
import assert from 'node:assert/strict';

const pages = await fetch('http://127.0.0.1:9344/json/list').then((response) => response.json());
const page = pages.find((entry) => entry.url?.includes('127.0.0.1:8976/index.html'));
assert.ok(page, 'The local piano browser page must be open');
const socket = new WebSocket(page.webSocketDebuggerUrl);
const pending = new Map();
let serial = 0;

/**
 * Evaluates a full browser interaction within the real piano tab.
 * @param {string} expression - Real browser JavaScript to run.
 * @returns {Promise<unknown>} JSON-compatible expression result.
 */
function evaluate(expression) {
	return new Promise((resolve, reject) => {
		const id = ++serial;
		const timeout = setTimeout(() => {
			pending.delete(id);
			reject(new Error('Browser world smoke timed out'));
		}, 12000);
		pending.set(id, (message) => {
			clearTimeout(timeout);
			if (message.error || message.result?.exceptionDetails) {
				reject(new Error(JSON.stringify(message.error || message.result.exceptionDetails)));
				return;
			}
			resolve(message.result.result.value);
		});
		socket.send(JSON.stringify({
			id,
			method: 'Runtime.evaluate',
			params: { expression, awaitPromise: true, returnByValue: true, userGesture: true }
		}));
	});
}

socket.addEventListener('message', (event) => {
	const message = JSON.parse(event.data);
	pending.get(message.id)?.(message);
});
await new Promise((resolve, reject) => {
	socket.addEventListener('open', resolve, { once: true });
	socket.addEventListener('error', reject, { once: true });
});

const observed = await evaluate(`(async () => {
	const target = [...document.querySelectorAll('select')].find((select) => {
		return [...select.options].some((option) => option.value === 'world-duduk-reed');
	});
	if (!target) return JSON.stringify({ error: 'No World sound selector' });
	const ids = [...target.options].filter((option) => option.value.startsWith('world-'))
		.map((option) => option.value);
	const { AudioState } = await import('./modules/audio.js');
	const switched = [];
	for (const id of ids) {
		target.value = id;
		target.dispatchEvent(new Event('change', { bubbles: true }));
		document.body.focus();
		document.dispatchEvent(new KeyboardEvent('keydown', { code: 'KeyA', key: 'a', bubbles: true }));
		await new Promise((resolve) => setTimeout(resolve, 120));
		document.dispatchEvent(new KeyboardEvent('keyup', { code: 'KeyA', key: 'a', bubbles: true }));
		switched.push(target.value);
	}
	return JSON.stringify({ ids, switched, audio: AudioState.context?.state,
		recordable: Boolean(AudioState.mediaStreamDestination?.stream) });
})()`);
const result = JSON.parse(observed);
console.log('WORLD_BROWSER_SMOKE', result);
assert.equal(result.error, undefined);
assert.equal(result.ids.length, 4);
assert.deepEqual(result.switched, result.ids);
assert.equal(result.audio, 'running');
assert.equal(result.recordable, true);
socket.close();
