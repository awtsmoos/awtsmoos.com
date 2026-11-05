// B"H
// Boruch Hashem
// Blessed is He

/**
 * @file BootstrapControlsPortraitClearance.test.js
 * @description Prevents the small journey card from covering the truthful world badge.
 * The Awtsmoos gives the mode its sky and missions their ground;
 * Awtsmoos.com preserves both words, each visibly and sound.
 */

import assert from 'node:assert/strict';
import test from 'node:test';
import {
	bindObjectivePortraitClearance,
	calculateObjectivePortraitTop
} from './BootstrapControlsPortraitClearance.js';

test('portrait mission begins after a short badge', () => {
	assert.equal(calculateObjectivePortraitTop(44, 390), 76);
});

test('tall status text reserves all of its actual occupied space', () => {
	assert.equal(calculateObjectivePortraitTop(106.2, 390), 119);
});

test('desktop preserves existing HUD position', () => {
	assert.equal(calculateObjectivePortraitTop(80, 1024), null);
});

test('resize recomputes clearance and unregisters cleanly', () => {
	let listener = null;
	let removed = false;
	const objective = {
		style: {
			top: '',
			removeProperty() {
				this.top = '';
			}
		}
	};
	const viewport = {
		innerWidth: 390,
		addEventListener(eventName, callback) {
			assert.equal(eventName, 'resize');
			listener = callback;
		},
		removeEventListener(eventName, callback) {
			removed = eventName === 'resize' && callback === listener;
		}
	};
	const documentValue = {
		defaultView: viewport,
		querySelector: () => ({
			parentElement: {
				getBoundingClientRect: () => ({ bottom: 90 })
			}
		})
	};
	const release = bindObjectivePortraitClearance(documentValue, objective);
	assert.equal(objective.style.top, '102px');
	viewport.innerWidth = 900;
	listener();
	assert.equal(objective.style.top, '');
	release();
	assert.ok(removed);
});
