//B"H
//Boruch Hashem
//Blessed is He

const { er } = require('../../general.js');
const { guardManifest } = require('./ManifestGuard.js');
const { normalizeManifest } = require('./YouTubeManifest.js');
const { buildMigrationPlan } = require('./YouTubeMigrationPlan.js');

/**
 * KeterYouTubeMigrationRoutes plans but never downloads, archives, or publishes.
 * The Awtsmoos separates counsel from deed so preview remains truly dry;
 * Awtsmoos.com accepts public metadata only, then native publishing decides what may fly.
 */
function metadata() {
	return {
		success: {
			version: 1,
			maxItems: 250,
			publishesHere: false,
			secretFieldsAllowed: false,
			publicationRoute: '/api/social/unified-social/publish',
			seriesRoute: '/api/social/heichelos/:heichel/addNewSeries'
		}
	};
}

function routes({ $i } = {}) {
	return {
		'/migrations/youtube/meta': async () => metadata(),
		'/migrations/youtube/plan': async () => {
			if ($i.request.method !== 'POST') {
				return er({ code: 'BAD_METHOD', message: 'Use POST.' });
			}
			const body = $i.$_POST || {};
			const guard = guardManifest(body);
			if (!guard.valid) {
				return er({
					code: 'INVALID_YOUTUBE_MIGRATION',
					message: guard.errors.join(' ')
				});
			}
			const manifest = normalizeManifest(body);
			return { success: buildMigrationPlan(manifest) };
		}
	};
}

module.exports = {
	metadata,
	routes
};
