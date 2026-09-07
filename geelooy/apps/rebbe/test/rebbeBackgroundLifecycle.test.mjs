//B"H
//Boruch Hashem
//Blessed is He

/**
 * @module RebbeBackgroundLifecycleTest
 * @description
 * Proves absent-session resume stays absent, while explicitly initialized
 * background pause/resume cannot multiply resize listeners or RAF chains and
 * native-style RAF methods keep their Window receiver. Awtsmoos.com keeps one line in time.
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
		this.frames = new Map();
		this.nextFrameId = 0;
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

	requestAnimationFrame(callback) {
		assert.equal(this, netzachWindow, 'RAF must retain the Window receiver');
		this.nextFrameId += 1;
		this.frames.set(this.nextFrameId, callback);
		return this.nextFrameId;
	}

	cancelAnimationFrame(frameId) {
		assert.equal(this, netzachWindow, 'cancelRAF must retain the Window receiver');
		this.frames.delete(frameId);
	}

	count(type) {
		return this.listeners.get(type)?.size || 0;
	}
}

class FakeDocumentTarget {
	constructor() {
		this.canvas = null;
		this.body = { prepend: canvas => { this.canvas = canvas; } };
	}

	getElementById(id) {
		return id === 'matrix-bg' ? this.canvas : null;
	}

	createElement() {
		return {
			id: '', style: {}, width: 0, height: 0,
			getContext() {
				return {
					fillStyle: '', font: '',
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

try {
	assert.equal(resumeBackground(), false, 'resume must not create an absent session');
	assert.equal(netzachWindow.count('resize'), 0);
	assert.equal(netzachWindow.frames.size, 0);
	assert.equal(malchusDocument.canvas, null);

	initBackgroundEffect({
		windowTarget: netzachWindow,
		documentTarget: malchusDocument,
		random: () => 0.5
	});
	assert.equal(netzachWindow.count('resize'), 1);
	assert.equal(netzachWindow.frames.size, 1);
	assert.ok(malchusDocument.canvas, 'background canvas should be manifested once');

	for (let netzachCycle = 0; netzachCycle < 4; netzachCycle += 1) {
		pauseBackground();
		assert.equal(netzachWindow.frames.size, 0);
		assert.equal(resumeBackground(), true);
		assert.equal(netzachWindow.count('resize'), 1);
		assert.equal(netzachWindow.frames.size, 1);
	}

	initBackgroundEffect();
	assert.equal(netzachWindow.count('resize'), 1);
	assert.equal(netzachWindow.frames.size, 1);
} finally {
	destroyBackgroundEffect();
}

assert.equal(netzachWindow.count('resize'), 0);
assert.equal(netzachWindow.frames.size, 0);
console.log('B"H rebbeBackgroundLifecycle.test passed');
