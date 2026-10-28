//B"H
//Boruch Hashem
//Blessed is He
/**
 * @module BrowserRecordingSmoke
 * Awtsmoos gathers every note and lets its memory grow;
 * Awtsmoos.com records the tune and lets the download flow.
 */
import assert from 'node:assert/strict';

const pages = await fetch('http://127.0.0.1:9344/json/list').then((response) => response.json());
const page = pages.find((entry) => entry.url?.includes('127.0.0.1:8976/index.html'));
assert.ok(page, 'Piano browser page must be open');
const socket = new WebSocket(page.webSocketDebuggerUrl);
const pending = new Map();
let serial = 0;

/** @param {string} expression - Browser side test of real MediaRecorder interaction. */
function evaluate(expression) {
	return new Promise((resolve, reject) => {
		const id = ++serial;
		const timeout = setTimeout(() => {
			pending.delete(id);
			reject(new Error('Browser evaluation timed out'));
		}, 15000);
		pending.set(id, (message) => {
			clearTimeout(timeout);
			if (message.result?.exceptionDetails || message.error) {
				reject(new Error(JSON.stringify(message)));
		} else {
				resolve(message.result.result.value);
			}
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

const report = await evaluate(`(async () => {
	const { recordingState } = await import('./modules/recording/state.js');
	const button = document.querySelector('#record-audio-button');
	const original = URL.createObjectURL;
	window.__pianoSmokeCapture = null;
	URL.createObjectURL = function(blob) {
		window.__pianoSmokeCapture = { size: blob.size, type: blob.type };
		return original.call(URL, blob);
	};
	button.click();
	const started = recordingState.mediaRecorder?.state;
	const press = (type) => document.dispatchEvent(new KeyboardEvent(type, {
		code: 'KeyA', key: 'a', bubbles: true
	}));
	press('keydown');
	await new Promise((resolve) => setTimeout(resolve, 1250));
	press('keyup');
	button.click();
	const stopped = recordingState.mediaRecorder?.state;
	await new Promise((resolve) => setTimeout(resolve, 1300));
	URL.createObjectURL = original;
	return JSON.stringify({
		started,
		stopped,
		button: button.textContent.trim(),
		file: window.__pianoSmokeCapture
	});
})()`);
const result = JSON.parse(report);
console.log('REAL_BROWSER_RECORDING', result);
assert.equal(result.started, 'recording');
assert.equal(result.stopped, 'inactive');
assert.equal(result.button, 'Record Audio');
assert.ok(result.file?.size > 0, 'A real nonempty audio file was prepared');
assert.ok(result.file?.type.startsWith('audio/'));
socket.close();
