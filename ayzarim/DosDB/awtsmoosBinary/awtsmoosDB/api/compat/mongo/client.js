// B"H — MongoDB-compatible MongoClient for the AwtsmoosDB compat layer.
//
// Migration is import-swap: replace
//   const { MongoClient } = require('mongodb');
// with
//   const { MongoClient } = require('<awtsmoosDB>/api/compat/mongo');
// and point the URL at an AwtsmoosDB file:
//   const client = new MongoClient('awtsmoos:///tmp/mymongo.awtsdb');
//   await client.connect();
//   const coll = client.db('mydb').collection('users');
// Everything after that is the real MongoDB driver API.
'use strict';
const path = require('path');
const { Db } = require('./db');

function resolveDbPath(url, options) {
  if (typeof url === 'string' && url.slice(0, 11) === 'awtsmoos://') {
    return url.slice(11) || './awtsmoos-mongo.awtsdb';
  }
  if (options && typeof options.dbPath === 'string') return options.dbPath;
  if (options && typeof options.awtDbPath === 'string') return options.awtDbPath;
  // Fall back to a default file next to the current working directory.
  return path.resolve(process.cwd(), 'awtsmoos-mongo.awtsdb');
}

class MongoClient {
  constructor(url, options) {
    this._url = url;
    this._options = options || {};
    this._dbPath = resolveDbPath(url, this._options);
    this._awtDb = null;
  }

  get dbPath() { return this._dbPath; }

  async connect() {
    if (this._awtDb) return this;
    // Relative to awtsmoosDB/api/compat/mongo/ -> awtsmoosDB/index.js
    const AwtsmoosDB = require('../../../index.js');
    const awtOpts = (this._options && this._options.awtOpts) || { compression: false };
    this._awtDb = new AwtsmoosDB(this._dbPath, awtOpts);
    this._awtDb.open();
    return this;
  }

  db(dbName) {
    return new Db(this, dbName || 'test');
  }

  async close() {
    if (this._awtDb) {
      try {
        if (typeof this._awtDb.flush === 'function') this._awtDb.flush();
      } catch (e) { /* best effort durability checkpoint */ }
      try { this._awtDb.close(); } catch (e) { /* already closed */ }
      this._awtDb = null;
    }
  }
}

module.exports = { MongoClient };
