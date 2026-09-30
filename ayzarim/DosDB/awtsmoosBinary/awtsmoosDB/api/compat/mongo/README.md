# AwtsmoosDB — MongoDB Compatibility Layer

B"H

Drop-in MongoDB-compatible API on top of AwtsmoosDB. Migration is an import swap:

```js
// before
const { MongoClient } = require('mongodb');
// after
const { MongoClient } = require('<awtsmoosDB>/api/compat/mongo');

const client = new MongoClient('awtsmoos:///tmp/mymongo.awtsdb'); // 1-2 lines of setup
await client.connect();
const users = client.db('mydb').collection('users');
await users.insertOne({ name: 'Alice', age: 30 });
const alice = await users.findOne({ name: 'Alice' });
await client.close();
```

Everything after `connect()` is the real MongoDB driver API.

## Connection URL

- `awtsmoos:///absolute/path/to/file.awtsdb` — use this AwtsmoosDB file.
- `mongodb://...` — accepted for import-swap convenience; the file comes from
  `options.dbPath` (or `options.awtDbPath`), default `./awtsmoos-mongo.awtsdb`.
- `options.awtOpts` — engine options passed to `new AwtsmoosDB(path, opts)`.

## API surface (mirrors the mongodb npm driver)

- **MongoClient**: `constructor(url, options)`, `connect()`, `db(name)`, `close()`
- **Db**: `collection(name)`, `createCollection(name)`, `dropCollection(name)`,
  `dropDatabase()`, `listCollections()`
- **Collection**: `insertOne`, `insertMany`, `findOne`, `find` (filter + options,
  chainable cursor: `sort`/`skip`/`limit`/`project`/`toArray`/`next`/`hasNext`),
  `updateOne`, `updateMany`, `replaceOne`, `deleteOne`, `deleteMany`,
  `countDocuments`, `estimatedDocumentCount`, `aggregate`, `createIndex`, `drop`
- **ObjectId**: generation, `toHexString()`, `equals()`, `getTimestamp()`,
  `createFromHexString()`, `isValid()`
- **Filter operators**: `$eq $ne $gt $gte $lt $lte $in $nin $exists $regex`
  `$and $or $nor`, dot-notation paths
- **Update operators**: `$set $inc $unset $push` (`$each`) `$addToSet $pop $mul`,
  plus replacement-style updates
- **Aggregation**: `$match $project $group $sort $limit $skip`; expressions
  `$add $subtract $multiply $divide $mod $concat $toUpper $toLower $size $cond
  $ifNull $literal`; accumulators `$sum $avg $min $max $first $last $push $addToSet`

## Storage

Collections live as subtrees of the AwtsmoosDB root map under the
`__mongo:` key prefix: one key per document (O(1) writes), chunked id lists
(1000/chunk) for scans, per-collection metadata. Documents are stored as
AwtsmoosDB-native values; `ObjectId`/`Date` values are tagged
(`{$oid: hex}` / `{$date: ms}`) and revived on read. Zero stringify calls
anywhere in this layer — all serialization uses hand-rolled canonical encoders.

## Honest limitations (v1)

- **Queries are collection scans.** `createIndex()` records index definitions
  for API compatibility, but v1 does not use them for planning — same
  complexity class as MongoDB without a usable index.
- **No multi-document transactions.** Single-document writes are atomic as
  provided by the engine.
- **`insertMany` unordered mode** reports per-index write errors on the thrown
  error (`.writeErrors`, `.result`); the real driver's error type is approximated.
- **Capped collections, TTL indexes, change streams, GridFS** are not implemented.
- **Write durability**: acknowledged writes are WAL-safe against process crash;
  a full checkpoint runs on `close()` (and the engine's idle tick). OS/power
  failure can lose writes since the last checkpoint — same posture as the
  engine itself.

## Test

```
node test/conformance.js
```

Runs the full conformance suite against a throwaway `/tmp` database, including
a self-check that the banned stringify call appears nowhere in this layer.
