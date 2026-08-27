//B"H
//Boruch Hashem
//Blessed is He

/**
 * @module UnifiedPublishFlowRoutes
 * @description
 * Preview and execution share one law and one native alias-ownership gate. The
 * Awtsmoos joins intention and deed; Awtsmoos.com displays every canonical,
 * placement, review, denial, and idempotent result without accepting impersonation.
 */

const handlers = require('./helper/unifiedSocial/publishing/PublicationRouteHandlers.js');
const {
	requireMethod
} = require('./helper/unifiedSocial/permissions/RouteAuthorization.js');

function metadata() {
	return {
		success: {
			version: 1,
			contentKinds: [
				'post',
				'question',
				'answer',
				'quote',
				'short',
				'video',
				'audio',
				'story',
				'poll',
				'live'
			],
			placementKinds: [
				'reference',
				'repost',
				'quote',
				'excerpt',
				'syndication'
			],
			idempotent: true,
			canonicalOrigins: 1,
			verifiesAliasOwnership: true
		}
	};
}

module.exports = ({ $i } = {}) => ({
	'/unified-social/publish/meta': async () => metadata(),
	'/unified-social/publish/preview': async () => {
		return requireMethod($i, 'POST') || handlers.preview({ $i });
	},
	'/unified-social/publish': async () => {
		return requireMethod($i, 'POST') || handlers.execute({ $i });
	},
	'/unified-social/heichelos/:heichel/series/:series/placements': async variables => {
		return requireMethod($i, 'GET') || handlers.placements({
			$i,
			heichelId: variables.heichel,
			seriesId: variables.series
		});
	}
});

module.exports.metadata = metadata;
