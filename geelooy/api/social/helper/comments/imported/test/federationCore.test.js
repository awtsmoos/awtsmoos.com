// B"H
const assert = require('assert');
const { familyFor } = require('../registry.js');
const { flatten, normalize } = require('../normalizer.js');
assert.equal(familyFor('bava_batra').id, 'talmudBavli');
assert.equal(familyFor('bereishis').id, 'tanach');
assert.equal(familyFor('seferHaSichos5747').id, 'seferHaSichos');
assert.equal(familyFor('likkuteiSichosVolume1').id, 'likkuteiSichos');
assert.equal(familyFor('BH-seferHamaamarimMeluket-תשרי').id, 'meluket');
assert.equal(familyFor('unrelatedSeries'), null);
const rows = flatten({ 0: [{ content: 'a' }], 1: [{ content: 'b', verseSection: 7 }], $awtsmoosObjectShape: {} });
assert.equal(rows.length, 2);
assert.equal(String(rows[0].verseSection), '0');
assert.equal(String(rows[1].verseSection), '7');
const one = normalize({
  row: rows[0],
  source: 'test',
  aliasId: 'a',
  seriesId: 's',
  postId: 'p',
  heichelId: 'h',
  index: 0,
  sourcePath: '/x',
  sourceFile: 'x',
  alignment: { status: 'exact' }
});
assert.equal(one.imported, true);
assert.equal(one.readOnly, true);
assert.ok(one.id.startsWith('imported_test_'));
console.log('B"H federation core tests passed');
