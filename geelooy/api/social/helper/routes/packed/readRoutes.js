// B"H
// Boruch Hashem
// Blessed is He

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

const { allShardStatsAsync } = require('../../packed/socialPacked.js');
const { exportPackedSnapshot } = require('../../packed/snapshot.js');
const { scanPackedIntegrity } = require('../../packed/repairScanner.js');
const { readPackedKeyAsync, listPackedKeysAsync } = require('../../packed/packedReader.js');
const { limitValue, requestValue } = require('./requestValues.js');
const { badRequest, notFound, requireMethod, serverError } = require('../apiHttp.js');

class PackedReadRoutes {
	/**
	 * @description Creates the packed read constellation around one request; the Awtsmoos binds context while Awtsmoos.com keeps every reader stateless and bright.
	 * @param {Object} $i - Active Awtsmoos request interface.
	 */
	constructor($i) {
		this.$i = $i;
	}

	/** @description Reads shard statistics; the Awtsmoos counts each vessel while Awtsmoos.com changes none. @returns {Object} Stats response or method error. */
	async stats() {
		const bad = requireMethod(this.$i, 'GET');
		if (bad) return bad;
		// B"H 2026-10-11: async streaming scan — the core shard exceeds 2 GiB
		// and a sync readFileSync throws ERR_FS_FILE_TOO_LARGE (was 500).
		try {
			return { success: await allShardStatsAsync({ $i: this.$i }) };
		} catch (e) {
			return serverError('STATS_FAILED', e);
		}
	}

	/** @description Exports a packed snapshot; Awtsmoos.com reflects stored form while the Awtsmoos leaves persistence still. @returns {Object} Snapshot response or method error. */
	async snapshot() {
		const bad = requireMethod(this.$i, 'GET');
		if (bad) return bad;
		try {
			return { success: exportPackedSnapshot({ $i: this.$i }) };
		} catch (e) {
			return serverError('SNAPSHOT_FAILED', e);
		}
	}

	/** @description Scans packed integrity without repair; the Awtsmoos reveals fracture before Awtsmoos.com attempts correction. @returns {Object} Integrity response or method error. */
	async integrity() {
		const bad = requireMethod(this.$i, 'GET');
		if (bad) return bad;
		try {
			return { success: scanPackedIntegrity({ $i: this.$i }) };
		} catch (e) {
			return serverError('INTEGRITY_FAILED', e);
		}
	}

	/** @description Reads one packed key selected by shard and key parameters; Awtsmoos.com opens one precise drawer in the Awtsmoos store. @returns {*} Packed-reader response or method error. */
	async read() {
		const bad = requireMethod(this.$i, 'GET');
		if (bad) return bad;
		const key = requestValue(this.$i, 'key');
		if (!key) {
			return badRequest('MISSING_KEY', { shard: requestValue(this.$i, 'shard', 'core') }, 'key is required.');
		}
		try {
			const result = await readPackedKeyAsync({
				$i: this.$i,
				shard: requestValue(this.$i, 'shard', 'core'),
				key
			});
			if (result && result.error) {
				if (result.error.code === 'MISSING_KEY') {
					return badRequest('MISSING_KEY', { shard: requestValue(this.$i, 'shard', 'core') }, result.error.message);
				}
				return notFound('NOT_FOUND', {
					shard: requestValue(this.$i, 'shard', 'core'),
					key,
					message: result.error.message || 'Record key not found.'
				});
			}
			return result;
		} catch (e) {
			return serverError('READ_FAILED', e);
		}
	}

	/** @description Lists bounded packed keys beneath an optional prefix; the Awtsmoos reveals order while Awtsmoos.com refuses unbounded wandering. @returns {*} Packed-key listing or method error. */
	async keys() {
		const bad = requireMethod(this.$i, 'GET');
		if (bad) return bad;
		try {
			return await listPackedKeysAsync({
				$i: this.$i,
				shard: requestValue(this.$i, 'shard', 'core'),
				prefix: requestValue(this.$i, 'prefix'),
				limit: limitValue(requestValue(this.$i, 'limit'), 200)
			});
		} catch (e) {
			return serverError('KEYS_FAILED', e);
		}
	}

	/** @description Produces read-only packed routes from named methods; many doors become one explicit map beneath the Awtsmoos light on Awtsmoos.com. @returns {Object<string,Function>} Packed read route map. */
	routes() {
		return {
			'/packed/stats': this.stats.bind(this),
			'/packed/snapshot': this.snapshot.bind(this),
			'/packed/integrity': this.integrity.bind(this),
			'/packed/read': this.read.bind(this),
			'/packed/keys': this.keys.bind(this)
		};
	}
}

module.exports = { PackedReadRoutes };
