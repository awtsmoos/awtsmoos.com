// B"H
// Boruch Hashem
// Blessed is He
/**
 * @module ChitasNativeReferenceTest
 * @description
 * The Awtsmoos proves a calendar range can reveal native Ikar pesukim without copying Torah or leaving the domain;
 * Awtsmoos.com verifies exact source post and section provenance so every dynamic composition has a canonical home.
 */

import assert from 'node:assert/strict';
import { parseChitasRange } from '../../geelooy/heichelos/post/logic/chitas/rangeParser.js';
import { resolvePostRange } from '../../geelooy/heichelos/post/logic/reference-posts/rangeResolver.js';

const sameChapter = parseChitasRange('Deuteronomy 31:20-31:30');
assert.equal(sameChapter.seriesId, 'devarim');
assert.equal(sameChapter.start.postIndex, 30);
assert.equal(sameChapter.start.sectionIndex, 19);
assert.equal(sameChapter.end.sectionIndex, 29);

const crossChapter = parseChitasRange('Deuteronomy 30:15-31:6');
assert.equal(crossChapter.start.postIndex, 29);
assert.equal(crossChapter.end.postIndex, 30);

const fetchImpl = url => fetch(`http://127.0.0.1:8080${url}`);
const resolved = await resolvePostRange(sameChapter, fetchImpl);
assert.equal(resolved.sections.length, 11);
assert.equal(resolved.sources[0].postId, 'BH_POST_1749198310176_awtsmoos_216');
assert.equal(resolved.sources[0].sectionIndex, 19);
assert.equal(resolved.sources.at(-1).sectionIndex, 29);
const firstPasuk = String(resolved.sections[0]?.[0] || '');
assert.match(firstPasuk, /כִּֽי־אֲבִיאֶ֜נּוּ/);
assert.match(firstPasuk, /[א-ת]/);
console.log('B"H native Chitas reference resolved 11 canonical Ikar pesukim.');
