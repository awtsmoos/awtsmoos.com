// B"H

/**
 * @file deep_turbo_ai_test.js
 * @chapter Deep Rooms, Ordered Keys, And A Small Lamp Of Embedding
 * @description Stress test for deep turbo records, paged keys, searching, AI load.
 */

const fs = require('fs');
const assert = (cond, msg) => { if (!cond) throw new Error(msg); };
const AwtsmoosDB = require('../index.js');
const TempDbPath = require('./lightning/fastSuites/tempDb.js');

function deepDoc(id) {
  let node = { id, text: `awtsmoos nested searchable phrase ${id}`, items: [] };
  let cursor = node;
  for (let i = 0; i < 10; i++) {
    const next = {
      level: i,
      label: `level-${i}-${id}`,
      items: [],
      arr: Array.from({ length: 8 }, (_, j) => ({ j, note: `spark-${id}-${i}-${j}` })),
      child: null
    };
    cursor.items.push(next);
    cursor.child = next;
    cursor = next;
  }
  return node;
}

function findText(value, needle) {
  if (value == null) return false;
  if (typeof value === 'string') return value.includes(needle);
  if (Array.isArray(value)) return value.some(v => findText(v, needle));
  if (typeof value === 'object') return Object.keys(value).some(k => findText(value[k], needle));
  return false;
}

function fakeGguf(file) {
  const b = Buffer.alloc(24);
  b.write('GGUF', 0);
  b.writeUInt32LE(3, 4);
  b.writeBigUInt64LE(0n, 8);
  b.writeBigUInt64LE(0n, 16);
  fs.writeFileSync(file, b);
}

module.exports = (async () => {
  const dbPath = TempDbPath.make('deep_turbo_ai');
  TempDbPath.remove(dbPath);
  const modelPath = `${dbPath}.fake.gguf`;
  fakeGguf(modelPath);

  let db = new AwtsmoosDB(dbPath, { compression: true, turboWrites: true, turboCompactMs: 20 });
  db.open();

  const order = Array.from({ length: 80 }, (_, i) => i).sort((a, b) => ((a * 37) % 80) - ((b * 37) % 80));
  for (const i of order) db.root[`doc_${String(i).padStart(3, '0')}`] = deepDoc(i);

  assert(db.keys(db.root, { offset: 10, limit: 5 }).length === 5, 'paged keys length');
  const asc = db.keys(db.root, { offset: 0, limit: 3, order: 'asc' });
  assert(asc[0] <= asc[1] && asc[1] <= asc[2], 'ascending key order');

  const hits = [];
  for (const key of db.keys(db.root, { offset: 0, limit: 80, order: 'asc' })) {
    const value = db.root[key];
    if (findText(value, 'spark-42-9-7')) hits.push(key);
  }
  assert(hits.includes('doc_042'), 'deep search through nested turbo docs');

  const manifest = await db.ai.load(modelPath, { name: 'fake-bge' });
  assert(manifest.gguf.tensorCount === 0, 'local GGUF metadata parsed');

  const hf = db.ai.loader.resolve('https://huggingface.co/ggml-org/bge-small-en-v1.5-Q8_0-GGUF/tree/main', {
    file: 'bge-small-en-v1.5-q8_0.gguf'
  });
  assert(hf.downloadUrl.includes('/resolve/main/'), 'huggingface tree URL resolves to direct file');

  let refusedFakeEmbedding = false;
  try {
    db.ai.embed('Awtsmoos searchable embedding text', { dimensions: 32 });
  } catch (_err) {
    refusedFakeEmbedding = true;
  }
  assert(refusedFakeEmbedding, 'embedding refuses fake vectors without real model');

  db.waitForIdle();
  db.turbo.compactOverlay();
  assert(fs.existsSync(`${dbPath}.turbo.tree.json`), 'deep stress compacts turbo tree');

  db.close();

  db = new AwtsmoosDB(dbPath, { compression: true, turboWrites: true });
  db.open();
  assert(findText(db.root.doc_042, 'spark-42-9-7'), 'deep doc persists through compacted turbo tree');
  let refusedAfterReopen = false;
  try {
    db.ai.embed('same text', { dimensions: 16 });
  } catch (_err) {
    refusedAfterReopen = true;
  }
  assert(refusedAfterReopen, 'embedding still refuses fake vectors after reopen');
  assert(db.DosDB.methods().includes('importPath'), 'native DosDB bridge exposes migration methods');

  db.close();
  TempDbPath.remove(dbPath);
  fs.rmSync(modelPath, { force: true });

  console.log('B"H deep_turbo_ai_test PASS');
})();
