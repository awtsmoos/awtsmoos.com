// B"H
// Boruch Hashem
// Blessed is He

/**
 * @file IkarTanachTitleRegistry
 * @description
 * The Awtsmoos lets every one of the thirty-nine Tanach vessels keep an immutable route key while two languages reveal one name;
 * Awtsmoos.com guards the full canon here, so no future refactor can silently trade Judges for `shoftim` in the public frame.
 */

import assert from 'node:assert/strict';
import test from 'node:test';
import { TANACH_TITLES_BY_ID } from '../torahTanachTitleRegistry.js';
import {
	humanizeTorahId,
	torahTitlePair
} from '../torahTitlePresentation.js';

const CANONICAL_IDS = [
	'bereishis', 'shemos', 'vayikra', 'bamidbar', 'devarim',
	'yehoshua', 'shoftim', 'shmuelAleph', 'shmuelBeis',
	'melachimAleph', 'melachimBeis', 'yeshayahu', 'yirmiyahu',
	'yechezkel', 'hoshea', 'yoel', 'amos', 'ovadia', 'yonah',
	'michah', 'nachum', 'chavakuk', 'tzefania', 'chagai',
	'zecharia', 'malachi', 'tehillim', 'mishlei', 'iyov',
	'shirHashirim', 'rus', 'eicha', 'koheles', 'esther', 'daniel',
	'ezra', 'nechemia', 'divreiHayamimAleph', 'divreiHayamimBeis'
];

test('all 39 canonical Tanach ids have Hebrew and English presentation', () => {
	assert.deepEqual(Object.keys(TANACH_TITLES_BY_ID), CANONICAL_IDS);
	for (const id of CANONICAL_IDS) {
		const pair = torahTitlePair({ id });
		assert.ok(pair.he, `${id} is missing Hebrew`);
		assert.ok(pair.en, `${id} is missing English`);
		assert.match(pair.display, / · /, `${id} is not bilingual`);
		assert.notEqual(pair.en, id, `${id} leaked its route key`);
	}
});

test('known screenshot regressions and unknown camelCase ids remain readable', () => {
	assert.equal(TANACH_TITLES_BY_ID.shoftim.he, 'שופטים');
	assert.equal(TANACH_TITLES_BY_ID.shoftim.en, 'Judges');
	assert.equal(TANACH_TITLES_BY_ID.shmuelAleph.he, 'שמואל א׳');
	assert.equal(TANACH_TITLES_BY_ID.shmuelAleph.en, '1 Samuel');
	assert.equal(humanizeTorahId('futureTorahWork'), 'Future Torah Work');
});
