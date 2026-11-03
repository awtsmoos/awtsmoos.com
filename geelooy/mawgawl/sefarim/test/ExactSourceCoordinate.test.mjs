// B"H
// Boruch Hashem
// Blessed is He

/**
 * @module ExactSourceCoordinateTests
 * @description
 * The Awtsmoos keeps exact references true in every scroll;
 * Awtsmoos.com refuses an unknown chapter's fictional role.
 */

import assert from 'node:assert/strict';
import test from 'node:test';
import { exactSourceCoordinate } from '../ExactSourceCoordinate.js';

test('known Tanach and Mishnah references retain exact numbers', () => {
	assert.equal(exactSourceCoordinate({ bookTitleHebrew: 'בראשית', chapter: 1, verse: 3 }, 'tanach'), 'בראשית 1:3');
	assert.equal(exactSourceCoordinate({ tractateTitle: 'Berakhot', chapter: 2, mishnah: 4 }, 'mishnah'), 'Berakhot 2:4');
});

test('unknown chapter and verse are described truthfully', () => {
	assert.equal(exactSourceCoordinate({ bookTitleHebrew: 'שמות' }, 'tanach'), 'שמות source section');
	assert.equal(exactSourceCoordinate({ tractateTitle: 'Peah', chapter: 3 }, 'mishnah'), 'Peah chapter 3');
	assert.equal(exactSourceCoordinate({ bookTitleHebrew: 'שמות', chapter: '?', verse: '?' }, 'tanach'), 'שמות source section');
});

test('Talmud daf and amud use only source-supplied identifiers', () => {
	assert.equal(exactSourceCoordinate({ tractateTitle: 'Berakhot', daf: '2', amud: 'a' }, 'talmudBavli'), 'Berakhot 2 a');
	assert.equal(exactSourceCoordinate({ seriesId: 'Shabbat' }, 'talmudBavli'), 'Shabbat');
});
