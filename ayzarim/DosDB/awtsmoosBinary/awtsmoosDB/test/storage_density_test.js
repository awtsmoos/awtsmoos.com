// B"H

/**
 * @file storage_density_test.js
 * @chapter The Scale Where Bytes Refuse To Lie
 * @description
 * Measures entered text and binary payloads against the final physical file.
 * The Awtsmoos gives every byte its exact dwelling: no 64KB shadow palace, no
 * blank pointer wilderness, and compression only when it truly contracts.
 */

const assert = (cond, msg) => { if (!cond) throw new Error(msg); };

const fs = require('fs');
const AwtsmoosDB = require('../index.js');
const TempDbPath = require('./lightning/fastSuites/tempDb.js');

/**
 * @function resolve
 * @description Resolves live handles into plain values when needed.
 * @param {*} value - Possible live handle.
 * @returns {*} Plain value.
 */
function resolve(value) {
  return value && value.__resolve__ ? value.__resolve__() : value;
}

/**
 * @function makePattern
 * @description Creates a repeated binary pattern for compression proof.
 * @param {number} length - Buffer length.
 * @param {number} span - Repeating byte span.
 * @returns {Buffer} Pattern buffer.
 */
function makePattern(length, span) {
  const buf = Buffer.allocUnsafe(length);

  for (let i = 0; i < length; i++) {
    buf[i] = i % span;
  }

  return buf;
}

/**
 * @function measure
 * @description Runs one DB write scenario and returns byte stats.
 * @param {string} name - Scenario name.
 * @param {object} options - DB options.
 * @param {Function} fill - Write callback.
 * @returns {object} Measurement result.
 */
function measure(name, options, fill) {
  const dbPath = TempDbPath.make(name);
  TempDbPath.remove(dbPath);

  const db = new AwtsmoosDB(dbPath, options);
  db.open();

  const payloadBytes = fill(db);
  const logicalBytes = db.allocator.cursor;
  const beforeClose = db.storageStats();

  db.close();

  const physicalBytes = fs.statSync(dbPath).size;
  TempDbPath.remove(dbPath);

  return {
    payloadBytes,
    logicalBytes,
    physicalBytes,
    beforeClose
  };
}

/**
 * @function testExactFlush
 * @description Proves disk size follows the real cursor, not RAM mirror size.
 * @returns {void}
 */
function testExactFlush() {
  const text = 'density-proof:'.repeat(19);
  const binary = makePattern(333, 251);
  const payload = Buffer.byteLength(text, 'utf8') + binary.length;

  const result = measure('density_exact', { compression: false }, db => {
    db.root.text = text;
    db.root.binary = binary;

    assert(resolve(db.root.text) === text, 'uncompressed text roundtrip');
    assert(Buffer.compare(resolve(db.root.binary), binary) === 0, 'uncompressed binary roundtrip');

    return payload;
  });

  assert(
    result.physicalBytes === result.logicalBytes,
    `physical bytes must equal logical cursor: physical=${result.physicalBytes}, logical=${result.logicalBytes}`
  );

  assert(
    result.physicalBytes < 4096,
    `small payload should not flush a padded block: physical=${result.physicalBytes}`
  );

  assert(
    result.physicalBytes - result.payloadBytes < 1600,
    `small payload overhead too high: physical=${result.physicalBytes}, payload=${result.payloadBytes}`
  );
}

/**
 * @function testCompressionDensity
 * @description Proves text, Buffer, ArrayBuffer, and typed array compression.
 * @returns {void}
 */
function testCompressionDensity() {
  const text = 'B"H '.repeat(4096) + 'awtsmoos '.repeat(4096);
  const binary = makePattern(8192, 64);
  const arrayBuffer = Uint8Array.from(makePattern(4096, 17)).buffer;
  const typed = new Uint8Array(makePattern(4096, 11));
  const payload =
    Buffer.byteLength(text, 'utf8') +
    binary.length +
    arrayBuffer.byteLength +
    typed.byteLength;

  const result = measure('density_compressed', { compression: true }, db => {
    db.root.text = text;
    db.root.binary = binary;
    db.root.arrayBuffer = arrayBuffer;
    db.root.typed = typed;

    assert(resolve(db.root.text) === text, 'compressed text roundtrip');
    assert(Buffer.compare(resolve(db.root.binary), binary) === 0, 'compressed Buffer roundtrip');
    assert(resolve(db.root.arrayBuffer).byteLength === arrayBuffer.byteLength, 'compressed ArrayBuffer size');
    assert(resolve(db.root.typed).length === typed.length, 'compressed typed array size');

    return payload;
  });

  assert(
    result.beforeClose.compressedWrites >= 3,
    `expected repeated text/binary vessels to compress, got ${result.beforeClose.compressedWrites}`
  );

  assert(
    result.physicalBytes === result.logicalBytes,
    `compressed physical bytes must equal logical cursor: physical=${result.physicalBytes}, logical=${result.logicalBytes}`
  );

  assert(
    result.physicalBytes < result.payloadBytes / 2,
    `compressed DB too large: physical=${result.physicalBytes}, payload=${result.payloadBytes}, stats=${JSON.stringify(result.beforeClose)}`
  );
}

testExactFlush();
testCompressionDensity();

console.log('B"H storage_density_test PASS');
