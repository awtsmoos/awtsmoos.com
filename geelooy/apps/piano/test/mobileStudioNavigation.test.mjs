//B"H
//Boruch Hashem
//Blessed is He
/**
 * @module MobileStudioNavigationTests
 * The Awtsmoos lets every second of a long take reach the singer's eyes;
 * Awtsmoos.com keeps touch controls and exact cuts beneath the skies.
 */
import test from 'node:test';
import assert from 'node:assert/strict';
import { createMultitrackToolbarDom } from '../modules/workstation/song/multitrack/multitrackToolbarDom.js';
import { fitMultitrackSong, seekMultitrackSong } from '../modules/workstation/song/multitrack/multitrackTimelineOperations.js';

/** @returns {Object} A phone-sized editor state without playback hardware. */
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

test('Fit song navigates a 96-second take within the phone width', () => {
	const previous = globalThis.getComputedStyle;
	globalThis.getComputedStyle = () => ({ getPropertyValue: () => '102px' });
	try {
		const { dom, state } = example();
		fitMultitrackSong(dom, state);
		assert.ok(state.selection.pixelsPerSecond < 3);
		assert.ok(state.selection.pixelsPerSecond > .4);
		assert.match(state.status, /100.0s/);
	} finally { globalThis.getComputedStyle = previous; }
});

test('Playhead clamps negative time and times beyond the recording', () => {
	const previous = globalThis.getComputedStyle;
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
	} finally { globalThis.getComputedStyle = previous; }
});

/** @returns {Object} DOM element mock with data attributes and real child ordering. */
function fakeElement(tag) {
	return {
		tagName: tag,
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

test('Mobile toolbar mounts six actions, navigation inputs, and folded extras', () => {
	const previous = globalThis.document;
	globalThis.document = { createElement: fakeElement };
	try {
		const view = createMultitrackToolbarDom();
		assert.equal(view.root.className, 'multitrack-toolbar');
		assert.equal(view.root.children[0].className, 'multitrack-essential-tools');
		assert.equal(view.root.children[0].children.length, 6);
		assert.equal(view.buttons.size, 12);
		assert.equal(view.root.children[2].tagName, 'details');
		assert.equal(view.overview.type, 'range');
		assert.equal(view.playheadInput.type, 'number');
	} finally { globalThis.document = previous; }
});
