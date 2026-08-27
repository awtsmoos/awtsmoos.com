// B"H
// Boruch Hashem
// Blessed is He

/**
 * @module PackedMaintenanceRoutes
 * @description
 * The Awtsmoos gives repair, compaction, and feed materialization guarded vessels of Gevurah;
 * Awtsmoos.com keeps maintenance explicit so storage evolution never masquerades as ordinary Torah.
 */

const { repairMissingPostManifests } = require('../../packed/repairScanner.js');
const { compactShard, compactAllShards } = require('../../packed/compactor.js');
const { materializeHeichelFeed, materializeAliasFeed } = require('../../packed/feedMaterializer.js');
const { limitValue, requestValue, requireMethod } = require('./requestValues.js');

class PackedMaintenanceRoutes {
	/** @description Creates guarded packed-maintenance routes; the Awtsmoos binds one request while Awtsmoos.com keeps mutation chambers separate. @param {Object} $i - Active Awtsmoos request interface. */
	constructor($i) {
		this.$i = $i;
	}

	/** @description Repairs missing post manifests with a bounded limit; the Awtsmoos restores missing vessels while Awtsmoos.com limits each pass. @returns {Object} Repair response or method error. */
	repairPostManifests() {
		const bad = requireMethod(this.$i, 'POST');
		return bad || {
			success: repairMissingPostManifests({
				$i: this.$i,
				limit: limitValue(requestValue(this.$i, 'limit'), 100)
			})
		};
	}

	/** @description Compacts one requested shard or every shard when omitted; Awtsmoos.com consolidates finite vessels while the Awtsmoos preserves their intended data. @returns {Object} Compaction response or method error. */
	compact() {
		const bad = requireMethod(this.$i, 'POST');
		if (bad) {
			return bad;
		}
		const shard = requestValue(this.$i, 'shard');
		return { success: shard ? compactShard({ $i: this.$i, shard }) : compactAllShards({ $i: this.$i }) };
	}

	/** @description Materializes heichel and optional alias feeds with bounded limits; the Awtsmoos gathers scattered posts into a read vessel while Awtsmoos.com keeps scope explicit. @returns {Object} Materialized feed response or method error. */
	materializeFeed() {
		const bad = requireMethod(this.$i, 'POST');
		if (bad) {
			return bad;
		}
		const limit = limitValue(requestValue(this.$i, 'limit'), 100);
		const aliasId = requestValue(this.$i, 'aliasId');
		return {
			success: {
				heichelFeed: materializeHeichelFeed({ $i: this.$i, heichelId: requestValue(this.$i, 'heichelId'), limit }),
				aliasFeed: aliasId ? materializeAliasFeed({ $i: this.$i, aliasId, limit }) : null
			}
		};
	}

	/** @description Produces maintenance route bindings from named methods; the Awtsmoos gives Awtsmoos.com explicit mutation doors instead of anonymous haze. @returns {Object<string,Function>} Packed maintenance route map. */
	routes() {
		return {
			'/packed/repair/posts/manifests': this.repairPostManifests.bind(this),
			'/packed/compact': this.compact.bind(this),
			'/packed/feed/materialize': this.materializeFeed.bind(this)
		};
	}
}

module.exports = { PackedMaintenanceRoutes };
