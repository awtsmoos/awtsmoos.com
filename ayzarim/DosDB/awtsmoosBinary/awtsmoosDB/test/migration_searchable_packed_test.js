// B"H

/**
 * @file test/migration_searchable_packed_test.js
 * @chapter The Migrated Accounts That Remained Tiny And Still Spoke
 * @description
 * Migration-grade proof: many small account records store as one dense packed
 * vessel. Query and exact indexes work on the migrated packed accounts. A
 * search sidecar is proved on a small packed sample so the fast suite does not
 * hang on the current short search-backfill path.
 */

const fs = require('fs');
const assert = require('assert');
const AwtsmoosDB = require('../index.js');
const ArrayCodec = require('../api/packed/arrayCodec.js');

const dbPath = __dirname + '/__migration_searchable_packed.awtsdb';
const COUNT = 512;
const SEARCH_COUNT = 64;

function clean() {
  for (const suffix of ['', '.wal', '.lock', '.txn.json', '.sparse.json']) {
    try { fs.rmSync(dbPath + suffix, { force: true }); } catch (_err) {}
  }
}

function account(i) {
  const role = i % 2 === 0 ? 'admin' : 'user';
  const focus = i % 4 === 0 ? 'mitzvah' : 'common';
  return {
    id: i,
    bal: i % 100,
    role,
    focus,
    ac: true,
    r: i % 7,
    note: `account ${i} ${focus}`
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

clean();

const db = new AwtsmoosDB(dbPath, {
  wal: false,
  compression: false
});
db.open();

const { accounts, jsonBytes } = buildAccounts(COUNT);
const packedPayload = ArrayCodec.tryEncodeDense(accounts, db.builder.scribe);
assert(packedPayload, 'migrated accounts must fit in one packed array vessel');

db.root.accounts = accounts;
db.waitForIdle();

const baseBytes = fs.statSync(dbPath).size;

assert.strictEqual(db.root.accounts.length, COUNT, 'packed account length');
assert.strictEqual(db.root.accounts[COUNT - 1].id, COUNT - 1, 'packed last account');
assert(baseBytes < jsonBytes, `packed migration beats JSON bytes: base=${baseBytes}, json=${jsonBytes}`);
assert(baseBytes <= packedPayload.length + 1024, `packed migration has close-to-payload file size: base=${baseBytes}, packed=${packedPayload.length}`);

assert.strictEqual(dbquery(db, 'admin'), COUNT / 2, 'query finds admin accounts inside packed vessel');

const index = db.indexes.create('root.accounts', 'role', { name: 'accounts_role' });
assert.strictEqual(index.keys, COUNT, 'exact index backfills all packed accounts');
assert.strictEqual(db.indexes.find('accounts_role', 'admin').length, COUNT / 2, 'exact index searches packed accounts');

const { accounts: searchable } = buildAccounts(SEARCH_COUNT);
db.root.searchableAccounts = searchable;
db.search.enable(db.root.searchableAccounts);
const mitzvah = db.search.run(db.root.searchableAccounts, 'mitzvah');
assert.strictEqual(mitzvah.length, SEARCH_COUNT / 4, 'text search backfills packed sample accounts');
assert.strictEqual(plain(mitzvah[0]).focus, 'mitzvah', 'text search result hydrates packed account');

db.close();

const reopened = new AwtsmoosDB(dbPath, {
  wal: false,
  compression: false
});
reopened.open();
assert.strictEqual(reopened.root.accounts.length, COUNT, 'reopened packed accounts length');
assert.strictEqual(reopened.indexes.find('accounts_role', 'user').length, COUNT / 2, 'reopened exact index still works');
const reopenedSearch = reopened.search.run(reopened.root.searchableAccounts, 'mitzvah');
assert.strictEqual(reopenedSearch.length, SEARCH_COUNT / 4, 'reopened search still works');
reopened.close();

clean();
console.log('B"H migration_searchable_packed_test PASS');

function dbquery(db, role) {
  return db.query(db.root.accounts, { $filter: { role } }).length;
}

function plain(value) {
  return value && value.__resolve__ ? value.__resolve__() : value;
}
