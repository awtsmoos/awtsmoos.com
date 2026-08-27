// B"H
const assert = require('assert');
const { importedCoordinates } = require('../importedCoordinates.js');
assert.deepStrictEqual(importedCoordinates({ verseSection:'84', dayuh:{ subSection:3 } }), {
  sourceVerseSection:'84', sourceSubSection:'3', verseSection:'83', subSection:2
});
assert.deepStrictEqual(importedCoordinates({ verseSection:'1' }), {
  sourceVerseSection:'1', sourceSubSection:'', verseSection:'0', subSection:''
});
console.log('B"H importedCoordinates.test passed');
