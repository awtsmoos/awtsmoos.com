// B"H

/**
 * @file test/migration_density_test.js
 * @chapter The Migration That Refused To Become A Palace
 * @description
 * Simulates the earlier migration nightmare: many tiny account records that
 * used to explode into structure overhead. The array should remain one compact
 * packed vessel with inline packed account objects, with physical file size
 * tightly tracking the encoded payload instead of Sequence/Dictionary cities.
 */

const fs = require('fs');
const assert = require('assert');
const AwtsmoosDB = require('../index.js');
const ArrayCodec = require('../api/packed/arrayCodec.js');

const dbPath = __dirname + '/__migration_density_test.awtsdb';

function clean() {
  for (const suffix of ['', '.wal', '.lock', '.txn.json', '.sparse.json']) {
    try { fs.rmSync(dbPath + suffix, { force: true }); } catch (_err) {}
  }
}

function account(i) {
  return {
    id: i,
    bal: i % 100,
    ac: true,
    r: i % 3,
    s: 'o'
  };
}

function buildAccounts(count) {
  const accounts = [];
  let jsonBytes = 0;

  for (let i = 0; i < count; i++) {
    const row = account(i);
    accounts.push(row);
    jsonBytes += Buffer.byteLength(JSON.stringify(row));
  }

  return { accounts, jsonBytes };
}

function measure(count) {
  clean();

  const db = new AwtsmoosDB(dbPath, {
    wal: false,
    compression: false
  });
  db.open();

  const { accounts, jsonBytes } = buildAccounts(count);
  const packedArray = ArrayCodec.tryEncodeDense(accounts, db.builder.scribe);
  assert(packedArray, `account migration fixture of ${count} rows must fit packed-array vessel`);

  db.root.accounts = accounts;
  assert.strictEqual(db.root.accounts.length, count, 'packed account array length');
  assert.strictEqual(db.root.accounts[0].id, 0, 'first account lookup');
  assert.strictEqual(db.root.accounts[count - 1].id, count - 1, 'last account lookup');

  db.close();

  const physicalBytes = fs.statSync(dbPath).size;

  const reopened = new AwtsmoosDB(dbPath, {
    wal: false,
    compression: false
  });
  reopened.open();
  assert.strictEqual(reopened.root.accounts.length, count, 'reopened packed account array length');
  assert.strictEqual(reopened.root.accounts[count - 1].bal, (count - 1) % 100, 'reopened last account');
  reopened.close();

  clean();

  return {
    count,
    jsonBytes,
    packedBytes: packedArray.length,
    physicalBytes
  };
}

for (const count of [500, 2000]) {
  const result = measure(count);

  assert(
    result.physicalBytes < result.jsonBytes,
    `migration DB should beat raw JSON bytes for ${count} accounts: physical=${result.physicalBytes}, json=${result.jsonBytes}`
  );

  assert(
    result.physicalBytes <= result.packedBytes + 768,
    `migration overhead should stay tiny for ${count} accounts: physical=${result.physicalBytes}, packed=${result.packedBytes}`
  );

  assert(
    result.physicalBytes / result.packedBytes < 1.03,
    `migration file should track packed payload closely for ${count} accounts: ${JSON.stringify(result)}`
  );
}

console.log('B"H migration_density_test PASS');
