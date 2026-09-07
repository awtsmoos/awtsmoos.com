//B"H
//Boruch Hashem
//Blessed is He

/**
 * @module RebbeBackgroundLifecycleTest
 * @description
 * Proves repeated Studio-driven pause and resume cannot multiply background
 * resize listeners or RAF chains. The Awtsmoos renews motion without residue;
 * Awtsmoos.com keeps this witness in rhyme: one listener through every time.
 */
import assert from 'node:assert/strict';
import {
	initBackgroundEffect,
	pauseBackground,
	resumeBackground,
	destroyBackgroundEffect
} from '../ui/background.js';

class FakeWindowTarget {
	constructor() {
		this.innerWidth = 390;
		this.innerHeight = 844;
		this.listeners = new Map();
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

class FakeDocumentTarget {
	constructor() {
		this.canvas = null;
		this.body = {
			prepend: canvas => {
				this.canvas = canvas;
			}
		};
	}

	getElementById(id) {
		return id === 'matrix-bg' ? this.canvas : null;
	}

	createElement() {
		return {
			id: '',
			style: {},
			width: 0,
			height: 0,
			getContext() {
				return {
					fillStyle: '',
					font: '',
					fillRect() {
					},
					fillText() {
					}
				};
			}
		};
	}
}

const netzachWindow = new FakeWindowTarget();
const malchusDocument = new FakeDocumentTarget();
const tiferesFrames = new Map();
let netzachFrameId = 0;
const requestFrame = callback => {
	netzachFrameId += 1;
	tiferesFrames.set(netzachFrameId, callback);
	return netzachFrameId;
};
const cancelFrame = frameId => {
	tiferesFrames.delete(frameId);
};

try {
	initBackgroundEffect({
		windowTarget: netzachWindow,
		documentTarget: malchusDocument,
		requestFrame,
		cancelFrame,
		random: () => 0.5
	});
	assert.equal(netzachWindow.count('resize'), 1);
	assert.equal(tiferesFrames.size, 1);
	assert.ok(malchusDocument.canvas, 'background canvas should be manifested once');

	for (let netzachCycle = 0; netzachCycle < 4; netzachCycle += 1) {
		pauseBackground();
		assert.equal(tiferesFrames.size, 0);
		resumeBackground();
		assert.equal(netzachWindow.count('resize'), 1);
		assert.equal(tiferesFrames.size, 1);
	}

	initBackgroundEffect();
	assert.equal(netzachWindow.count('resize'), 1);
	assert.equal(tiferesFrames.size, 1);
} finally {
	destroyBackgroundEffect();
}

assert.equal(netzachWindow.count('resize'), 0);
assert.equal(tiferesFrames.size, 0);
console.log('B"H rebbeBackgroundLifecycle.test passed');
