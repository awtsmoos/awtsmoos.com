# AwtsmoosDB — Redis-compatible API

B"H — use AwtsmoosDB with the exact `node-redis` (v4) command surface.
Change the import + 1–2 lines of setup; every other call stays identical.

```js
const { createClient } = require('awtsmoosDB/api/compat/redis');

const client = createClient({ database: '/tmp/myapp.awtsdb' }); // the 1-2 lines
await client.connect();

await client.set('hello', 'world', { EX: 60 });
console.log(await client.get('hello')); // 'world'

await client.hSet('user:1', { name: 'Yaakov', score: '42' });
console.log(await client.hGetAll('user:1'));

await client.quit(); // flush + close
```

## Design

- **Storage:** every Redis key lives at `db.root['__rd:' + key]` as a native
  AwtsmoosBinaryJSON record `{ t, v, e }` — `t` is the type tag
  (`s`/`h`/`l`/`set`/`z`), `v` the native value, `e` the expiry timestamp
  in ms (0 = persistent). The `__rd:` prefix keeps Redis data from ever
  colliding with other database uses. Zero stringify-based serialization anywhere in this layer.
- **Expiry:** lazy. Every read checks the timestamp; expired keys are deleted
  on sight and behave as missing (`GET` → `null`, `TTL` → `-2`, `KEYS`
  skips them). No background sweeper — documented, honest, and O(1).
- **Pub/sub:** in-process. A process-wide bus connects duplicated clients in
  the same Node process. Cross-process / network pub/sub is **not** provided.
- **Durability:** `quit()` flushes then closes; every write is crash-safe via
  the WAL. `disconnect()` closes without flushing.
- **Engine quirks handled:** (1) `db.root` object reads can return
  FUNCTION-handles (`typeof 'function'` with `__resolve__()`) instead of plain
  objects — the client resolves them before reading any field (pattern shared
  with the Mongo compat layer). (2) The engine may buffer `db.batch()` writes
  until `flush()` — a write-through cache serves read-your-writes,
  invalidated on delete/rename/expiry. (3) The engine enforces one exclusive
  writer per file, so `duplicate()` shares the source client's engine (and
  cache) via refcounting instead of opening a second one; the last holder to
  quit flushes and closes.
- **Performance (2026-09-30, Mac, real engine, under concurrent load):**
  `SET` p50 ~3.6ms avg ~16ms; `GET` p50 ~0.9ms cold / ~0.004ms cached
  (n=500). Plain `SET` skips the pre-read (only NX/XX/GET need it).
  10k-sequential-write runs hit the known engine crash
  (`map insertion could not load a child node` below ~2.5k keys) — an engine
  bug, not this layer; see Worker D/I.

## Supported commands

Strings: `SET` (EX/PX/NX/XX/GET), `GET`, `GETSET`, `INCR`/`DECR`/`INCRBY`/`DECRBY`,
`APPEND`, `STRLEN`, `MGET`, `MSET`.
Keys: `DEL`, `EXISTS`, `EXPIRE`/`PEXPIRE`, `TTL`/`PTTL`, `PERSIST`, `KEYS`
(glob `*` `?` `[..]`), `TYPE`, `RENAME`.
Hashes: `HSET`, `HGET`, `HGETALL`, `HDEL`, `HEXISTS`, `HKEYS`, `HVALS`, `HINCRBY`.
Lists: `LPUSH`, `RPUSH`, `LPOP`, `RPOP`, `LRANGE`, `LLEN`.
Sets: `SADD`, `SREM`, `SMEMBERS`, `SISMEMBER`, `SCARD`.
Sorted sets: `ZADD`, `ZRANGE` (+`REV`), `ZRANK`, `ZSCORE`, `ZCARD` —
ordered by score ascending, ties broken lexicographically by member.
Pub/sub: `SUBSCRIBE`, `UNSUBSCRIBE`, `PUBLISH`.
Lifecycle: `connect`, `duplicate`, `quit`, `disconnect`, `isConnected`.

Errors mirror Redis: `WRONGTYPE` on type misuse, `ERR value is not an
integer or out of range` on bad `INCR`, `ERR no such key` on bad `RENAME`.

## Honestly not supported

`SELECT`, transactions (`MULTI`/`EXEC`/`WATCH`), Lua (`EVAL`), streams,
geospatial, HyperLogLog, `SCAN` family (use `KEYS`), blocking pops
(`BLPOP`), `SET` options `EXAT`/`PXAT`/`KEEPTTL`, `ZRANGE` by score/lex
ranges, `WITHSCORES`, keyspace notifications, `CLIENT`/`CONFIG`/`INFO`
introspection, replication/cluster. Pub/sub is in-process only.
