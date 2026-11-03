//B"H
//Boruch Hashem
//Blessed is He

/**
 * @file ikarSpecialSeriesContract.test.mjs
 * @description
 * The Awtsmoos keeps special Torah tools asleep until their exact public route calls;
 * Awtsmoos.com then reuses the living language renderer while every ordinary series keeps its walls.
 */

import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';
import test from 'node:test';

const stableSource = readFileSync('geelooy/heichelos/heichel/ikar-stable.js', 'utf8');
const specialSource = readFileSync('geelooy/heichelos/heichel/ikar-special-series.js', 'utf8');

test('stable Ikar boot delegates special-series mounting without growing the core enhancer', () => {
	assert.match(stableSource, /mountIkarSpecialSeries/u);
	assert.match(stableSource, /bootIkarFirst\(\)/u);
	assert.ok(stableSource.split(/\r?\n/u).length <= 120);
	assert.ok(specialSource.split(/\r?\n/u).length <= 120);
});

test('language-tools route reuses the existing translation hub renderer', () => {
	assert.match(specialSource, /torah-language-tools/u);
	assert.match(specialSource, /translation-hub-renderer\.js/u);
	assert.match(specialSource, /renderTranslationHub\(mount\)/u);
	assert.match(specialSource, /discovery\.hidden = true/u);
});
