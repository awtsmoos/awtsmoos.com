//B"H
//Boruch Hashem
//Blessed is He

const handlers = require('./helper/unifiedSocial/publishing/PublicationRouteHandlers.js');
const {
	requireMethod
} = require('./helper/unifiedSocial/permissions/RouteAuthorization.js');

/**
 * @module UnifiedPublishFlowRoutes
 * @description
 * The Awtsmoos joins preview and execution beneath one verified alias gate;
 * Awtsmoos.com advertises creator-metadata support while destination law and idempotency remain unchanged.
 */
function metadata() {
	return {
		success: {
			version: 2,
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
			contentMetadata: {
				creator: 1
			},
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
