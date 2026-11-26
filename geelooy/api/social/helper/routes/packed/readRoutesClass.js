//B"H
//Blessed is He
//Boruch Hashem

/**
 * PackedReadRoutes core: constructor, stats, snapshot, integrity and the route map (split from readRoutes.js).
 */

const { allShardStatsAsync } = require('../../packed/socialPacked.js');
const { exportPackedSnapshot } = require('../../packed/snapshot.js');
const { scanPackedIntegrity } = require('../../packed/repairScanner.js');
const { badRequest, notFound, requireMethod, serverError } = require('../apiHttp.js');

// B"H 2026-11-26: shared shard-stats memo (see stats() below).
const STATS_TTL_MS = 5 * 60 * 1000;
let statsMemo = null;
let statsInFlight = null;

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
		// B"H 2026-11-26: the scan streams every shard (core alone > 2 GiB),
		// so on a busy disk one answer costs minutes — and the platform
		// panel's DB tool sat on "loading db" while every click started
		// ANOTHER full scan. The route now shares a single in-flight scan
		// across concurrent callers and serves the last completed answer
		// for STATS_TTL_MS. Shard stats are store-global (never per-user),
		// so the shared answer is the same truth every reader would scan.
		try {
			if (statsMemo && (Date.now() - statsMemo.at) < STATS_TTL_MS) {
				return { success: statsMemo.value };
			}
			if (!statsInFlight) {
				statsInFlight = allShardStatsAsync({ $i: this.$i })
					.then(value => {
						statsMemo = { at: Date.now(), value };
						return value;
					})
					.finally(() => { statsInFlight = null; });
			}
			return { success: await statsInFlight };
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
