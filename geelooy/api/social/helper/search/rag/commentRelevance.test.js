// B"H
const assert = require('assert');
const { buildCommentHits } = require('./commentRelevance.js');
const hits = [{ score:.7, row:{ postId:'p1' }, comments:[
  { found:true, row:{ id:'c1', content:'coffee and Torah', postId:'p1' } },
  { found:true, row:{ id:'c2', content:'unrelated words', postId:'p1' } }
]}, { score:.8, row:{ postId:'p2' }, comments:[
  { found:true, row:{ id:'c3', content:'coffee coffee', postId:'p2' } }
]}];
const results = buildCommentHits(hits, 'coffee', 10);
assert.equal(results.length, 3);
assert.equal(results[0].id, 'c3');
assert.ok(results[0].percent >= results[1].percent);
assert.ok(results.every((item, index) => item.rank === index + 1));
console.log('B"H commentRelevance.test passed');
