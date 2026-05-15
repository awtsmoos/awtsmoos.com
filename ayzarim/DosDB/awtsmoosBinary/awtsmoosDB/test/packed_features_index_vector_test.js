// B"H

/**
 * @file test/packed_features_index_vector_test.js
 * @chapter The Compact Records That Still Know How To Be Searched
 * @description
 * Proves many small records can stay packed while query, secondary indexes,
 * text search, and vector search still work. The same probe also runs with
 * packedArrays: false so the full Sequence/Dictionary path stays covered.
 */

const fs = require('fs');
const assert = require('assert');
const AwtsmoosDB = require('../index.js');

const base = __dirname + '/__packed_features_index_vector';

function clean(path) {
  for (const suffix of ['', '.wal', '.lock', '.txn.json', '.sparse.json']) {
    try { fs.rmSync(path + suffix, { force: true }); } catch (_err) {}
  }
}

function makeRows() {
  const rows = [];
  for (let i = 0; i < 64; i++) {
    const role = i % 2 === 0 ? 'admin' : 'user';
    const focus = i % 3 === 0 ? 'light' : 'void';
    rows.push({
      id: i,
      role,
      focus,
      note: `file ${i} ${focus} spark`
    });
  }
  return rows;
}

function makeVectorRows(packed) {
  const vectors = [
    { id: 'A', vec: [1, 0, 0, 0], txt: 'Alpha light' },
    { id: 'B', vec: [0, 1, 0, 0], txt: 'Beta void' },
    { id: 'C', vec: [0.9, 0.1, 0, 0], txt: 'Gamma light' }
  ];
  if (!packed) return vectors;
  return vectors.map(row => ({ ...row, vec: new Float32Array(row.vec) }));
}

function resolveArray(rows) {
  return rows.map(row => row && row.__resolve__ ? row.__resolve__() : row);
}

function runScenario(name, options, assignCollection, assignVectorCollection) {
  const dbPath = `${base}_${name}.awtsdb`;
  clean(dbPath);

  const db = new AwtsmoosDB(dbPath, { wal: false, compression: false, ...options });
  db.open();

  const rows = makeRows();
  assignCollection(db, rows);

  const admins = db.query(db.root.records, { $filter: { role: 'admin' } });
  assert.strictEqual(admins.length, 32, `${name}: query filter sees all records`);

  const slice = db.query(db.root.records, { $slice: [5, 8] });
  assert.strictEqual(slice.length, 3, `${name}: query slice works`);

  const mapped = db.query(db.root.records, { $filter: { id: 6 }, $map: { which: 'focus', who: 'role' } });
  assert.strictEqual(mapped[0].which, 'light', `${name}: query projects row`);

  const index = db.indexes.create('root.records', 'role', { name: `${name}_role` });
  assert.strictEqual(index.keys, 64, `${name}: secondary index backfills all rows`);
  assert.strictEqual(db.indexes.find(`${name}_role`, 'admin').length, 32, `${name}: secondary index find`);

  db.search.enable(db.root.records);
  const light = db.search.run(db.root.records, 'light');
  assert.strictEqual(light.length, 22, `${name}: search finds rows`);
  assert.strictEqual(resolveArray(light).find(r => r.id === 6).focus, 'light', `${name}: search results hydrate`);

  if (name === 'packed') {
    assignVectorCollection(db, makeVectorRows(true));
    db.waitForIdle();
    db.vector.enable(db.root.vectors, { dimensions: 4, metric: 'cosine' });
    const near = db.vector.nearest(db.root.vectors, [1, 0, 0, 0], 2);
    assert.strictEqual(near.length, 2, `${name}: vector returns results`);
    assert.strictEqual(near[0].item.id, 'A', `${name}: vector nearest first row`);
    assert.strictEqual(near[1].item.id, 'C', `${name}: vector nearest second row`);
  }

  db.close();
  clean(dbPath);
}

runScenario('packed', {}, (db, rows) => {
  db.root.records = rows;
}, (db, rows) => {
  db.root.vectors = rows;
});

runScenario('unpacked', { packedArrays: false }, (db, rows) => {
  db.createList(db.root, 'records');
  for (const row of rows) db.root.records.push(row);
}, (db, rows) => {
  db.createList(db.root, 'vectors');
  for (const row of rows) db.root.vectors.push(row);
});

console.log('B"H packed_features_index_vector_test PASS');
