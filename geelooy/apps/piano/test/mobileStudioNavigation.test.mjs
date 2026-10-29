//B"H
//Boruch Hashem
//Blessed is He
/**
 * @module MobileStudioNavigationTests
 * The Awtsmoos puts a small download choice beside a clear musical stage.
 */
import test from 'node:test';
import assert from 'node:assert/strict';
import { createMultitrackToolbarDom } from '../modules/workstation/song/multitrack/multitrackToolbarDom.js';
import { fitMultitrackSong, seekMultitrackSong } from '../modules/workstation/song/multitrack/multitrackTimelineOperations.js';

/** @returns {Object} Long recording within a 390px phone. */
function example() {
	const state = {
		project: { tracks: [{ clips: [{ timelineStart: 0, duration: 96 }] }] },
		selection: { pixelsPerSecond: 72, playheadSeconds: 0 },
		setZoom(value) { this.selection.pixelsPerSecond = value; },
		setPlayhead(value) { this.selection.playheadSeconds = value; },
		setStatus(value) { this.status = value; }
	};
	return { state, dom: { root: {}, viewport: { clientWidth: 390, scrollLeft: 0 } } };
}

test('Fit keeps long audio inside the phone viewport', () => {
	const previous = globalThis.getComputedStyle;
	globalThis.getComputedStyle = () => ({ getPropertyValue: () => '102px' });
	try {
		const { state, dom } = example();
		fitMultitrackSong(dom, state);
		assert.ok(state.selection.pixelsPerSecond < 3);
		assert.ok(state.selection.pixelsPerSecond > .4);
		assert.match(state.status, /100.0s/);
	} finally { globalThis.getComputedStyle = previous; }
});

test('Time seeking clamps to project and stays centered', () => {
	const previous = globalThis.getComputedStyle;
	globalThis.getComputedStyle = () => ({ getPropertyValue: () => '102px' });
	try {
		const { state, dom } = example();
		seekMultitrackSong(dom, state, 48.25);
		assert.equal(state.selection.playheadSeconds, 48.25);
		assert.ok(dom.viewport.scrollLeft > 0);
		seekMultitrackSong(dom, state, -100);
		assert.equal(state.selection.playheadSeconds, 0);
		seekMultitrackSong(dom, state, 200);
		assert.equal(state.selection.playheadSeconds, 100);
	} finally { globalThis.getComputedStyle = previous; }
});

/** @param {string} tagName - Fake node name. @returns {Object} Minimal DOM node. */
function fakeElement(tagName) {
	return { tagName, children: [], attributes: {}, dataset: {}, style: {},
		append(...items) { this.children.push(...items); },
		appendChild(item) { this.children.push(item); },
		setAttribute(name, value) { this.attributes[name] = value; },
		addEventListener() {} };
}

test('WAV and WebM are visible, distinct, compact exports with note tools folded', () => {
	const previous = globalThis.document;
	globalThis.document = { createElement: fakeElement, createTextNode: text => ({ text }) };
	try {
		const dom = createMultitrackToolbarDom();
		assert.equal(dom.root.children[0].children.length, 6);
		assert.equal(dom.buttons.size, 13);
		assert.match(dom.buttons.get('downloadWav').textContent, /WAV/);
		assert.match(dom.buttons.get('downloadWebm').textContent, /WebM/);
		assert.equal(dom.root.children[0].children.includes(dom.buttons.get('downloadWebm')), true);
		assert.equal(dom.buttons.has('stop'), false);
		assert.equal(dom.root.children[2].tagName, 'details');
		assert.equal(dom.rippleCheckbox.checked, true);
		assert.equal(dom.snapSelect.value, '0.25');
		assert.equal(dom.overview.type, 'range');
	} finally { globalThis.document = previous; }
});
