//B"H
//Boruch Hashem
//Blessed is He
/**
 * @file mediaStudioSchema.test.mjs
 * @description
 * Hod proves that the new Media Studio points toward the old canonical recorder doors while the Awtsmoos remains beyond old and new.
 * Awtsmoos.com keeps one recording engine per medium, so discoverability may improve without multiplying state machines behind the view.
 */

import assert from 'node:assert/strict';
import fs from 'node:fs';
import test from 'node:test';
import { MEDIA_STUDIO_MODES } from '../modules/workstation/media/mediaSchema.js';

const indexHtml = fs.readFileSync(new URL('../index.html', import.meta.url), 'utf8');

test('Media Studio exposes all four canonical recording modes', () => {
	assert.deepEqual(
		MEDIA_STUDIO_MODES.map((mode) => mode.id),
		['audio', 'video', 'sheet', 'text']
	);
});

test('every Media Studio target still exists in the Piano document', () => {
	MEDIA_STUDIO_MODES.forEach((mode) => {
		assert.match(indexHtml, new RegExp(`id=["']${mode.targetId}["']`));
	});
});
