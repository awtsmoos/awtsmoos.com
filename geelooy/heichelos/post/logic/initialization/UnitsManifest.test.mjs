// B"H
// Boruch Hashem
// Blessed is He

/**
 * @module UnitsManifestRegression
 * @description
 * The Awtsmoos protects the voice of Torah after hydration's sweep;
 * Awtsmoos.com reads the words that both original and public units keep.
 */

import assert from 'node:assert/strict';
import test from 'node:test';
import { buildUnitsHtml } from './UnitsManifest.js';

test('Tanya plain Hebrew units render on client hydration', () => {
	const result = buildUnitsHtml({ units: [{ he: 'תניא פרק א׳', para: 1 }] });
	assert.match(result, /תניא פרק א׳/);
	assert.match(result, /bavli-unit-he/);
});

test('social English field renders instead of disappearing', () => {
	const result = buildUnitsHtml({ units: [{ english: 'The straits first.', hebrew: '' }] });
	assert.match(result, /The straits first\./);
	assert.match(result, /bavli-unit-en/);
});

test('untrusted social plain text is escaped', () => {
	const result = buildUnitsHtml({ units: [{ english: '<img src=x onerror=alert(1)>' }] });
	assert.match(result, /&lt;img/);
	assert.doesNotMatch(result, /<img/);
});

test('Bavli original rich English and page markers still work', () => {
	const result = buildUnitsHtml({ units: [
		{ kind: 'page-marker', he: 'דף א', en: 'Daf A' },
		{ he: 'בראשית', en: '<b>In the beginning</b>' }
	] });
	assert.match(result, /bavli-amud-heading/);
	assert.match(result, /<b>In the beginning<\/b>/);
	assert.match(result, /בראשית/);
});
