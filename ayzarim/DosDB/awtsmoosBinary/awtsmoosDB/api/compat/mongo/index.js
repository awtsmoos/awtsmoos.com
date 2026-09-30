// B"H — AwtsmoosDB MongoDB compatibility layer.
// Drop-in API-compatible with the mongodb npm driver for the core CRUD surface.
// See README.md in this directory for usage and honest limitations.
'use strict';
const { MongoClient } = require('./client');
const { Db } = require('./db');
const { Collection, Cursor } = require('./collection');
const { ObjectId } = require('./objectid');

module.exports = {
  MongoClient,
  Db,
  Collection,
  Cursor,
  ObjectId,
};
