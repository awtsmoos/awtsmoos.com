// B"H

/**
 * @file storage_reuse_test.js
 * @chapter The Gaps Return To Service
 * @description
 * Tests the places where binary databases quietly gain weight: method-name
 * collisions, incompressible data, deleted middle ranges, and tail ranges that
 * should vanish from the final file like a spoken letter returning to silence.
 */

const assert = (cond, msg) => { if (!cond) throw new Error(msg); };

const fs = require('fs');
const AwtsmoosDB = require('../index.js');
const Pointer = require('../utils/pointer/crown.js');
const Omni = require('../utils/compression/omni.js');
const TempDbPath = require('./lightning/fastSuites/tempDb.js');

/**
 * @function resolve
 * @description Resolves a live scalar handle when needed.
 * @param {*} value - Possible handle.
 * @returns {*} Plain value.
 */
function resolve(value) {
  return value && value.__resolve__ ? value.__resolve__() : value;
}

/**
 * @function makeIncompressible
 * @description Creates deterministic high-entropy-ish bytes.
 * @param {number} size - Byte length.
 * @returns {Buffer} Bytes that should not compress well.
 */
function makeIncompressible(size) {
  const buf = Buffer.allocUnsafe(size);
  let x = 0x12345678;

  for (let i = 0; i < size; i++) {
    x ^= x << 13;
    x ^= x >>> 17;
    x ^= x << 5;
    buf[i] = x & 0xff;
  }

  return buf;
}

/**
 * @function withDb
 * @description Opens a temporary database for one test body.
 * @param {string} name - DB name.
 * @param {object} options - DB options.
 * @param {Function} fn - Test body.
 * @returns {*} Test body result.
 */
function withDb(name, options, fn) {
  const dbPath = TempDbPath.make(name);
  TempDbPath.remove(dbPath);

  const db = new AwtsmoosDB(dbPath, options);
  db.open();

  try {
    return fn(db, dbPath);
  } finally {
    db.close();
    TempDbPath.remove(dbPath);
  }
}

/**
 * @function testPointerVarints
 * @description Verifies small pointers stay tiny and large lengths grow only as needed.
 * @returns {void}
 */
function testPointerVarints() {
  assert(Pointer.encode(5, 64, 1).length === 3, 'small pointer should be 3 bytes');
  assert(Pointer.encode(5, 128, 127).length === 4, 'offset 128 should add one varint byte');
  assert(Pointer.encode(5, 64, 16384).length === 5, 'large length should add only needed varint bytes');
}

/**
 * @function testCompressionBackoff
 * @description Ensures incompressible data remains raw.
 * @returns {void}
 */
function testCompressionBackoff() {
  const noisy = makeIncompressible(4096);
  const packed = Omni.packBinary(noisy);

  assert(!packed.compressed, 'incompressible binary should not be force-compressed');
  assert(packed.buffer.length === noisy.length, 'raw backoff should store exact input bytes');
  assert(Buffer.compare(Omni.unpackBuffer(packed.buffer), noisy) === 0, 'raw backoff roundtrip');
}

/**
 * @function testMethodNameCollisions
 * @description Stored keys named like helper methods must read as data.
 * @returns {void}
 */
function testMethodNameCollisions() {
  withDb('method_collision', { compression: false }, db => {
    db.root.set = 'stored set key';
    db.root.get = 'stored get key';
    db.root.delete = 'stored delete key';
    db.root.keys = 'stored keys key';

    assert(resolve(db.root.set) === 'stored set key', '.set property should be data when stored');
    assert(resolve(db.root.get) === 'stored get key', '.get property should be data when stored');
    assert(resolve(db.root.delete) === 'stored delete key', '.delete property should be data when stored');
    assert(resolve(db.root.keys) === 'stored keys key', '.keys property should be data when stored');

    assert(db.get('set') === 'stored set key', 'db.get should still read stored method-name keys');
  });
}

/**
 * @function testMiddleGapReuse
 * @description Deletes a middle value and proves a same-sized refill avoids a huge grow.
 * @returns {void}
 */
function testMiddleGapReuse() {
  withDb('middle_reuse', { compression: false }, db => {
    db.root.a = Buffer.alloc(8192, 1);
    db.root.b = Buffer.alloc(8192, 2);
    db.root.c = Buffer.alloc(8192, 3);

    const afterFill = db.storageStats().logicalBytes;
    delete db.root.b;
    const afterDelete = db.storageStats().logicalBytes;

    db.root.d = Buffer.alloc(8192, 4);
    const afterRefill = db.storageStats().logicalBytes;

    assert(Buffer.compare(resolve(db.root.d), Buffer.alloc(8192, 4)) === 0, 'refilled value roundtrip');
    assert(afterDelete >= afterFill - 8192, 'delete should not corrupt logical cursor');
    assert(
      afterRefill - afterDelete < 4096,
      `middle refill should reuse freed payload bytes, growth=${afterRefill - afterDelete}`
    );
  });
}

/**
 * @function testTailTruncation
 * @description Frees an end allocation and proves close truncates to the cursor.
 * @returns {void}
 */
function testTailTruncation() {
  withDb('tail_truncate', { compression: false }, (db, dbPath) => {
    const before = db.storageStats().logicalBytes;
    const loc = db.allocator.allocate(12000);

    db.pager.writeExact(loc.offset, Buffer.alloc(12000, 7));
    assert(db.storageStats().logicalBytes === before + 12000, 'tail allocation should grow cursor');

    db.allocator.free(loc.offset, loc.length);
    assert(db.storageStats().logicalBytes === before, 'tail free should retract cursor instantly');

    db.close();
    assert(fs.statSync(dbPath).size === before, 'physical file should truncate to logical cursor');
    db.open();
  });
}

testPointerVarints();
testCompressionBackoff();
testMethodNameCollisions();
testMiddleGapReuse();
testTailTruncation();

console.log('B"H storage_reuse_test PASS');
