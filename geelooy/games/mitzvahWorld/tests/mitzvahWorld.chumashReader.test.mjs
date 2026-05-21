// B"H
/**
 * Chapter 19: The Book Opens For Both Screens.
 */

import assert from 'node:assert/strict';
import { ChumashReaderController } from '../ckidsAwtsmoos/Olam/worlds/mitzvahWorld/debate/ChumashReaderController.js';
import { STARTING_CHUMASH_ITEM } from '../ckidsAwtsmoos/Olam/worlds/mitzvahWorld/data/manifests/ChumashPassages.js';

const reader = new ChumashReaderController();
let state = reader.openBook(STARTING_CHUMASH_ITEM);
assert.equal(state.book.id, 'book_chumash_bereishis');
assert.equal(state.passages.length, 2);

const passage = reader.openPassage('shemos_20_2');
assert.equal(passage.ref, 'Shemos 20:2');

const pirushim = reader.listPirushim();
assert.deepEqual(pirushim.map(p => p.type).sort(), ['derush', 'pshat', 'remez', 'sod']);
assert.ok(pirushim.some(p => p.world === 'Atzilus' && p.element === 'air'));

state = reader.close();
assert.equal(state.currentPassageId, 'shemos_20_2');
assert.equal(reader.snapshot().book, null);

console.log('B"H - Chumash reader runtime passed.');
