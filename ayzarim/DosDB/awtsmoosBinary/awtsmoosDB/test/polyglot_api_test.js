// B"H

/**
 * @file polyglot_api_test.js
 * @chapter Many Tongues, One File
 * @description Verifies SQL, PostgreSQL-flavored params, Mongo calls, and
 * Firebase-style refs all write real AwtsmoosDB data.
 */

const assert = (cond, msg) => { if (!cond) throw new Error(msg); };
const AwtsmoosDB = require('../index.js');
const TempDbPath = require('./lightning/fastSuites/tempDb.js');

module.exports = (() => {
  const dbPath = TempDbPath.make('polyglot_api');
  TempDbPath.remove(dbPath);

  let db = new AwtsmoosDB(dbPath, { turboWrites: true, compression: true });
  db.open();

  db.sql('CREATE TABLE sparks (name, level)');
  db.sql('INSERT INTO sparks (name, level) VALUES (??, ??)', ['awtsmoos', 10]);
  db.postgres('INSERT INTO sparks (name, level) VALUES ($1, $2)', ['sql', 7]);
  db.table('sparks').insert({ name: 'direct', level: 8 });
  const rows = db.sql('SELECT name, level FROM sparks WHERE level > ?? ORDER BY level DESC LIMIT 2', [6]);
  assert(rows.length === 2 && rows[0].level === 10, 'sql/postgres rows query');
  assert(db.table('sparks').select({ where: { key: 'level', op: '>', value: 7 } }).length === 2, 'direct table matches sql data');

  const gqlInsert = db.graphql('mutation { insertSpark(table: "sparks", row: { name: "graphql", level: 11 }) { name level } }');
  assert(gqlInsert.data.insertSpark.level === 11, 'graphql mutation insert');
  const gqlRows = db.graphql('{ sparks(where: { level: 11 }) { name level } }');
  assert(gqlRows.data.sparks[0].name === 'graphql', 'graphql query select');

  const souls = db.mongo.collection('souls');
  souls.insertMany([{ name: 'one', count: 1 }, { name: 'two', count: 2 }]);
  souls.updateOne({ name: 'two' }, { $inc: { count: 3 } });
  assert(souls.findOne({ count: { $gt: 4 } }).name === 'two', 'mongo update/find');

  const ref = db.ayshyesod.ref('rooms/first');
  ref.set({ light: 1 });
  ref.update({ light: 2, vessel: true });
  assert(db.firebase.ref('rooms/first').get().light === 2, 'firebase ref get/update');

  db.waitForIdle();
  db.close();

  db = new AwtsmoosDB(dbPath, { turboWrites: true, compression: true });
  db.open();
  assert(db.sql('SELECT name FROM sparks WHERE level = ??', [10])[0].name === 'awtsmoos', 'sql persists');
  assert(db.graphql('{ sparks(where: { level: 11 }) { name } }').data.sparks[0].name === 'graphql', 'graphql persists');
  assert(db.mongo.collection('souls').findOne({ name: 'two' }).count === 5, 'mongo persists');
  assert(db.firebase.ref('rooms/first').get().vessel === true, 'firebase persists');
  db.close();

  TempDbPath.remove(dbPath);
  console.log('B"H polyglot_api_test PASS');
})();
