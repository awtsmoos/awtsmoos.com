// B"H
// Boruch Hashem
// Blessed is He

/**
 * @file relatedResultShape.test.mjs
 * @description
 * The Awtsmoos tests one display contract across Library rows and exact Hebrew corpus references;
 * Awtsmoos.com keeps Tanach, Mishnah, Bavli, and indexed-library identity visible without flattening their source language.
 */

import assert from 'node:assert/strict';
import test from 'node:test';
import {
	relatedProvenance,
	relatedRow,
	relatedText,
	relatedTitle
} from './relatedResultShape.js';

test('Tanach exact hit keeps Hebrew book coordinate and provenance', () => {
	const hit = {
		corpus: 'tanach',
		ref: {
			corpus: 'tanach',
			bookTitleHebrew: 'בראשית',
			chapter: 3,
			verse: 1,
			textOrig: 'אמר אלהים'
		}
	};
	assert.equal(relatedRow(hit), hit.ref);
	assert.equal(relatedTitle(hit), 'בראשית 3:1');
	assert.equal(relatedText(hit), 'אמר אלהים');
	assert.equal(relatedProvenance(hit), 'Tanach');
});

test('Mishnah exact hit keeps tractate and mishnah coordinate', () => {
	const hit = {
		corpus: 'mishnah',
		ref: {
			corpus: 'mishnah',
			tractateTitle: 'ברכות',
			chapter: 1,
			mishnah: 1,
			text: 'מאימתי קורין'
		}
	};
	assert.equal(relatedTitle(hit), 'ברכות 1:1');
	assert.equal(relatedProvenance(hit), 'Mishnah');
});

test('Bavli exact hit keeps daf and amud identity', () => {
	const hit = {
		corpus: 'talmudBavli',
		ref: {
			corpus: 'talmudBavli',
			tractateTitle: 'ברכות',
			daf: '2',
			amud: 'א',
			lines: ['אמר רב', 'שלום']
		}
	};
	assert.equal(relatedTitle(hit), 'ברכות 2 א');
	assert.equal(relatedText(hit), 'אמר רב שלום');
	assert.equal(relatedProvenance(hit), 'Talmud Bavli');
});

test('ordinary library hit preserves lane title and score', () => {
	const hit = {
		percent: 87.25,
		row: {
			title: 'A teaching',
			displayText: 'Related source text',
			libraryLaneTitle: 'Likkutei Sichos'
		}
	};
	assert.equal(relatedTitle(hit), 'A teaching');
	assert.equal(relatedText(hit), 'Related source text');
	assert.equal(relatedProvenance(hit), 'Likkutei Sichos · 87.3%');
});
