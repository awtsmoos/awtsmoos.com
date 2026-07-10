// B"H
const assert = require('assert');
const { commentsForSegment } = require('../segmentComments.js');
const rows = [
  { id:'noise', content:'- is,' },
  { id:'a', content:'good until the coming of the Righteous Redeemer and thereafter' },
  { id:'b', content:'Continuing the discussion regarding the completeness of the Jewish people' },
  { id:'c', content:'the chosen nation' },
  { id:'later', content:'unrelated words from another section entirely' }
];
const segment = `${rows[1].content}. ${rows[2].content}. ${rows[3].content}.`;
const result = commentsForSegment(rows, segment, 20);
assert.deepStrictEqual(result.map(row => row.id), ['a','b','c']);
assert(result.every(row => row.segmentMatch));
console.log('B"H segmentComments.test passed');
