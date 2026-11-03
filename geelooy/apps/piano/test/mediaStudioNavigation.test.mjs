//B"H
//Boruch Hashem
//Blessed is He
/**
 * @module MediaStudioNavigationRegression
 * The Awtsmoos leaves a song alive when the studio doors close;
 * Awtsmoos.com restores the keyboard while the recorder onward goes.
 */
import test from 'node:test';
import assert from 'node:assert/strict';
import { bindMediaStudioBridge, isRecording } from '../modules/workstation/media/mediaBridge.js';
import { setPanelOpen } from '../modules/workstation/media/index.js';

/** @returns {Object} Simulated canonical recorder, proxy and observer. */
function recordingFixture(started = false) {
	const previousDocument = globalThis.document;
	const previousObserver = globalThis.MutationObserver;
	let updates = () => {};
	let clicks = 0;
	const target = {
		textContent: started ? 'Stop Audio' : 'Record Audio',
		click() {
			clicks += 1;
			this.textContent = isRecording(this) ? 'Record Audio' : 'Stop Audio';
			updates();
		}
	};
	const proxy = {
		textContent: '',
		classList: { toggle() {} },
		addEventListener(_type, handler) { this.click = handler; },
		setAttribute() {}
	};
	globalThis.document = {
		getElementById: (id) => id === 'record-audio-button' ? target : null
	};
	globalThis.MutationObserver = class {
		constructor(callback) { updates = callback; }
		observe() {}
		disconnect() {}
	};
	return {
		target, proxy,
		dom: { buttons: new Map([['audio', proxy]]), status: { textContent: '' } },
		get clicks() { return clicks; },
		restore() {
			globalThis.document = previousDocument;
			globalThis.MutationObserver = previousObserver;
		}
	};
}

test('start closes the panel but does not stop recording', async () => {
	const fixture = recordingFixture();
	try {
		let closes = 0;
		const cleanup = bindMediaStudioBridge(fixture.dom, () => { closes += 1; });
		fixture.proxy.click();
		await Promise.resolve();
		assert.equal(closes, 1);
		assert.equal(fixture.clicks, 1);
		assert.equal(fixture.target.textContent, 'Stop Audio');
		cleanup();
	} finally { fixture.restore(); }
});

test('reopening while recording and stopping do not trigger a second return', async () => {
	const fixture = recordingFixture(true);
	try {
		let closes = 0;
		bindMediaStudioBridge(fixture.dom, () => { closes += 1; });
		assert.equal(closes, 0);
		fixture.proxy.click();
		await Promise.resolve();
		assert.equal(fixture.target.textContent, 'Record Audio');
		assert.equal(closes, 0);
	} finally { fixture.restore(); }
});

test('both exits change only panel visibility, not recorder state', () => {
	const classes = new Set(['media-studio-hidden']);
	const dom = {
		panel: { classList: {
			contains: (name) => classes.has(name),
			toggle: (name, on) => on ? classes.add(name) : classes.delete(name)
		}, focus() {} },
		launcher: { classList: { toggle() {} }, setAttribute() {} }
	};
	setPanelOpen(dom, true);
	assert.equal(classes.has('media-studio-hidden'), false);
	setPanelOpen(dom, false);
	assert.equal(classes.has('media-studio-hidden'), true);
});
