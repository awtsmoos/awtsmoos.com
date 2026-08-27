// B"H

/**
 * @file sparse_array_dream_test.js
 * @chapter The Trillionth Index Without The Trillion Steps
 * @description Verifies existing arrays automatically gain sparse chunk powers.
 */

const fs = require('fs');
const assert = (cond, msg) => { if (!cond) throw new Error(msg); };
const AwtsmoosDB = require('../index.js');
const TempDbPath = require('./lightning/fastSuites/tempDb.js');

module.exports = (() => {
  const dbPath = TempDbPath.make('sparse_array_dream');
  TempDbPath.remove(dbPath);
  const huge = 824791248912;

  let db = new AwtsmoosDB(dbPath, { compression: true, turboWrites: false });
  db.open();
  db.root.big = ['dense-zero'];
  db.root.big[huge] = { far: true, index: huge };
  db.root.big[huge + 2] = 'next-island';

  assert(db.root.big[0] === 'dense-zero', 'dense value survives');
  assert(db.root.big[huge].far === true, 'huge sparse object reads immediately');
  assert(db.root.big.length === huge + 3, 'huge sparse length');

  const keys = db.keys(db.root.big, { order: 'asc', limit: 5 });
  assert(keys.includes(0) && keys.includes(huge), 'keys include dense and sparse');
  const ranges = db.arrayRanges(db.root.big);
  assert(ranges.some(r => r.start === huge && r.end === huge), 'ranges expose sparse island');
  assert(ranges.some(r => r.start === huge + 2 && r.end === huge + 2), 'ranges expose second island');
  assert(fs.existsSync(`${dbPath}.sparse.json`), 'sparse sidecar persisted');

  db.close();

  db = new AwtsmoosDB(dbPath, { compression: true, turboWrites: false });
  db.open();
  assert(db.root.big[huge].index === huge, 'huge sparse object persists');
  assert(db.root.big[huge + 2] === 'next-island', 'second sparse value persists');
  assert(db.root.big.length === huge + 3, 'huge sparse length persists');
  delete db.root.big[huge + 2];
  assert(db.root.big[huge + 2] === undefined, 'sparse delete works');
  db.close();

  TempDbPath.remove(dbPath);
  console.log('B"H sparse_array_dream_test PASS');
})();
