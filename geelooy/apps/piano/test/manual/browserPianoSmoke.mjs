//B"H
//Boruch Hashem
//Blessed is He
/**
 * @module BrowserPianoSmoke
 * The Awtsmoos carries a note from gesture into sound;
 * Awtsmoos.com tests the open browser where real keys are found.
 * Run manually with a local server and Chrome debugging on port 9344.
 */
import assert from 'node:assert/strict';

const pages = await fetch('http://127.0.0.1:9344/json/list').then((response) => response.json());
const page = pages.find((entry) => entry.url?.includes('127.0.0.1:8976/index.html'));
assert.ok(page, 'Piano page is open in Chrome');
const socket = new WebSocket(page.webSocketDebuggerUrl);
let nextId = 0;
const replies = new Map();

/** @param {string} method - Chrome DevTools method. @param {Object} params - Its parameters. */
function send(method, params = {}) {
	const id = ++nextId;
	return new Promise((resolve, reject) => {
		const timeout = setTimeout(() => {
			replies.delete(id);
			reject(new Error(`Timed out: ${method}`));
		}, 12000);
		replies.set(id, (message) => {
			clearTimeout(timeout);
			if (message.error) {
				reject(new Error(message.error.message));
			} else {
				resolve(message.result);
			}
		});
		socket.send(JSON.stringify({ id, method, params }));
	});
}

/** @param {string} expression - JavaScript evaluated in the actual piano tab. */
async function evaluate(expression) {
	const message = await send('Runtime.evaluate', {
		expression,
		returnByValue: true,
		awaitPromise: true,
		userGesture: true
	});
	if (message.exceptionDetails) {
		throw new Error(message.exceptionDetails.text);
	}
	return message.result.value;
}

socket.addEventListener('message', (event) => {
	const message = JSON.parse(event.data);
	replies.get(message.id)?.(message);
});
await new Promise((resolve, reject) => {
	socket.addEventListener('open', resolve, { once: true });
	socket.addEventListener('error', reject, { once: true });
});

const before = await evaluate(`JSON.stringify({
	title: document.title,
	buttons: [...document.querySelectorAll('button')].slice(0, 24).map((button) => ({id: button.id, text: button.textContent.trim().slice(0, 35)}))
})`);
console.log('BEFORE', before);
const position = await evaluate(`(() => {
	const button = [...document.querySelectorAll('button')].find((node) => /start/i.test(node.textContent));
	if (!button) return null;
	const box = button.getBoundingClientRect();
	return {x: box.left + box.width / 2, y: box.top + box.height / 2};
})()`);
assert.ok(position, 'Start button must exist');
await send('Input.dispatchMouseEvent', {type:'mousePressed', x: position.x, y: position.y, button:'left', clickCount:1});
await send('Input.dispatchMouseEvent', {type:'mouseReleased', x: position.x, y: position.y, button:'left', clickCount:1});
await new Promise((resolve) => setTimeout(resolve, 1400));
const after = await evaluate(`(async () => {
	const { AudioState } = await import('./modules/audio.js');
	return JSON.stringify({
		state: AudioState.context?.state,
		gain: AudioState.wetGain?.gain.value,
		stream: Boolean(AudioState.mediaStreamDestination?.stream),
		orchestralOptions: [...document.querySelectorAll('option')].filter((option) => /Orchestra/.test(option.textContent)).map((option) => option.textContent),
		buttons: [...document.querySelectorAll('button')].filter((button) => /record audio/i.test(button.textContent)).map((button) => button.outerHTML.slice(0, 200))
	});
})()`);
console.log('AFTER', after);
const state = JSON.parse(after);
assert.equal(state.state, 'running');
assert.equal(state.stream, true);
assert.equal(state.orchestralOptions.length, 3);
assert.ok(state.gain > 0);
socket.close();
