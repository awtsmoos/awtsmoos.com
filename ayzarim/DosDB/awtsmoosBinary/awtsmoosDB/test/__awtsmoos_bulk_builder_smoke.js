// B"H
const fs = require('fs');
const path = require('path');
const assert = require('assert');
const DB = require('../index.js');
const constants = require('../constants.js');

const file = path.join(__dirname, '__awtsmoos_bulk_builder_smoke.awtsdb');
for (const suffix of ['', '.wal', '.lock', '.sparse.json', '.turbo.json', '.turbo.log', '.turbo.tree.json']) {
  fs.rmSync(file + suffix, { force: true, recursive: true });
}

const db = new DB(file, { wal: false, compression: false, turboWrites: false });
db.open();
try {
  const DictionaryEngine = require('../structure/dictionary/index.js');
  const StableAnchor = require('../structure/anchor/stable.js');

  const entries = [];
  for (let i = 0; i < 450; i++) {
    const key = `k${String(i).padStart(4, '0')}`;
    const valuePtr = db.builder.build({ i, key });
    entries.push({ key, value: valuePtr });
  }

  const engine = new DictionaryEngine(db.allocator);
  const dictSeal = engine.bulkLoadEntries(entries);
  const anchor = new StableAnchor(db);
  const anchorSeal = anchor.create(constants.VAL_TYPE.DICTIONARY, dictSeal);
  db.root[constants.SYMBOLS.INTERNALS].writer.set('bulk', anchorSeal, { isPtr: true, skipFree: true, assumeNew: true });
  db.waitForIdle();
  db.close();

  const db2 = new DB(file, { wal: false, compression: false, turboWrites: false });
  db2.open();
  try {
    assert.strictEqual(db2.root.bulk.k0000.i, 0);
    assert.strictEqual(db2.root.bulk.k0200.i, 200);
    assert.strictEqual(db2.root.bulk.k0449.i, 449);
    const keys = db2.keys(db2.root.bulk);
    assert.strictEqual(keys.length, 450);
    assert.strictEqual(keys[0], 'k0000');
    assert.strictEqual(keys[449], 'k0449');
  } finally {
    db2.close();
  }
} finally {
  try { db.close(); } catch (_err) {}
}
console.log('B"H bulk builder smoke PASS');
