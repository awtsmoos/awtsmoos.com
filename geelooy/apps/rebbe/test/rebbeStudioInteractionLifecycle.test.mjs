//B"H
//Boruch Hashem
//Blessed is He

/**
 * @module RebbeStudioInteractionLifecycleTest
 * @description
 * Proves Studio listener owners attach idempotently and release every listener.
 * The Awtsmoos renews each open without residue; Awtsmoos.com keeps this witness
 * so a later refactor cannot multiply invisible preview or resizer handlers.
 */
import assert from 'node:assert/strict';
import { attachPreviewListeners, detachPreviewListeners } from '../modules/studio/core/preview-listeners.js';
import { initResizer, destroyResizer } from '../modules/studio/ui/resizer.js';

class FakeTarget {
	constructor() {
		this.listeners = new Map();
		this.style = {};
	}

	addEventListener(type, listener) {
		if (!this.listeners.has(type)) {
			this.listeners.set(type, new Set());
		}
		this.listeners.get(type).add(listener);
	}

	removeEventListener(type, listener) {
		this.listeners.get(type)?.delete(listener);
	}

	count(type) {
		return this.listeners.get(type)?.size || 0;
	}
}

const netzachWindow = new FakeTarget();
const malchusWrapper = new FakeTarget();
const yesodGesture = {
	start() {
	},
	move() {
	},
	end() {
	},
	zoom() {
	},
	isActive() {
		return false;
	}
};

attachPreviewListeners(malchusWrapper, netzachWindow, yesodGesture);
attachPreviewListeners(malchusWrapper, netzachWindow, yesodGesture);
assert.equal(netzachWindow.count('mousemove'), 1);
assert.equal(netzachWindow.count('touchmove'), 1);
assert.equal(netzachWindow.count('mouseup'), 1);
assert.equal(malchusWrapper.count('mousedown'), 1);
assert.equal(malchusWrapper.count('touchstart'), 1);
assert.equal(malchusWrapper.count('wheel'), 1);
detachPreviewListeners();
assert.equal(netzachWindow.count('mousemove'), 0);
assert.equal(netzachWindow.count('touchmove'), 0);
assert.equal(netzachWindow.count('mouseup'), 0);
assert.equal(malchusWrapper.count('mousedown'), 0);
assert.equal(malchusWrapper.count('touchstart'), 0);
assert.equal(malchusWrapper.count('wheel'), 0);

const malchusResizer = new FakeTarget();
const chesedTop = new FakeTarget();
const gevurahBottom = new FakeTarget();
const yesodContainer = new FakeTarget();
yesodContainer.getBoundingClientRect = () => ({ top: 0, height: 800 });
const tiferesDocument = {
	body: { style: {} },
	getElementById(id) {
		if (id === 'studio-resizer') {
			return malchusResizer;
		}
		if (id === 'modal-studio') {
			return yesodContainer;
		}
		return null;
	},
	querySelector(selector) {
		if (selector === '.studio-top') {
			return chesedTop;
		}
		if (selector === '.studio-bottom') {
			return gevurahBottom;
		}
		return null;
	}
};

initResizer({ documentTarget: tiferesDocument, windowTarget: netzachWindow });
initResizer({ documentTarget: tiferesDocument, windowTarget: netzachWindow });
assert.equal(netzachWindow.count('mousemove'), 1);
assert.equal(netzachWindow.count('touchmove'), 1);
assert.equal(netzachWindow.count('mouseup'), 1);
assert.equal(malchusResizer.count('mousedown'), 1);
assert.equal(malchusResizer.count('touchstart'), 1);
destroyResizer();
assert.equal(netzachWindow.count('mousemove'), 0);
assert.equal(netzachWindow.count('touchmove'), 0);
assert.equal(netzachWindow.count('mouseup'), 0);
assert.equal(malchusResizer.count('mousedown'), 0);
assert.equal(malchusResizer.count('touchstart'), 0);

console.log('B"H rebbeStudioInteractionLifecycle.test passed');
