B"H
Boruch Hashem
Blessed is He

# System Tutorial: DosDB Filesystem Storage

**District:** data · **System ID:** `dosdb-filesystem`

The legacy filesystem-oriented database layer and its compatibility surface.

> Generated evidence below is a navigation aid. Trust, migration, consistency, protocol, and authorization semantics remain grounded in the linked human manuals and current source.

## Claims boundary

Project and source presence establish implementation location, not the complete physical format of every persisted record.

## Change risk

Filesystem layout and compatibility behavior can be migration-sensitive.

## Human manuals

- [docs/DATA/DOSDB.md](../../../DATA/DOSDB.md)
- [docs/DATA/README.md](../../../DATA/README.md)

## Related project boundaries

- `ayzarim/DosDB` (data) — ayzarim/DosDB

## Source anchors

- `ayzarim/DosDB/index.js`

## Generated evidence

- [docs/GENERATED/PROJECT_TUTORIAL_INDEX.md](../../PROJECT_TUTORIAL_INDEX.md)

## Environment-name evidence

| Name | Class | Source refs | Example sources |
| --- | --- | --- | --- |
| `AWTSMOOS_EMBED_MODE` | runtime-config | 1 | `ayzarim/DosDB/aiSearch/textEmbedRunner.js` |
| `AWTSMOOS_EMBED_MODEL_ROOT` | test/tuning | 1 | `ayzarim/DosDB/awtsmoosBinary/awtsmoosDB/test/ai_search_model_root_precedence_test.js` |
| `AWTSMOOSDB_FAST_TEST` | test/tuning | 3 | `ayzarim/DosDB/awtsmoosBinary/awtsmoosDB/core/idle/fastGate.js; ayzarim/DosDB/awtsmoosBinary/awtsmoosDB/test/lightning/env.js; ayzarim/DosDB/awtsmoosBinary/awtsmoosDB/test/semantic_ai_dosdb_test.js` |
| `AWTSMOOSDB_TEST_SCALE` | test/tuning | 1 | `ayzarim/DosDB/awtsmoosBinary/awtsmoosDB/test/lightning/env.js` |
| `NODE_ENV` | runtime-config | 3 | `ayzarim/DosDB/awtsmoosBinary/awtsmoosDB/test/lightning/env.js; geelooy/api/wallet/core/paypalEnvironment.js; geelooy/api/wallet/tests/paypalEnvironment.test.js` |

## Realtime application registration evidence

No versioned application registrations are attached to this packet.

## Lexical event/message evidence

None observed for this system packet.

## Tags

`persistence` · `filesystem` · `compatibility`
