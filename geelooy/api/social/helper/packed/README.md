B"H

# Packed Storage Model — Agent Handoff

The append-only JSONL / AwtsmoosDB shard layer that mirrors native records for readers. Native records (`/social/heichelos/...` via `$i.db`) are the system of record; the packed shards are what readers serve.

## Logical keys (`shardPaths.js`)

```js
logicalKey(['posts', heichelId, postId])  // → '/posts/<heichelId>/<postId>'
```
Segments are slash-stripped and joined with `/`.

## Shards

| Shard | File (`<dbRoot>/socialPacked/`) | Key pattern |
|---|---|---|
| `core` | `social.core.awtsdb` | `/posts/<heichel>/<postId>` — full post JSON |
| `allPosts` | `social.allPosts.awtsdb` | `/allPosts/<heichel>/<postId>` — 280-char excerpt card |
| `meta` | `social.meta.awtsdb` | entity + migration manifests |
| `search` | `social.search.awtsdb` | `/indexes/postsByHeichel/<heichel>/<postId>`, `postsByAlias`, `postsByType`, graph indexes |
| `graph` | `social.graph.awtsdb` | `/graph/<kind>/<id>` |
| `notify` | `social.notify.awtsdb` | `/notifications/<toAlias>/<id>` |
| `audit` | `social.audit.awtsdb` | `/events/<type>/<id>` |
| `feed` | `social.feed.awtsdb` | feed records |

## Writers (`socialPacked.js`)

```js
mirrorPost({$i, post})      // core record + allPosts mirror + entity manifest + 3 search indexes + audit event
mirrorPostBulk({$i, post}) // same MINUS the per-post audit event (bulk import uses this)
```
`post` must carry `id` (or `postId`) and `heichelId`. `postId = post.id || post.postId`. The `allPosts` value is a card: `{postId, heichelId, seriesId, aliasId, type, title, excerpt(280ch), connected:true, updatedAt}`.

## Reads

- **JSONL mode** (tests / request-local `$i.db.directory`): append-only lines per shard file; `latestFileRecords` replays the whole file into a `Map` keyed by `record.key` — **last line wins**.
- **AwtsmoosDB mode** (production): `store.get({shard, parts:['records', key]})?.value` — key-addressed.
- `readPacked({$i, shard, key})` returns the latest record or null.

## Record envelope (`recordEnvelope.js`)

```js
{ op:'put'|'del', key, recordType, value, meta:{...meta, complexity}, schemaVersion:1, ts }
```
`recordType`: `jsonObject` | `jsonBusyObject` (≥8 nodes, ≥2 arrays, or depth ≥4) | `graphEdge` | `notification` | `migrationManifest` | `tombstone`.

## Tombstones (deletion)

`/packed/import/posts/remove` appends `{op:'del', key:'/posts/<heichel>/<postId>', value:null, meta:{kind:'postTombstone'}}` to the `core` shard. Append-only means the tombstone becomes the latest record for that key. Notes:
- The tombstone check lives at the import-tool layer; `/packed/read` returns the tombstone record itself — callers must inspect `op`.
- The front-end post reader reads the **native** db (where the record is actually deleted), not the shard.

## Files map

- `geelooy/api/social/helper/packed/{socialPacked.js,packedReader.js,recordEnvelope.js,shardPaths.js}`
- Read routes: `../routes/packed/readRoutes.js`
- Import routes: `../routes/packed/postImportRoutes.js`
