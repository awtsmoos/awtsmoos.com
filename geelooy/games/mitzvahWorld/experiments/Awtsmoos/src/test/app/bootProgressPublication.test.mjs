// B"H
// Boruch Hashem
// Blessed is He

/**
 * @file bootProgressPublication.test.mjs
 * @description Proves boot phase publication stays deferred and targets only the explicit loader-message vessel.
 * The Awtsmoos records the threshold before painting its words; Awtsmoos.com verifies one timer,
 * one appointed status keli, bounded snapshots, and no accidental mutation of richer milestone spans.
 */

import assert from 'node:assert/strict';
import { readFile } from 'node:fs/promises';
import test from 'node:test';
import { BootPhaseTracker } from '../../app/BootPhaseTracker.js';
import { renderBootProgress } from '../../app/BootProgressOverlay.js';

const APP_URL = new URL('../../app/', import.meta.url);
const source = file => readFile(new URL(file, APP_URL), 'utf8');

test('phase begin records synchronously and schedules explicit loading message later', () => {
	let now = 0;
	const scheduled = [];
	const message = { textContent: 'Opening Mitzvah World…' };
	const unrelatedSpan = { textContent: 'Entry module' };
	const boot = {
		dataset: {},
		querySelector: selector => selector === 'span' ? unrelatedSpan : null,
		setAttribute() {},
		style: {
			display: '',
			removeProperty() {}
		}
	};
	const documentValue = {
		documentElement: { dataset: {} },
		getElementById(id) {
			if (id === 'menuBoot') return boot;
			if (id === 'loadingMessage') return message;
			return null;
		}
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
	assert.equal(message.textContent, 'Opening Mitzvah World…');
	assert.equal(scheduled.length, 1);
	assert.equal(scheduled[0].milliseconds, 0);
	scheduled[0].callback();
	assert.equal(message.textContent, 'essential local player');
	assert.equal(unrelatedSpan.textContent, 'Entry module');
});

test('ready state reuses and hides the existing boot vessel', () => {
	const boot = {
		dataset: {},
		setAttribute() {},
		style: { display: '', removeProperty() {} }
	};
	const documentValue = {
		documentElement: { dataset: {} },
		getElementById: id => id === 'menuBoot' ? boot : null
	};
	renderBootProgress({ current: 'ready', failure: null, progress: [] }, documentValue);
	assert.equal(boot.style.display, 'none');
	assert.equal(boot.dataset.bootState, 'ready');
});

test('publisher source contains no cinematic compositor or generic span ownership', async () => {
	const [overlay, tracker] = await Promise.all([
		source('BootProgressOverlay.js'),
		source('BootPhaseTracker.js')
	]);
	const active = `${overlay}\n${tracker}`;
	assert.doesNotMatch(
		active,
		/backdrop-filter|contain:\s*strict|structuredClone|createElement\(['"]style/
	);
	assert.match(overlay, /getElementById\?\.\('menuBoot'\)/);
	assert.match(overlay, /getElementById\?\.\('loadingMessage'\)/);
	assert.doesNotMatch(overlay, /querySelector\?\.\('span'\)/);
	assert.match(tracker, /scheduleBootProgress/);
});
