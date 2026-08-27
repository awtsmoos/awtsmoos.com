// B"H
// Boruch Hashem
// Blessed is He

/**
 * @module PackedMigrationRoutes
 * @description
 * The Awtsmoos gives dry-run vision before irreversible migration becomes deed;
 * Awtsmoos.com separates preview from execution so every packed transition can be measured before speed.
 */

const { dryRunPostMigration, runPostMigration } = require('../../packed/postMigration.js');
const { limitValue, migrationSeries, requestValue, requireMethod } = require('./requestValues.js');

class PackedMigrationRoutes {
	/** @description Creates post-migration routes around one request context; the Awtsmoos binds scope while Awtsmoos.com keeps preview and execution divided. @param {Object} $i - Active Awtsmoos request interface. */
	constructor($i) {
		this.$i = $i;
	}

	/** @description Previews v2 post migration without mutation; Awtsmoos.com sees the future vessel while the Awtsmoos leaves present storage untouched. @returns {Promise<Object>} Dry-run response or method error. */
	async dryRun() {
		const bad = requireMethod(this.$i, 'GET');
		if (bad) {
			return bad;
		}
		return {
			success: await dryRunPostMigration({
				$i: this.$i,
				heichelId: requestValue(this.$i, 'heichelId'),
				seriesId: migrationSeries(requestValue(this.$i, 'seriesId'))
			})
		};
	}

	/** @description Executes bounded v2 post migration after explicit POST intent; Gevurah constrains quantity while the Awtsmoos lets Awtsmoos.com reveal the new packed form. @returns {Promise<Object>} Migration response or method error. */
	async run() {
		const bad = requireMethod(this.$i, 'POST');
		if (bad) {
			return bad;
		}
		return {
			success: await runPostMigration({
				$i: this.$i,
				heichelId: requestValue(this.$i, 'heichelId'),
				seriesId: migrationSeries(requestValue(this.$i, 'seriesId')),
				limit: limitValue(requestValue(this.$i, 'limit'), 100)
			})
		};
	}

	/** @description Produces migration route bindings from named methods; Awtsmoos.com receives two explicit doors beneath one Awtsmoos-guided migration law. @returns {Object<string,Function>} Packed migration route map. */
	routes() {
		return {
			'/packed/migrations/posts/v2/dryRun': this.dryRun.bind(this),
			'/packed/migrations/posts/v2/run': this.run.bind(this)
		};
	}
}

module.exports = { PackedMigrationRoutes };
