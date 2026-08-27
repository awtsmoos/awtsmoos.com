// B"H

/**
 * @file turbo_writebehind_test.js
 * @chapter A Thousand Pens Before The Chisel Falls
 * @description Tests sync-looking ordinary assignments through write-behind.
 */

const assert = (cond, msg) => { if (!cond) throw new Error(msg); };
const fs = require('fs');
const AwtsmoosDB = require('../index.js');
const TempDbPath = require('./lightning/fastSuites/tempDb.js');

module.exports = (async () => {
  const dbPath = TempDbPath.make('turbo_writebehind');
  TempDbPath.remove(dbPath);

  let db = new AwtsmoosDB(dbPath, { compression: false, turboWrites: true, turboCompactMs: 20 });
  db.open();

  const start = Date.now();

  await Promise.all(Array.from({ length: 1000 }, (_, i) => Promise.resolve().then(() => {
    db.root[`k${i}`] = i;
  })));

  const enqueueMs = Date.now() - start;

  for (let i = 0; i < 1000; i++) {
    assert(db.root[`k${i}`] === i, `overlay read ${i}`);
  }

  assert('k2' in db.root, 'overlay has should see pending key');
  assert(Object.keys(db.root).includes('k2'), 'overlay keys should include pending key');

  db.root.set('viaSet', 770);
  assert(db.root.viaSet === 770, 'method set should capture turbo value');

  delete db.root.k2;
  assert(!('k2' in db.root), 'overlay delete should hide key');
  assert(db.root.k2 === undefined, 'overlay delete should read missing');

  assert(enqueueMs < 250, `1000 turbo writes should enqueue fast: ${enqueueMs}ms`);
  await new Promise(resolve => setTimeout(resolve, 30));
  assert(fs.existsSync(`${dbPath}.turbo.json`), 'auto debounce should persist sidecar without close');
  await new Promise(resolve => setTimeout(resolve, 40));
  assert(fs.existsSync(`${dbPath}.turbo.tree.json`), 'background compaction should create COW turbo tree');
  assert(db.turbo.durable.size === 0, 'background compaction should clear durable delta after snapshot');
  db.close();

  db = new AwtsmoosDB(dbPath, { compression: false, turboWrites: true, turboCompactMs: 20 });
  db.open();

  for (let i = 0; i < 1000; i++) {
    const value = db.root[`k${i}`];
    const plain = value && value.__resolve__ ? value.__resolve__() : value;
    if (i === 2) {
      assert(plain === undefined, 'persisted turbo delete');
    } else {
      assert(plain === i, `persisted turbo write ${i}`);
    }
  }
  assert(db.root.viaSet === 770, 'persisted method set turbo value');
  assert(Object.keys(db.root).includes('viaSet'), 'persisted overlay keys');

  db.close();
  TempDbPath.remove(dbPath);

  console.log('B"H turbo_writebehind_test PASS');
})();
