//B"H
//Blessed is He
//Boruch Hashem


/**
 * @module PackedShardRoutes
 * @description
 * Resumable binary shard transfer to production over HTTPS.
 *
 * WHY THIS EXISTS: vector shards (100-500 MB .f32 matrices) exceed the signed
 * deploy API's 5 MB/file cap and cannot be written into the RAG root by the
 * repo-tree deploy push. This route family moves a shard in small signed
 * chunks, verifies SHA-256 at chunk and file granularity, and only then
 * atomically promotes the bytes into the live RAG root.
 *
 * Routes (mounted under /api/social by the packed composer):
 *   POST /packed/shard/start    — declare a shard transfer plan {shard, files:[{name,bytes,sha256}]}
 *   POST /packed/shard/chunk    — append one chunk {shard,name,offset,bytes,chunkSha256,data(base64)}
 *   GET  /packed/shard/status  — staged bytes per file + live file inventory (resume support)
 *   POST /packed/shard/finalize — verify full-file SHA-256, refuse overwrite, atomically promote
 *   GET  /packed/shard/verify  — live checksums, row geometry, self-query proof through flatMatrixSearch
 *
 * Auth: the SAME Ed25519 canonical-envelope scheme as /packed/deploy
 * (deploySign.js). Every mutating call signs canonical {v,ts,message,files};
 * the chunk bytes additionally carry their own SHA-256 which the signature
 * binds. Read calls (status/verify) sign {shard, op} and pass ts/message/sig
 * as query params.
 *
 * Safety:
 * - Shard names are strict [a-z0-9-]; file names must be exactly
 *   <shard>.awtsdb | <shard>.f32 | <shard>.meta.jsonl | <shard>.fast-manifest.json.
 * - Bytes land in <ragRoot>/shard-staging/<shard>/ — invisible to shard
 *   discovery until finalize promotes them.
 * - Finalize REFUSES to overwrite a live file (Yaakov's law: never overwrite);
 *   pass replace:true explicitly to supersede a live shard.
 * - Chunk writes are offset-checked: a retried chunk is idempotent, a
 *   mismatched offset returns 409 with the current staged size so the client
 *   resumes exactly where the server is.
 * - Load discipline: 1 MB chunks, sequential appends, no whole-file buffering
 *   beyond the chunk itself. Verify's self-query uses the bounded flat-matrix
 *   scanner (256-row chunks), never loading the matrix whole.
 */

const { PackedShardRoutes } = require('./shardRoutesClass.js');
Object.assign(PackedShardRoutes.prototype, require('./shardRoutesChunk.js'));
Object.assign(PackedShardRoutes.prototype, require('./shardRoutesFinalize.js'));
Object.assign(PackedShardRoutes.prototype, require('./shardRoutesVerify.js'));
Object.assign(PackedShardRoutes.prototype, require('./shardRoutesQuery.js'));

module.exports = { PackedShardRoutes };
