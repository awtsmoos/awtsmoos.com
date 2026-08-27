B"H
Boruch Hashem
Blessed is He

# System Tutorial: AwtsmoosDB and VirtualFs

**District:** data · **System ID:** `awtsmoosdb-virtualfs`

The newer `.awtsdb` storage engine and its virtual filesystem interface.

> Generated evidence below is a navigation aid. Trust, migration, consistency, protocol, and authorization semantics remain grounded in the linked human manuals and current source.

## Claims boundary

Source paths establish the engine/interface boundary; generated docs do not infer transaction or consistency guarantees.

## Change risk

Storage-engine, manifest, transaction, or path changes require compatibility review.

## Human manuals

- [docs/DATA/AWTSMOOSDB_AND_VIRTUALFS.md](../../../DATA/AWTSMOOSDB_AND_VIRTUALFS.md)
- [docs/DATA/README.md](../../../DATA/README.md)

## Related project boundaries

- `ayzarim/DosDB` (data) — ayzarim/DosDB

## Source anchors

- `ayzarim/DosDB/awtsmoosBinary/awtsmoosDB/index.js`
- `ayzarim/DosDB/awtsmoosBinary/awtsmoosDB/api/fs/v3/VirtualFs.js`

## Generated evidence

None observed for this system packet.

## Environment-name evidence

| Name | Class | Source refs | Example sources |
| --- | --- | --- | --- |
| `AWTSMOOS_EMBED_MODEL_ROOT` | test/tuning | 1 | `ayzarim/DosDB/awtsmoosBinary/awtsmoosDB/test/ai_search_model_root_precedence_test.js` |
| `AWTSMOOSDB_FAST_TEST` | test/tuning | 3 | `ayzarim/DosDB/awtsmoosBinary/awtsmoosDB/core/idle/fastGate.js; ayzarim/DosDB/awtsmoosBinary/awtsmoosDB/test/lightning/env.js; ayzarim/DosDB/awtsmoosBinary/awtsmoosDB/test/semantic_ai_dosdb_test.js` |
| `AWTSMOOSDB_TEST_SCALE` | test/tuning | 1 | `ayzarim/DosDB/awtsmoosBinary/awtsmoosDB/test/lightning/env.js` |
| `NODE_ENV` | runtime-config | 3 | `ayzarim/DosDB/awtsmoosBinary/awtsmoosDB/test/lightning/env.js; geelooy/api/wallet/core/paypalEnvironment.js; geelooy/api/wallet/tests/paypalEnvironment.test.js` |

## Realtime application registration evidence

No versioned application registrations are attached to this packet.

## Lexical event/message evidence

None observed for this system packet.

## Tags

`persistence` · `virtualfs` · `awtsmoosdb` · `migration`
