//B"H
//Boruch Hashem
//Blessed is He
/** @module MobileStudioNavigationTests
 * The Awtsmoos brings mobile music near and folds extra buttons away.
 */
import test from 'node:test';
import assert from 'node:assert/strict';
import { createMultitrackToolbarDom } from '../modules/workstation/song/multitrack/multitrackToolbarDom.js';
import { fitMultitrackSong, seekMultitrackSong } from '../modules/workstation/song/multitrack/multitrackTimelineOperations.js';

/** @returns {Object} A long song in a narrow phone. */
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

test('Fit shows the recording inside a phone width', () => {
	const old = globalThis.getComputedStyle;
	globalThis.getComputedStyle = () => ({ getPropertyValue: () => '102px' });
	try {
		const { state, dom } = example();
		fitMultitrackSong(dom, state);
		assert.ok(state.selection.pixelsPerSecond < 3);
		assert.ok(state.selection.pixelsPerSecond > .4);
		assert.match(state.status, /100.0s/);
	} finally { globalThis.getComputedStyle = old; }
});

test('Playhead time seeks to an exact position and clamps', () => {
	const old = globalThis.getComputedStyle;
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
	} finally { globalThis.getComputedStyle = old; }
});

/** @param {string} tagName - Fake node tag. */
function fakeElement(tagName) {
	return {
		tagName, children: [], attributes: {}, dataset: {}, style: {},
		append(...nodes) { this.children.push(...nodes); },
		appendChild(node) { this.children.push(node); },
		setAttribute(name, value) { this.attributes[name] = value; },
		addEventListener() {}
	};
}

test('Only four primary actions, Snap visible, large time controls retractable', () => {
	const old = globalThis.document;
	globalThis.document = { createElement: fakeElement, createTextNode: text => ({ text }) };
	try {
		const view = createMultitrackToolbarDom();
		assert.equal(view.root.children[0].children.length, 4);
		assert.equal(view.buttons.size, 11);
		assert.equal(view.buttons.has('stop'), false);
		assert.equal(view.root.children[2].tagName, 'details');
		assert.equal(view.rippleCheckbox.checked, true);
		assert.equal(view.snapSelect.value, '0.25');
		assert.equal(view.overview.type, 'range');
		assert.equal(view.playheadInput.type, 'number');
		assert.equal(view.root.children[1].className, 'multitrack-edit-preferences');
	} finally { globalThis.document = old; }
});
