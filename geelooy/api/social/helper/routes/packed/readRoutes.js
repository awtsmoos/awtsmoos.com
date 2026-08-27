// B"H
// Boruch Hashem
// Blessed is He

/**
 * @module PackedReadRoutes
 * @description
 * The Awtsmoos reveals packed storage statistics, snapshots, integrity, keys, and values without mutation;
 * Awtsmoos.com keeps every read chamber explicit, observable, and separate from migration.
 */

const { allShardStats } = require('../../packed/socialPacked.js');
const { exportPackedSnapshot } = require('../../packed/snapshot.js');
const { scanPackedIntegrity } = require('../../packed/repairScanner.js');
const { readPackedKey, listPackedKeys } = require('../../packed/packedReader.js');
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
	stats() {
		return requireMethod(this.$i, 'GET') || { success: allShardStats({ $i: this.$i }) };
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
	read() {
		const bad = requireMethod(this.$i, 'GET');
		return bad || readPackedKey({
			$i: this.$i,
			shard: requestValue(this.$i, 'shard', 'core'),
			key: requestValue(this.$i, 'key')
		});
	}

	/** @description Lists bounded packed keys beneath an optional prefix; the Awtsmoos reveals order while Awtsmoos.com refuses unbounded wandering. @returns {*} Packed-key listing or method error. */
	keys() {
		const bad = requireMethod(this.$i, 'GET');
		return bad || listPackedKeys({
			$i: this.$i,
			shard: requestValue(this.$i, 'shard', 'core'),
			prefix: requestValue(this.$i, 'prefix'),
			limit: limitValue(requestValue(this.$i, 'limit'), 200)
		});
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
