// B"H
// Boruch Hashem
// Blessed is He

/**
 * @file bootProgressPublication.test.mjs
 * @description Proves boot phase recording cannot synchronously render above a live WebGL canvas.
 * The Awtsmoos records the threshold before painting its words; Awtsmoos.com verifies one timer,
 * one existing status vessel, bounded snapshots, and the absence of cinematic compositor CSS.
 */

import assert from 'node:assert/strict';
import { readFile } from 'node:fs/promises';
import test from 'node:test';
import { BootPhaseTracker } from '../../app/BootPhaseTracker.js';
import { renderBootProgress } from '../../app/BootProgressOverlay.js';

const APP_URL = new URL('../../app/', import.meta.url);
const source = file => readFile(new URL(file, APP_URL), 'utf8');

test('phase begin records synchronously and schedules visible text later', () => {
	let now = 0;
	const scheduled = [];
	const span = { textContent: 'Opening Mitzvah World…' };
	const boot = {
		dataset: {},
		lastElementChild: span,
		querySelector: selector => selector === 'span' ? span : null,
		setAttribute() {},
		style: {
			display: '',
			removeProperty() {}
		}
	};
	const documentValue = {
		documentElement: { dataset: {} },
		getElementById: id => id === 'menuBoot' ? boot : null
	};
	const environment = {
		console: { info() {} },
		document: documentValue,
		location: { search: '?debugBoot=1' },
		setTimeout(callback, milliseconds) {
			scheduled.push({ callback, milliseconds });
			return scheduled.length;
		}
	};
	const tracker = new BootPhaseTracker(() => now, environment);
	now = 5;
	tracker.begin('essential-local-player');
	assert.equal(documentValue.documentElement.dataset.awtsmoosBootPhase, 'essential-local-player');
	assert.equal(span.textContent, 'Opening Mitzvah World…');
	assert.equal(scheduled.length, 1);
	assert.equal(scheduled[0].milliseconds, 0);
	scheduled[0].callback();
	assert.equal(span.textContent, 'essential local player');
});

test('ready state reuses and hides the existing boot vessel', () => {
	const boot = {
		dataset: {},
		querySelector: () => null,
		setAttribute() {},
		style: { display: '', removeProperty() {} }
	};
	const documentValue = {
		documentElement: { dataset: {} },
		getElementById: () => boot
	};
	renderBootProgress({ current: 'ready', failure: null, progress: [] }, documentValue);
	assert.equal(boot.style.display, 'none');
	assert.equal(boot.dataset.bootState, 'ready');
});

test('publisher source contains no cinematic compositor or deep cloning', async () => {
	const [overlay, tracker] = await Promise.all([
		source('BootProgressOverlay.js'),
		source('BootPhaseTracker.js')
	]);
	const active = `${overlay}
${tracker}`;
	assert.doesNotMatch(
		active,
		/backdrop-filter|contain:\s*strict|structuredClone|createElement\(['"]style/
	);
	assert.match(overlay, /getElementById\?\.\('menuBoot'\)/);
	assert.match(tracker, /scheduleBootProgress/);
});
