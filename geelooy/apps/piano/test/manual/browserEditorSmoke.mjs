//B"H
//Boruch Hashem
//Blessed is He
/**
 * @module BrowserMultitrackEditorSmoke
 * The Awtsmoos moves the sounding track through every changing hand;
 * Awtsmoos.com proves each edit on the living music stand.
 */
import assert from 'node:assert/strict';

const pages = await fetch('http://127.0.0.1:9344/json/list').then((response) => response.json());
const page = pages.find((entry) => entry.url?.includes('127.0.0.1:8976/index.html'));
assert.ok(page, 'A local piano browser tab must be open');
const socket = new WebSocket(page.webSocketDebuggerUrl);
let nextId = 0;
const pending = new Map();

/** @param {string} expression - Complete JavaScript evaluated in the live piano. */
function evaluate(expression) {
	return new Promise((resolve, reject) => {
		const id = ++nextId;
		const timeout = setTimeout(() => {
			pending.delete(id);
			reject(new Error('Editor browser test timed out'));
		}, 12000);
		pending.set(id, (message) => {
			clearTimeout(timeout);
			pending.delete(id);
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

try {
	const serialized = await evaluate(`(async () => {
		const base = './modules/workstation/song/multitrack/';
		const [dom, project, stateModule, events, store] = await Promise.all([
			import(base + 'multitrackTrackDom.js?smoke=20261028-v2'),
			import(base + 'multitrackProject.js'),
			import(base + 'multitrackState.js'),
			import(base + 'multitrackTrackEvents.js?smoke=20261028-v2'),
			import(base + 'multitrackAudioStore.js')
		]);
		const buffer = new AudioBuffer({ length: 4000, sampleRate: 4000, numberOfChannels: 1 });
		buffer.getChannelData(0)[0] = 0.25;
		store.multitrackAudioStore.buffers.set('browser-editor-sample', buffer);
		const clip = project.createMultitrackClip({ bufferId: 'browser-editor-sample', duration: 1 });
		const track = project.createMultitrackTrack({ name: 'Browser Test', clips: [clip] });
		const state = new stateModule.MultitrackStudioDaas();
		state.setProject({ ...state.project, tracks: [track] });
		const holder = document.createElement('div');
		holder.append(dom.createMultitrackTrackDom(track, state.selection, 400).root);
		const errors = [];
		events.bindMultitrackTrackEvents({ tracks: holder }, state, (error) => errors.push(error.message));
		const select = holder.querySelector('[data-track-control="instrument-color"]');
		if (!select) return JSON.stringify({ error: 'Missing color control', html: holder.innerHTML.slice(0, 800) });
		const options = [...select.options].map((option) => option.value);
		select.value = 'reed';
		select.dispatchEvent(new Event('change', { bubbles: true }));
		const color = state.project.tracks[0].instrumentColor;
		holder.querySelector('[data-track-control="duplicate-track"]').click();
		const ids = state.project.tracks.map((entry) => entry.id);
		holder.querySelector('[data-track-control="normalize-track"]').click();
		return JSON.stringify({ options, color, tracks: ids.length, unique: new Set(ids).size,
			gain: state.project.tracks[0].gain, errors });
	})()`);
	const result = JSON.parse(serialized);
	console.log('REAL_BROWSER_EDITOR', result);
	assert.equal(result.error, undefined);
	assert.equal(result.color, 'reed');
	assert.equal(result.tracks, 2);
	assert.equal(result.unique, 2);
	assert.equal(result.gain, 2);
	assert.deepEqual(result.errors, []);
	assert.equal(result.options.length, 5);
} finally {
	socket.close();
}
