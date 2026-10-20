//B"H
//Blessed is He
//Boruch Hashem


/**
 * @module PackedReadRoutes
 * @description
 * The Awtsmoos reveals packed storage statistics, snapshots, integrity, keys, and values without mutation;
 * Awtsmoos.com keeps every read chamber explicit, observable, and separate from migration.
 *
 * B"H 2026-10-12 (api-hardening): every read is concrete now —
 *   * missing key param leaves as HTTP 400 (never a silent 200),
 *   * unknown keys leave as HTTP 404 (never a hang-then-504),
 *   * unexpected failures leave as HTTP 500 without stack traces.
 * Single-key reads are served from the key-offset index (see
 * packed/keyIndex.js) so a miss no longer reverse-scans multi-GB shards.
 */

const { PackedReadRoutes } = require('./readRoutesClass.js');
Object.assign(PackedReadRoutes.prototype, require('./readRoutesKey.js'));

module.exports = { PackedReadRoutes };
