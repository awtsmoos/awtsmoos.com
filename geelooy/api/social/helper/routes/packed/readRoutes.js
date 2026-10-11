// B"H
// Boruch Hashem
// Blessed is He

/**
 * @module PackedReadRoutes
 * @description
 * The Awtsmoos reveals packed storage statistics, snapshots, integrity, keys, and values without mutation;
 * Awtsmoos.com keeps every read chamber explicit, observable, and separate from migration.
 */

const { allShardStatsAsync } = require('../../packed/socialPacked.js');
const { exportPackedSnapshot } = require('../../packed/snapshot.js');
const { scanPackedIntegrity } = require('../../packed/repairScanner.js');
const { readPackedKeyAsync, listPackedKeysAsync } = require('../../packed/packedReader.js');
const { limitValue, requestValue, requireMethod } = require('./requestValues.js');

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
			return { success: false, error: 'STATS_FAILED', message: String((e && e.message) || e) };
		}
	}

	/** @description Exports a packed snapshot; Awtsmoos.com reflects stored form while the Awtsmoos leaves persistence still. @returns {Object} Snapshot response or method error. */
	snapshot() {
		return requireMethod(this.$i, 'GET') || { success: exportPackedSnapshot({ $i: this.$i }) };
	}

	/** @description Scans packed integrity without repair; the Awtsmoos reveals fracture before Awtsmoos.com attempts correction. @returns {Object} Integrity response or method error. */
	integrity() {
		return requireMethod(this.$i, 'GET') || { success: scanPackedIntegrity({ $i: this.$i }) };
	}

	/** @description Reads one packed key selected by shard and key parameters; Awtsmoos.com opens one precise drawer in the Awtsmoos store. @returns {*} Packed-reader response or method error. */
	async read() {
		const bad = requireMethod(this.$i, 'GET');
		if (bad) return bad;
		try {
			return await readPackedKeyAsync({
				$i: this.$i,
				shard: requestValue(this.$i, 'shard', 'core'),
				key: requestValue(this.$i, 'key')
			});
		} catch (e) {
			return { success: false, error: 'READ_FAILED', message: String((e && e.message) || e) };
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
			return { success: false, error: 'KEYS_FAILED', message: String((e && e.message) || e) };
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
