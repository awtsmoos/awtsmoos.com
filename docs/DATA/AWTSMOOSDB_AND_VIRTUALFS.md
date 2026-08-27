B"H
Boruch Hashem
Blessed is He

# AwtsmoosDB, VirtualFs, and Legacy Compatibility

The Awtsmoos renews old and new storage vessels in the same instant; Awtsmoos.com therefore detects what a file actually is before assuming its extension tells the whole story.

## Modern AwtsmoosDB

`ayzarim/DosDB/awtsmoosBinary/awtsmoosDB/` contains the modern binary database implementation. The DosDB filesystem adapter can open an AwtsmoosDB and use its `fs` surface as a VirtualFs-style store for selected logical families.

The adapter distinguishes shared writable handles from read-only handles. Read-only handles can be cached against a file seal derived from size and modification time. Mutations invalidate related read caches and can close stale read-only handles.

## File-format detection

The adapter does not trust `.fs.awtsdb` as proof of a modern superblock. It reads the leading bytes and treats magic such as `Aj` or `Aa` as old AwtsmoosBinaryJSON-style content. This compatibility gate exists because historical packed Social files may wear a modern-looking extension while containing an older object format.

Opening such a legacy file as a modern allocator would be unsafe. The adapter therefore routes modern files through `db.fs.*` and legacy raw objects through legacy AwtsmoosBinaryJSON readers/writers.

## Virtual filesystem families

The inspected adapter constructs specialized family database filenames for a Heichel's comments, posts and series. It can also derive more granular comment shards for a series and post. Logical path matching determines which storage family is eligible.

## Parallel binary database

`awtsmoosDbBridge.js` exposes `createAwtsmoosDb` / `AwtsmoosDB` as a separate lazy facility. Its source explicitly describes use for AI search, vector memory, graph experiments and future migration. Merely requiring DosDB does not open this database.

Relative parallel DB paths can resolve beside an owning DosDB root. Callers may request automatic opening and optional attachment of the owning DosDB instance.

## Compatibility principle

Filename, extension, logical path and storage generation are separate facts. Before changing any bridge:

1. identify actual binary magic/format;
2. identify logical family routing;
3. identify legacy fallback expectations;
4. identify read/write cache behavior;
5. test historical files as well as modern fixtures;
6. document migration and rollback behavior.

## Do not flatten the layers

`DosDB`, `AwtsmoosBinaryJSON`, `AwtsmoosDB`, VirtualFs and Social packed shards are related but not interchangeable names. Human docs should state which layer a feature uses; generated symbol/dependency indexes help locate implementation, but they do not determine storage authority by themselves.
