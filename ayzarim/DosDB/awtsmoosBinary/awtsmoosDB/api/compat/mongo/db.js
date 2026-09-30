// B"H — MongoDB-compatible Db for the AwtsmoosDB compat layer.
'use strict';
const { Collection } = require('./collection');
const store = require('./store');

class Db {
  constructor(client, name) {
    this._client = client;
    this.databaseName = String(name || 'test');
  }

  collection(name) {
    return new Collection(this, name);
  }

  async createCollection(name) {
    const awt = this._client._awtDb;
    store.withBatch(awt, () => {
      store.ensureCollectionListed(awt, this.databaseName, String(name));
    });
    return this.collection(name);
  }

  async dropCollection(name) {
    return this.collection(name).drop();
  }

  listCollections() {
    const names = store.listCollections(this._client._awtDb, this.databaseName);
    const arr = names.map(n => ({ name: n, type: 'collection', options: {} }));
    // Minimal cursor shape: the real driver returns a ListCollectionsCursor.
    return {
      toArray: async () => arr.slice(),
      next: async () => (arr.length ? arr.shift() : null),
    };
  }

  async dropDatabase() {
    const awt = this._client._awtDb;
    const dbName = this.databaseName;
    await store.withBatch(awt, () => {
      const colls = store.listCollections(awt, dbName);
      for (let c = 0; c < colls.length; c++) {
        const b = store.base(dbName, colls[c]);
        const meta = store.getMeta(awt, b);
        const skeys = store.listStorageKeys(awt, b);
        for (let i = 0; i < skeys.length; i++) store.deleteDoc(awt, b, skeys[i]);
        for (let i = 0; i < meta.idChunks; i++) store.deleteKey(awt, store.idsKey(b, i));
        store.deleteKey(awt, store.metaKey(b));
      }
      store.deleteKey(awt, store.collsKey(dbName));
    });
    return true;
  }
}

module.exports = { Db };
