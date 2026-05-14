B"H

# AwtsmoosDB API Guide

AwtsmoosDB is a synchronous binary object database. You open one file, receive
a live root handle, and write JavaScript values directly into `db.root`.

The main idea is simple:

```js
const AwtsmoosDB = require("../index.js");

const db = new AwtsmoosDB("example.awtsmoosdb");
db.open();

db.root.name = "AwtsmoosDB";
db.root.count = 2;
db.root.bytes = Buffer.from([1, 2, 3]);

console.log(db.root.name.__resolve__ ? db.root.name.__resolve__() : db.root.name);

db.close();
```

## Opening And Closing

```js
const db = new AwtsmoosDB("data.db", {
  compression: true
});

db.open();
db.close();
```

`open()` creates the file if needed and exposes `db.root`.

`close()` flushes the exact logical byte range to disk. The pager may keep a
larger RAM mirror for speed, but disk flush truncates to the allocator cursor.

## The Root Live Handle

`db.root` is the main live object. Assigning a property stores it immediately:

```js
db.root.user = {
  id: 770,
  name: "Dovid",
  tags: ["fast", "binary", "exact"]
};
```

Reading a nested object or collection may return another live handle. Scalars
such as strings, numbers, booleans, Buffers, dates, and typed arrays resolve
back into normal JavaScript values.

When you need to force a scalar handle into the plain value:

```js
const value = db.root.user.name.__resolve__
  ? db.root.user.name.__resolve__()
  : db.root.user.name;
```

## Root Helper Methods

These legacy helpers route through `db.root`:

```js
db.set("title", "Sefer Bytes");
const title = db.get("title");
db.delete("title");
```

They are useful when a property name would collide with a JavaScript method.

## Method Name Collisions

Stored data wins over helper methods on live mapping handles.

This is valid:

```js
db.root.set = "I am data, not the .set method";
db.root.get = "I am data, not the .get method";
db.root.keys = "I am data, not the .keys method";
```

After those assignments, `db.root.set`, `db.root.get`, and `db.root.keys` read
the stored values. Use root helpers when you want method-style access:

```js
db.set("set", "stored safely");
console.log(db.get("set"));
```

The design rule is: direct `db.root.someKey = value` is the primary API, and
extra methods should not steal real user keys.

## Supported Values

Common supported values include:

- `null`, `undefined`, booleans, numbers, `NaN`, infinities
- strings
- `BigInt`
- `Date`
- `RegExp`
- `Error` and common subclasses
- `Buffer`
- `ArrayBuffer`
- typed arrays
- arrays
- plain objects
- `Map`, `Set`
- functions by source text when possible
- circular object graphs through stable anchors

## Maps And Lists

Create database-native maps and lists with:

```js
db.createMap(db.root, "users");
db.root.users.set("770", { name: "Mendel" });

db.createList(db.root, "events");
db.root.events.push("created");
db.root.events.push("indexed");
```

Objects are usually easiest through direct assignment:

```js
db.root.settings = {};
db.root.settings.theme = "light";
```

Arrays support sequence-like operations such as `push`, `pop`, `shift`,
`unshift`, `splice`, `slice`, iteration, and `length`.

## Iteration

Mapping handles expose familiar methods when those names are not stored keys:

```js
for (const key of db.root.users.keys()) {
  console.log(key);
}

for (const [key, value] of db.root.users.entries()) {
  console.log(key, value);
}
```

If you store a key named `keys`, that stored data takes priority. Use `db.keys`
or avoid reserved-looking names when you want method syntax on that same handle.

## Search, Query, Graph, Vector

The database exposes managers:

```js
db.search
db.query(handle, options)
db.graph
db.vector
```

The test suite exercises these APIs. Their exact query shapes are best copied
from the focused tests until a dedicated search/vector guide is written.

## Compression

Compression is enabled by default:

```js
const db = new AwtsmoosDB("compressed.db", {
  compression: true
});
```

The compressor is custom and dependency-free. It tries byte-level LZ and RLE
frames, then stores raw bytes when compression would make data larger.

Compression currently applies to:

- strings
- Buffers
- ArrayBuffers
- typed arrays

Disable it when you need raw storage measurements:

```js
const db = new AwtsmoosDB("raw.db", {
  compression: false
});
```

## Byte Accounting

Use `storageStats()` to inspect density:

```js
const stats = db.storageStats();

console.log(stats.payloadBytes);
console.log(stats.storedPrimitiveBytes);
console.log(stats.logicalBytes);
console.log(stats.physicalBytes);
console.log(stats.compressedWrites);
console.log(stats.savedBytes);
```

Field meanings:

- `payloadBytes`: user primitive content bytes before compression.
- `storedPrimitiveBytes`: primitive bytes actually written after compression.
- `logicalBytes`: allocator cursor, the meaningful DB byte boundary.
- `physicalBytes`: disk size, or pending logical flush size while dirty.
- `compressedWrites`: number of primitive writes stored as compressed frames.
- `savedBytes`: payload bytes avoided by compression.

## Delete, Reuse, And Truncate

Deleting or replacing values returns old primitive payload ranges to the exact
free-space ledger. Middle gaps are reused by later writes, and tail frees pull
the logical cursor backward so close can truncate the physical file.

```js
db.root.big = Buffer.alloc(8192, 1);
delete db.root.big;

db.root.next = Buffer.alloc(8192, 2);
```

The suite includes regression tests for middle reuse and tail truncation.

## Testing

The full validation command is:

```powershell
node .\test\run_all.js
```

The storage-specific tests are:

- `test/storage_density_test.js`
- `test/storage_reuse_test.js`
- `test/compression_extreme_test.js`

They verify exact physical flush size, compression round trips, compression
backoff for noisy data, varint pointer sizes, method-name collision behavior,
middle-gap reuse, and tail truncation.

## Runtime Helpers

Memory stats:

```js
const mem = db.memoryStats();
console.log(mem.rss, mem.heapUsed, mem.pagerBytes);
```

Lightweight GC/free ledger:

```js
const report = db.gc();
console.log(report.freeBytes, report.freeRanges, report.logicalBytes);
```

Password encrypted fields:

```js
db.root.secret = db.encrypt({ token: "hidden" }, "password");
const clear = db.decrypt(db.root.secret, "password");
```

Wrong passwords fail authentication.

Optional in-runtime versions for root deletes:

```js
db.root.note = "first";
delete db.root.note;

console.log(db.history("note"));
db.restore("note");
```

This history layer is intentionally small and fast. It is an undo/restore helper
for the active runtime, not a full persistent audit log.
