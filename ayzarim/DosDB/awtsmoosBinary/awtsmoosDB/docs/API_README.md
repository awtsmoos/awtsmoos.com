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
  compression: true,
  wal: true
});

db.open();
db.close();
```

`open()` creates the file if needed and exposes `db.root`.

`close()` flushes the exact logical byte range to disk. The pager may keep a
larger RAM mirror for speed, but disk flush truncates to the allocator cursor.

WAL is enabled by default. It is exact-byte and fsync-batched at idle/close:
the WAL is written first, database pages are flushed second, and the WAL is
cleared after the database fsync completes.

For disposable benchmarks only:

```js
const db = new AwtsmoosDB("scratch.db", {
  wal: false
});
```

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

Paged keys:

```js
const firstTen = db.keys(db.root, {
  offset: 0,
  limit: 10,
  order: "asc"
});

const nextTenNativeOrder = db.keys(db.root, {
  offset: 10,
  limit: 10
});
```

When no sort order is requested, the iterator stops after the requested page
instead of materializing every key first. Sorted order must collect the visible
keys before slicing.

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

## AI And Embeddings

`db.ai.load()` accepts local GGUF files or Hugging Face URLs:

```js
await db.ai.load(
  "https://huggingface.co/ggml-org/bge-small-en-v1.5-Q8_0-GGUF/tree/main",
  {
    name: "bge-small",
    file: "bge-small-en-v1.5-q8_0.gguf",
    download: false
  }
);
```

For local or downloaded GGUF files, the loader parses the GGUF header,
metadata, and tensor directory without external libraries. Full BGE transformer
inference from GGUF tensors is a deeper runtime layer; meanwhile `db.ai.embed`
provides a deterministic no-library embedding fallback for vector workflows:

```js
const vector = db.ai.embed("some text", { dimensions: 384 });

db.root.sections = {};
db.ai.indexText(db.root.sections, "intro", "searchable text", {
  dimensions: 384
});
```

## Old DosDB Bridge

The previous `awtsmoosBinaryJSON` helpers are available through `db.DosDB`:

```js
console.log(db.DosDB.methods());
const old = db.DosDB.old();
```

A sample migration script is included:

```powershell
node .\scripts\migrate_old_dosdb.js old-file.json new.awtsdb imported
```

It tries JSON first, then falls back to the old `deserializeBinary` method.

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

## Blob Byte Ranges

Use `db.blob` for file-system-like binary bodies. This API is intentionally on
the database object, not on live handles, so user data keys are not confused
with helper methods.

```js
let disk = db.blob.create(1024 * 1024, {
  name: "disk.img",
  contentType: "application/octet-stream"
});

disk = db.blob.write(disk, 4096, Buffer.from("boot"));
const boot = db.blob.read(disk, 4096, 4);

db.root.files = {};
db.root.files.disk = disk;
```

Blob tokens are small JSON records stored in normal database values. The large
byte body lives in its own exact range, so `read(blob, offset, length)` only
reads the requested bytes from disk pages.

Available blob methods:

- `db.blob.create(sizeOrBytes, meta)`: allocate a byte body from a number,
  Buffer, Uint8Array, or string.
- `db.blob.info(blob)`: return `id`, `offset`, `length`, and metadata.
- `db.blob.read(blob, offset, length)`: read a Buffer range.
- `db.blob.write(blob, offset, bytes)`: write at an offset; if the write grows
  the blob, it relocates and returns an updated token.
- `db.blob.resize(blob, size)`: grow or shrink while preserving prefix bytes.
- `db.blob.delete(blob)`: release the body range to the allocator.

When a blob grows or resizes, keep the returned token:

```js
disk = db.blob.write(disk, 2 * 1024 * 1024, Buffer.from("tail"));
db.root.files.disk = disk;
```

For deletion, remove live references before expecting verified GC to reclaim
the bytes:

```js
db.blob.delete(disk);
delete db.root.files.disk;
db.gc();
```

Large blob creation and relocation are chunked internally, so the manager does
not allocate the whole file body in RAM just to zero or copy it.

Async range helpers coordinate overlapping access:

```js
await Promise.all([
  db.blob.writeAsync(disk, 0, Buffer.from("left")),
  db.blob.writeAsync(disk, 4096, Buffer.from("right"))
]);
```

Non-overlapping ranges may proceed independently. Overlapping writes serialize
through the range-lock manager.

## Chunked Text

Normal JavaScript strings are scalar values. Calling
`db.root.longString.substring(0, 200)` uses JavaScript's native string method,
so the scalar has already been hydrated.

For long text that must support range reads without hydrating the whole value,
use `db.text`:

```js
let book = db.text.create(hugeText, {
  chunkChars: 4096
});

const firstPage = db.text.substring(book, 0, 200);

for await (const chunk of db.text.stream(book, { start: 1000, end: 9000 })) {
  console.log(chunk);
}

book = db.text.append(book, "\nnew chapter");
db.root.book = book;
```

`db.text` uses `TextEncoder` and `TextDecoder` for UTF-8 blocks. Each block is
backed by blob storage, so substring and stream operations read only the blocks
that overlap the requested character range.

Available text methods:

- `db.text.create(textOrBytes, options)`: create a chunked text token.
- `db.text.info(token)`: inspect characters, UTF-8 bytes, and block count.
- `db.text.substring(token, start, end)`: read a character range.
- `db.text.read(token, start, length)`: length-based substring.
- `db.text.stream(token, { start, end })`: async range generator.
- `db.text.append(token, suffix)`: append as new blocks and return an updated token.

As with blobs, keep the returned token after append:

```js
book = db.text.append(book, "tail");
db.root.book = book;
```

## Concurrent Operations

Ordinary live-handle mutations now pass through the internal path-lock layer:

```js
await Promise.all([
  Promise.resolve().then(() => { db.root.users["1"].name = "A"; }),
  Promise.resolve().then(() => { db.root.users["2"].name = "B"; })
]);
```

The user-facing API remains normal JavaScript assignment. The writer derives a
logical path from each live handle and key, then enters the lock layer before
touching the structure.

`db.concurrent` exposes a small coordination layer for server-style workloads:

```js
await Promise.all([
  db.concurrent.writePath(["users", "1", "name"], "A"),
  db.concurrent.writePath(["users", "2", "name"], "B")
]);
```

Path locks use logical containment. A write to `users` conflicts with
`users.1.name`, but `users.1.name` and `users.2.name` do not conflict at the
outer logical layer.

Available helpers:

- `db.concurrent.readPath(path)`
- `db.concurrent.writePath(path, value)`
- `db.concurrent.deletePath(path)`
- `db.concurrent.rangeRead(resource, offset, length, fn)`
- `db.concurrent.rangeWrite(resource, offset, length, fn)`

This is a practical coordination layer over the current synchronous storage
engine. Fully parallel structural mutation at the node level would require the
larger MVCC/copy-on-write structure engine described in the architecture notes.

## Turbo Write-Behind

For very high fan-in sync-looking writes, enable the append-first overlay:

```js
const db = new AwtsmoosDB("site.db", {
  turboWrites: true
});

db.open();

await Promise.all(Array.from({ length: 1000 }, (_, i) => (
  Promise.resolve().then(() => {
    db.root[`k${i}`] = i;
  })
)));

console.log(db.root.k7);
db.close();
```

With `turboWrites: true`, ordinary assignment records intent in a RAM overlay
instead of forcing every caller through the structural writer immediately.
Reads check the overlay first, so the caller sees the value as if it were
already written. `waitForIdle()` and `close()` persist the overlay to a durable
append sidecar at `databasePath + ".turbo.json"`.

Reads consult layers newest-first:

1. pending RAM overlay
2. durable turbo delta
3. compacted copy-on-write turbo tree
4. original main binary structure

The overlay participates in the ordinary object surface:

```js
db.root.set("name", "Mendel");
console.log("name" in db.root);
console.log(Object.keys(db.root).includes("name"));

delete db.root.name;
console.log(db.root.name); // undefined
```

Turbo writes schedule a short debounced flush automatically. `close()` and
`waitForIdle()` still force an immediate flush for strict shutdown points, and
normal process `beforeExit` also attempts one final flush. Like every database,
power loss or a hard process kill can still interrupt work that was only in RAM
and had not reached the durable sidecar yet.

After the durable delta is written, a lagging copy-on-write compactor merges it
into `databasePath + ".turbo.tree.json"` by writing a temporary snapshot and
renaming it into place. If compaction fails, the durable delta remains readable.

This is the current fast path for thousands of non-conflicting sync-looking
assignments. The existing binary structure writer remains the fallback engine
and can still be used for normal durable writes when `turboWrites` is disabled.
The deeper future layer is merging compacted turbo snapshots into true binary
B-tree pages.

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

Deleting or replacing values can return old primitive payload ranges to the
exact free-space ledger. Middle-gap reuse is intentionally opt-in until a full
graph/search/vector-aware mark-sweep GC exists:

```js
const db = new AwtsmoosDB("reuse.db", {
  reuseFreedSpace: true
});
```

The suite includes regression tests for middle reuse and tail truncation.

## File Info Without Opening

You can inspect the file header without loading the database mirror:

```js
const info = AwtsmoosDB.inspectFile("data.db");
console.log(info.physicalBytes, info.logicalBytes, info.rootSealLength);
```

On an open database, use:

```js
console.log(db.info());
```

## Testing

The full validation command is:

```powershell
node .\test\run_all.js
```

The storage-specific tests are:

- `test/storage_density_test.js`
- `test/storage_reuse_test.js`
- `test/compression_extreme_test.js`
- `test/blob_fs_test.js`
- `test/concurrent_text_test.js`
- `test/turbo_writebehind_test.js`
- `test/deep_turbo_ai_test.js`

They verify exact physical flush size, compression round trips, compression
backoff for noisy data, varint pointer sizes, method-name collision behavior,
middle-gap reuse, blob offset I/O, verified blob reclaim, async range/path
coordination, automatic normal-API write locking, chunked text substring/
streaming, turbo write-behind persistence, deep nested turbo stress, paged key
access, AI/GGUF metadata loading, DosDB bridge access, and tail truncation.

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

Read-only verification:

```js
const report = db.verify();
console.log(report.ok, report.errors, report.reachableBytes, report.freeBytes);
```

`verify()` walks pointer seals from the superblock/root/free-list metadata and
does not hydrate whole values. `gc()` uses that mark/sweep report to install a
verified persistent free-list.

Verified reuse after GC:

```js
const db = new AwtsmoosDB("data.db", {
  reuseFreedSpace: "verified"
});

db.open();
db.gc();
db.root.next = Buffer.alloc(2048);
```

The raw `{ reuseFreedSpace: true }` mode is for experiments and focused tests.
For real indexed/graph data, prefer `"verified"` so reuse only consumes ranges
found by mark/sweep GC.

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
