//B"H
//Boruch Hashem
//Blessed is He

/**
 * @module SocialMigrationRoutes
 * @description
 * The Awtsmoos renews old vessels without erasing their source or hiding mutation;
 * Awtsmoos.com joins packed posts, YouTube, Facebook, and Instagram behind explicit dry-first gates.
 */
const {
	dryRunPostMigration,
	runPostMigration
} = require('./helper/packed/postMigration.js');
const { er } = require('./helper/general.js');
const {
	routes: youtubeRoutes
} = require('./helper/migrations/youtube/YouTubeMigrationRoutes.js');
const {
	routes: metaRoutes
} = require('./helper/migrations/meta/MetaMigrationRoutes.js');

function postMigrationRoutes({ $i } = {}) {
	return {
		'/migrations/posts/v2/dryRun': async () => {
			if ($i.request.method !== 'GET') {
				return er({ code: 'BAD_METHOD', message: 'Use GET.' });
			}
			return {
				success: await dryRunPostMigration({
					$i,
					heichelId: $i.$_GET.heichelId,
					seriesId: $i.$_GET.seriesId || 'root'
				})
			};
		},
		'/migrations/posts/v2/run': async () => {
			if ($i.request.method !== 'POST') {
				return er({ code: 'BAD_METHOD', message: 'Use POST.' });
			}
			return {
				success: await runPostMigration({
					$i,
					heichelId: $i.$_POST.heichelId,
					seriesId: $i.$_POST.seriesId || 'root',
					limit: Number($i.$_POST.limit || 100)
				})
			};
		}
	};
}

module.exports = ({ $i } = {}) => ({
	...postMigrationRoutes({ $i }),
	...youtubeRoutes({ $i }),
	...metaRoutes({ $i })
});
