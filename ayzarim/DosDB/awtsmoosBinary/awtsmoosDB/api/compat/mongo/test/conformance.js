// B"H — Conformance test for the AwtsmoosDB MongoDB compat layer.
// Exercises every method and asserts real-driver-identical shapes/behavior.
// Run: node test/conformance.js   (from api/compat/mongo/)
'use strict';
const fs = require('fs');
const path = require('path');
const { MongoClient, ObjectId } = require('../index.js');
const { canon } = require('../aggregate.js');
const { deepEqual } = require('../filter.js');

const DBPATH = '/tmp/mongo-conform-' + process.pid + '.awtsdb';
try { fs.unlinkSync(DBPATH); } catch (e) {}

let passed = 0, failed = 0;
function ok(cond, name) {
  if (cond) { passed++; }
  else { failed++; console.log('FAIL: ' + name); }
}
function eq(a, b, name) {
  ok(deepEqual(a, b), name + ' :: got ' + canon(a) + ' want ' + canon(b));
}
async function throwsAsync(fn, name, wantCode) {
  try { await fn(); }
  catch (e) {
    ok(wantCode === undefined || e.code === wantCode, name + ' threw code=' + e.code);
    return;
  }
  ok(false, name + ' did not throw');
}

async function main() {
  // ---- ObjectId ----
  const id1 = new ObjectId();
  const id2 = new ObjectId();
  ok(id1.toHexString().length === 24, 'ObjectId hex length 24');
  ok(/^[0-9a-f]{24}$/.test(id1.toHexString()), 'ObjectId hex chars');
  ok(!id1.equals(id2), 'ObjectId uniqueness');
  ok(id1.equals(new ObjectId(id1.toHexString())), 'ObjectId round-trip equals');
  ok(ObjectId.createFromHexString(id1.toHexString()).equals(id1), 'createFromHexString');
  ok(id1.getTimestamp() instanceof Date, 'getTimestamp is Date');
  await throwsAsync(async () => new ObjectId('xyz'), 'ObjectId invalid throws');
  ok(String(id1) === id1.toHexString(), 'ObjectId toString');

  // ---- connect ----
  const client = new MongoClient('awtsmoos://' + DBPATH);
  await client.connect();
  const db = client.db('testdb');
  const users = db.collection('users');
  ok(users.collectionName === 'users', 'collectionName');
  ok(users.namespace === 'testdb.users', 'namespace');

  // ---- insertOne ----
  const r1 = await users.insertOne({ name: 'Alice', age: 30, tags: ['a', 'b'], address: { city: 'NYC' } });
  ok(r1.acknowledged === true, 'insertOne acknowledged');
  ok(r1.insertedId instanceof ObjectId, 'insertOne insertedId is ObjectId');

  const alice = await users.findOne({ _id: r1.insertedId });
  ok(alice !== null, 'findOne by _id found');
  eq(alice.name, 'Alice', 'findOne name');
  eq(alice.age, 30, 'findOne age');
  ok(alice._id.equals(r1.insertedId), 'findOne _id equals');
  eq(alice.address.city, 'NYC', 'nested doc preserved');
  eq(alice.tags, ['a', 'b'], 'array preserved');

  // explicit string _id
  const rStr = await users.insertOne({ _id: 'user-bob', name: 'Bob', age: 25 });
  eq(rStr.insertedId, 'user-bob', 'insertOne keeps string _id');

  // duplicate _id
  await throwsAsync(async () => users.insertOne({ _id: 'user-bob', name: 'Bob2' }), 'duplicate _id throws', 11000);

  // ---- insertMany ----
  const rm = await users.insertMany([
    { name: 'Carol', age: 35, address: { city: 'LA' } },
    { name: 'Dave', age: 40 },
    { name: 'Erin', age: 22, active: true },
  ]);
  ok(rm.acknowledged === true, 'insertMany acknowledged');
  eq(Object.keys(rm.insertedIds).length, 3, 'insertMany insertedIds count');
  ok(rm.insertedIds[0] instanceof ObjectId, 'insertMany insertedIds[0] ObjectId');

  // ---- find ----
  const all = await users.find({}).toArray();
  eq(all.length, 5, 'find({}) count');

  const over30 = await users.find({ age: { $gt: 30 } }).toArray();
  eq(over30.length, 2, 'find $gt');

  const gte = await users.find({ age: { $gte: 30 } }).toArray();
  eq(gte.length, 3, 'find $gte');

  const lt = await users.find({ age: { $lt: 30 } }).toArray();
  eq(lt.length, 2, 'find $lt');

  const inQ = await users.find({ name: { $in: ['Alice', 'Dave'] } }).toArray();
  eq(inQ.length, 2, 'find $in');

  const ninQ = await users.find({ age: { $nin: [30, 25] } }).toArray();
  eq(ninQ.length, 3, 'find $nin');

  const neQ = await users.find({ name: { $ne: 'Alice' } }).toArray();
  eq(neQ.length, 4, 'find $ne');

  const exQ = await users.find({ active: { $exists: true } }).toArray();
  eq(exQ.length, 1, 'find $exists true');

  const exQ2 = await users.find({ active: { $exists: false } }).toArray();
  eq(exQ2.length, 4, 'find $exists false');

  const andQ = await users.find({ $and: [{ age: { $gte: 30 } }, { name: { $ne: 'Alice' } }] }).toArray();
  eq(andQ.length, 2, 'find $and');

  const orQ = await users.find({ $or: [{ name: 'Alice' }, { name: 'Erin' }] }).toArray();
  eq(orQ.length, 2, 'find $or');

  const dotQ = await users.find({ 'address.city': 'NYC' }).toArray();
  eq(dotQ.length, 1, 'find dot-notation');

  const eqQ = await users.find({ age: { $eq: 30 } }).toArray();
  eq(eqQ.length, 1, 'find $eq');

  // ---- find options / cursor chaining ----
  const sorted = await users.find({}, { sort: { age: 1 } }).toArray();
  eq(sorted.map(d => d.age), [22, 25, 30, 35, 40], 'find sort asc');

  const sortedDesc = await users.find({}).sort({ age: -1 }).toArray();
  eq(sortedDesc.map(d => d.age), [40, 35, 30, 25, 22], 'cursor sort desc');

  const paged = await users.find({}).sort({ age: 1 }).skip(1).limit(2).toArray();
  eq(paged.map(d => d.age), [25, 30], 'cursor skip+limit');

  const proj = await users.find({ name: 'Alice' }, { projection: { name: 1, age: 1 } }).toArray();
  eq(proj.length, 1, 'projection count');
  eq(proj[0].name, 'Alice', 'projection include name');
  ok(proj[0]._id !== undefined, 'projection keeps _id by default');
  ok(proj[0].address === undefined, 'projection excludes address');

  const projEx = await users.find({ name: 'Alice' }).project({ age: 0 }).toArray();
  ok(projEx[0].age === undefined && projEx[0].name === 'Alice', 'projection exclusion');

  const projNoId = await users.find({ name: 'Alice' }).project({ _id: 0, name: 1 }).toArray();
  ok(projNoId[0]._id === undefined && projNoId[0].name === 'Alice', 'projection _id:0');

  // ---- updateOne ----
  const u1 = await users.updateOne({ name: 'Alice' }, { $set: { age: 31 } });
  eq(u1.acknowledged, true, 'updateOne acknowledged');
  eq(u1.matchedCount, 1, 'updateOne matchedCount');
  eq(u1.modifiedCount, 1, 'updateOne modifiedCount');
  eq((await users.findOne({ name: 'Alice' })).age, 31, 'updateOne $set applied');

  const u1b = await users.updateOne({ name: 'Alice' }, { $set: { age: 31 } });
  eq(u1b.modifiedCount, 0, 'updateOne no-op modifiedCount 0');
  eq(u1b.matchedCount, 1, 'updateOne no-op matchedCount 1');

  const u2 = await users.updateOne({ name: 'Bob' }, { $inc: { age: 1 }, $set: { 'address.city': 'SF' } });
  eq(u2.modifiedCount, 1, 'updateOne $inc+$set');
  const bob = await users.findOne({ name: 'Bob' });
  eq(bob.age, 26, '$inc applied');
  eq(bob.address.city, 'SF', '$set dot-notation');

  const u3 = await users.updateOne({ name: 'Bob' }, { $unset: { address: '' } });
  eq(u3.modifiedCount, 1, '$unset modified');
  ok((await users.findOne({ name: 'Bob' })).address === undefined, '$unset applied');

  const u4 = await users.updateOne({ name: 'Alice' }, { $push: { tags: 'c' } });
  eq((await users.findOne({ name: 'Alice' })).tags, ['a', 'b', 'c'], '$push applied');

  const u5 = await users.updateOne({ name: 'Nobody' }, { $set: { x: 1 } });
  eq(u5.matchedCount, 0, 'updateOne no match matchedCount 0');
  eq(u5.modifiedCount, 0, 'updateOne no match modifiedCount 0');

  // ---- updateMany ----
  const um = await users.updateMany({ age: { $gte: 30 } }, { $set: { senior: true } });
  eq(um.matchedCount, 3, 'updateMany matchedCount');
  eq(um.modifiedCount, 3, 'updateMany modifiedCount');
  eq(await users.countDocuments({ senior: true }), 3, 'updateMany applied');

  // ---- upsert ----
  const up = await users.updateOne({ name: 'Frank' }, { $set: { age: 50 } }, { upsert: true });
  eq(up.upsertedCount, 1, 'upsert upsertedCount');
  ok(up.upsertedId !== null && up.upsertedId !== undefined, 'upsert upsertedId set');
  const frank = await users.findOne({ name: 'Frank' });
  ok(frank !== null && frank.age === 50, 'upsert created doc');

  // ---- replaceOne ----
  const rp = await users.replaceOne({ name: 'Frank' }, { name: 'Frank', age: 51, fresh: true });
  eq(rp.matchedCount, 1, 'replaceOne matched');
  const frank2 = await users.findOne({ name: 'Frank' });
  ok(frank2.age === 51 && frank2.fresh === true, 'replaceOne applied');

  // ---- deleteOne / deleteMany ----
  const d1 = await users.deleteOne({ name: 'Erin' });
  eq(d1.acknowledged, true, 'deleteOne acknowledged');
  eq(d1.deletedCount, 1, 'deleteOne deletedCount');
  ok((await users.findOne({ name: 'Erin' })) === null, 'deleteOne removed');

  const d2 = await users.deleteMany({ senior: true });
  eq(d2.deletedCount, 3, 'deleteMany deletedCount');
  eq(await users.countDocuments({}), 2, 'count after deletes');

  // ---- countDocuments ----
  eq(await users.countDocuments(), 2, 'countDocuments all');
  eq(await users.countDocuments({ age: { $lt: 30 } }), 1, 'countDocuments filter');

  // ---- aggregate ----
  const orders = db.collection('orders');
  await orders.insertMany([
    { item: 'book', qty: 2, price: 10, region: 'east' },
    { item: 'pen', qty: 5, price: 2, region: 'west' },
    { item: 'book', qty: 1, price: 10, region: 'east' },
    { item: 'pen', qty: 3, price: 2, region: 'east' },
  ]);
  const agg1 = await orders.aggregate([
    { $match: { region: 'east' } },
    { $group: { _id: '$item', totalQty: { $sum: '$qty' }, n: { $sum: 1 } } },
    { $sort: { _id: 1 } },
  ]).toArray();
  eq(agg1.length, 2, 'aggregate $group count');
  eq(agg1[0]._id, 'book', 'aggregate group _id');
  eq(agg1[0].totalQty, 3, 'aggregate $sum');
  eq(agg1[0].n, 2, 'aggregate $sum:1 count');

  const agg2 = await orders.aggregate([
    { $project: { item: 1, total: { $multiply: ['$qty', '$price'] } } },
    { $sort: { total: -1 } },
    { $limit: 2 },
  ]).toArray();
  eq(agg2.length, 2, 'aggregate $project+$limit');
  eq(agg2[0].total, 20, 'aggregate computed field');
  ok(agg2[0].item !== undefined, 'aggregate project keeps item');

  const agg3 = await orders.aggregate([
    { $group: { _id: null, avgQty: { $avg: '$qty' }, maxPrice: { $max: '$price' } } },
  ]).toArray();
  eq(agg3.length, 1, 'aggregate null _id group');
  eq(agg3[0].avgQty, 2.75, 'aggregate $avg');
  eq(agg3[0].maxPrice, 10, 'aggregate $max');

  // ---- createIndex ----
  const ixName = await users.createIndex({ age: 1 });
  ok(typeof ixName === 'string' && ixName.length > 0, 'createIndex returns name');

  // ---- listCollections / createCollection ----
  const colls = await db.listCollections().toArray();
  const names = colls.map(c => c.name);
  ok(names.indexOf('users') !== -1 && names.indexOf('orders') !== -1, 'listCollections');
  const nc = await db.createCollection('fresh');
  ok(nc.collectionName === 'fresh', 'createCollection');
  ok((await db.listCollections().toArray()).some(c => c.name === 'fresh'), 'listCollections after create');

  // ---- persistence across close/reopen ----
  await client.close();
  const client2 = new MongoClient('awtsmoos://' + DBPATH);
  await client2.connect();
  const users2 = client2.db('testdb').collection('users');
  eq(await users2.countDocuments(), 2, 'data survives close/reopen');
  // Note: Alice/Carol/Dave were deleted by deleteMany({senior:true}); survivors are Bob + Frank.
  const bob2 = await users2.findOne({ name: 'Bob' });
  ok(bob2 !== null && bob2.age === 26 && bob2._id === 'user-bob', 'doc intact after reopen incl string _id');
  const frank3 = await users2.findOne({ name: 'Frank' });
  ok(frank3 !== null && frank3._id instanceof ObjectId, 'ObjectId _id survives reopen');
  eq(frank3.age, 51, 'replaced doc intact after reopen');

  // ---- dropDatabase ----
  const dd = await client2.db('testdb').dropDatabase();
  ok(dd === true, 'dropDatabase returns true');
  eq(await client2.db('testdb').collection('users').countDocuments(), 0, 'dropDatabase emptied');
  eq((await client2.db('testdb').listCollections().toArray()).length, 0, 'dropDatabase cleared collections');
  await client2.close();

  // ---- source self-check: the banned stringify call appears nowhere in this layer ----
  const dir = path.join(__dirname, '..');
  const files = [];
  (function walk(d) {
    for (const f of fs.readdirSync(d)) {
      const p = path.join(d, f);
      const st = fs.statSync(p);
      if (st.isDirectory()) walk(p);
      else if (f.endsWith('.js')) files.push(p);
    }
  })(dir);
  const needle = 'JSON.' + 'stringify'; // split to stay out of naive grep hits
  const bad = files.filter(f => fs.readFileSync(f, 'utf8').includes(needle));
  ok(bad.length === 0, 'no banned stringify call in compat layer' + (bad.length ? ' :: ' + bad.join(',') : ''));

  console.log('---');
  console.log('passed: ' + passed + ', failed: ' + failed);
  try { fs.unlinkSync(DBPATH); } catch (e) {}
  process.exit(failed ? 1 : 0);
}

main().catch(e => { console.log('FATAL: ' + (e && e.stack || e)); process.exit(1); });
