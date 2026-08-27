// B"H

/**
 * @file concurrent_text_test.js
 * @chapter One Hundred Pens On Different Lines
 * @description Tests async range/path coordination and chunked text reads.
 */

const assert = (cond, msg) => { if (!cond) throw new Error(msg); };
const AwtsmoosDB = require('../index.js');
const TempDbPath = require('./lightning/fastSuites/tempDb.js');

module.exports = (async () => {
  const dbPath = TempDbPath.make('concurrent_text');
  TempDbPath.remove(dbPath);

  let db = new AwtsmoosDB(dbPath, { compression: false, reuseFreedSpace: 'verified' });
  db.open();

  let blob = db.blob.create(100 * 64, { name: 'lanes.bin' });
  const blobStart = Date.now();

  await Promise.all(Array.from({ length: 100 }, (_, i) => {
    const data = Buffer.alloc(64, i);
    return db.blob.writeAsync(blob, i * 64, data);
  }));

  const blobElapsed = Date.now() - blobStart;
  for (let i = 0; i < 100; i++) {
    const got = db.blob.read(blob, i * 64, 64);
    assert(got.every(b => b === i), `blob lane ${i} roundtrip first=${got[0]} second=${got[1]}`);
  }
  assert(blobElapsed < 250, `100 non-overlap blob writes too slow: ${blobElapsed}ms`);

  db.root.rows = {};
  const pathStart = Date.now();

  await Promise.all(Array.from({ length: 100 }, (_, i) => (
    db.concurrent.writePath(['rows', `k${i}`], { value: i })
  )));

  const pathElapsed = Date.now() - pathStart;
  for (let i = 0; i < 100; i++) {
    assert(db.root.rows[`k${i}`].value === i, `path write ${i} roundtrip`);
  }
  assert(pathElapsed < 1200, `100 non-overlap path writes too slow: ${pathElapsed}ms`);

  const source = 'A'.repeat(4096) + 'middle-BH' + 'Z'.repeat(4096);
  let book = db.text.create(source, { chunkChars: 1024 });
  assert(db.text.substring(book, 4096, 4105) === 'middle-BH', 'text substring across chunks');

  let streamed = '';
  for await (const chunk of db.text.stream(book, { start: 4096, end: 4105 })) {
    streamed += chunk;
  }
  assert(streamed === 'middle-BH', 'text stream range');

  book = db.text.append(book, 'TAIL');
  assert(db.text.substring(book, book.chars - 4, book.chars) === 'TAIL', 'text append');

  db.root.book = book;
  db.root.blob = blob;
  db.close();

  db = new AwtsmoosDB(dbPath, { compression: false, reuseFreedSpace: 'verified' });
  db.open();

  book = db.root.book;
  blob = db.root.blob;
  assert(db.text.substring(book, 4096, 4105) === 'middle-BH', 'persisted text substring');
  assert(db.blob.read(blob, 64 * 42, 64).every(b => b === 42), 'persisted concurrent blob range');

  db.close();
  TempDbPath.remove(dbPath);

  console.log('B"H concurrent_text_test PASS');
})();
