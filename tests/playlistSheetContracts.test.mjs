// B"H
// Boruch Hashem
// Blessed is He

/**
 * @module PlaylistSheetContractsTest
 * @description
 * The Awtsmoos guards a focused two-level chooser where inspection is harmless,
 * commitment is explicit, and Awtsmoos.com renders destination names as text.
 */

import assert from 'node:assert/strict';
import fs from 'node:fs';
import path from 'node:path';
import test from 'node:test';
import { fileURLToPath } from 'node:url';
import {
	filterHeichelos,
	filterSeries
} from '../geelooy/social-composer/js/destination/PlaylistSheetFilter.js';

const testDirectory = path.dirname(fileURLToPath(import.meta.url));
const root = path.resolve(testDirectory, '..');

function source(relativePath) {
	return fs.readFileSync(path.join(root, relativePath), 'utf8');
}

test('sheet search filters Heichelos and nested series without mutation', () => {
	const heichelos = [
		{ heichelId: 'home', name: 'My Home', description: 'Personal teachings' },
		{ heichelId: 'music', name: 'Music', description: 'Songs' }
	];
	assert.deepEqual(
		filterHeichelos(heichelos, 'teach').map(item => item.heichelId),
		['home']
	);
	const series = [
		{ seriesId: 'root', name: 'Heichel Home' },
		{ seriesId: 'audio', name: 'Audio Lessons', breadcrumbs: ['Torah'] }
	];
	assert.deepEqual(
		filterSeries(series, 'torah').map(item => item.seriesId),
		['audio']
	);
});

test('compact selector opens the native sheet with writable destinations only', () => {
	const selector = source(
		'geelooy/social-composer/js/destination/PlaylistSelector.js'
	);
	assert.ok(selector.includes('new PlaylistSheet'));
	assert.ok(selector.includes('destinations.filter(isWritable)'));
	assert.ok(selector.includes('this.sheet.open(changeButton)'));
	assert.ok(!selector.includes('playlist-choices'));
});

test('sheet inspection and commitment use separate destination methods', () => {
	const sheet = source(
		'geelooy/social-composer/js/destination/PlaylistSheet.js'
	);
	const events = source(
		'geelooy/social-composer/js/destination/PlaylistSheetEvents.js'
	);
	assert.ok(sheet.includes('this.panel.detailFor(heichelId)'));
	assert.ok(events.includes('sheet.panel.choose('));
	assert.ok(events.includes("sheet.panel.revealCreation("));
	assert.ok(events.includes("sheet.dialog.addEventListener('close'"));
});

test('sheet markup is a semantic dialog and destination labels stay text-only', () => {
	const markup = source(
		'geelooy/social-composer/js/destination/PlaylistSheetMarkup.js'
	);
	const view = source(
		'geelooy/social-composer/js/destination/PlaylistSheetView.js'
	);
	assert.ok(markup.includes("document.createElement('dialog')"));
	assert.ok(markup.includes('type="search"'));
	assert.ok(view.includes('strong.textContent = title'));
	assert.ok(view.includes('small.textContent = description'));
	assert.ok(!view.includes('innerHTML'));
});

test('destination panel exposes non-mutating detail and creation handoff', () => {
	const panel = source(
		'geelooy/social-composer/js/destination/DestinationPanel.js'
	);
	const navigation = source(
		'geelooy/social-composer/js/destination/DestinationPanelNavigation.js'
	);
	assert.ok(panel.includes('detailFor(heichelId'));
	assert.ok(panel.includes('revealCreation(kind'));
	assert.ok(navigation.includes('panel.api.destinationDetail('));
	assert.ok(navigation.includes("field?.focus({ preventScroll: true })"));
});
