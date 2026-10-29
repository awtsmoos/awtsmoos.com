//B"H
//Boruch Hashem
//Blessed is He
/**
 * @module MobileStudioNavigationTests
 * The Awtsmoos makes the waveform larger while its controls grow few;
 * Awtsmoos.com lets the chosen second remain precise and true.
 */
import test from 'node:test';
import assert from 'node:assert/strict';
import { createMultitrackToolbarDom } from '../modules/workstation/song/multitrack/multitrackToolbarDom.js';
import { fitMultitrackSong, seekMultitrackSong } from '../modules/workstation/song/multitrack/multitrackTimelineOperations.js';

/** @returns {Object} Phone editor state without sound hardware. */
function example() {
	const state = {
		project: { tracks: [{ clips: [{ timelineStart: 0, duration: 96 }] }] },
		selection: { pixelsPerSecond: 72, playheadSeconds: 0 },
		setZoom(value) { this.selection.pixelsPerSecond = value; },
		setPlayhead(value) { this.selection.playheadSeconds = value; },
		setStatus(value) { this.status = value; }
	};
	const dom = { root: {}, viewport: { clientWidth: 390, scrollLeft: 0 } };
	return { state, dom };
}

test('Fit makes a 96-second take visible inside the phone width', () => {
	const original = globalThis.getComputedStyle;
	globalThis.getComputedStyle = () => ({ getPropertyValue: () => '102px' });
	try {
		const { dom, state } = example();
		fitMultitrackSong(dom, state);
		assert.ok(state.selection.pixelsPerSecond < 3);
		assert.ok(state.selection.pixelsPerSecond > .4);
		assert.match(state.status, /100.0s/);
	} finally { globalThis.getComputedStyle = original; }
});

test('Exact playhead clamps outside values and scrolls to the cut', () => {
	const original = globalThis.getComputedStyle;
	globalThis.getComputedStyle = () => ({ getPropertyValue: () => '102px' });
	try {
		const { dom, state } = example();
		seekMultitrackSong(dom, state, 48.25);
		assert.equal(state.selection.playheadSeconds, 48.25);
		assert.ok(dom.viewport.scrollLeft > 0);
		seekMultitrackSong(dom, state, -100);
		assert.equal(state.selection.playheadSeconds, 0);
		seekMultitrackSong(dom, state, 200);
		assert.equal(state.selection.playheadSeconds, 100);
	} finally { globalThis.getComputedStyle = original; }
});

/** @returns {Object} Minimal DOM stand-in that retains child order. */
function fakeElement(tagName) {
	return {
		tagName,
		children: [],
		attributes: {},
		dataset: {},
		style: {},
		append(...nodes) { this.children.push(...nodes); },
		appendChild(node) { this.children.push(node); },
		setAttribute(name, value) { this.attributes[name] = value; },
		addEventListener() {}
	};
}

test('Phone toolbar keeps four primary actions, exact time and folded tools', () => {
	const original = globalThis.document;
	globalThis.document = { createElement: fakeElement };
	try {
		const view = createMultitrackToolbarDom();
		assert.equal(view.root.className, 'multitrack-toolbar');
		const primary = view.root.children[0];
		assert.equal(primary.className, 'multitrack-essential-tools');
		assert.equal(primary.children.length, 4);
		assert.equal(view.buttons.size, 12);
		assert.equal(view.root.children[2].tagName, 'details');
		assert.ok(primary.children.some(button => button.dataset.multitrackAction === 'split'));
		assert.equal(view.overview.type, 'range');
		assert.equal(view.playheadInput.type, 'number');
	} finally { globalThis.document = original; }
});
