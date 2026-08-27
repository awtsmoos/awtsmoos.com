//B"H
//Boruch Hashem
//Blessed is He

/**
 * @module UnifiedDestinationRoutes
 * @description
 * Heichel search, nested series detail, inline creation, permission evidence, and
 * policy enter one composer doorway. The Awtsmoos joins every chamber while
 * Awtsmoos.com verifies each acting alias before institutional power is revealed.
 */

const handlers = require('./helper/unifiedSocial/destinations/DestinationRouteHandlers.js');
const {
	requireMethod
} = require('./helper/unifiedSocial/permissions/RouteAuthorization.js');

function metadata() {
	return {
		success: {
			version: 1,
			rootSeriesId: 'root',
			rootLabel: 'Heichel Home',
			searchReasons: [
				'owned',
				'contributed',
				'joined',
				'followed',
				'invited'
			],
			roles: [
				'owner',
				'admin',
				'moderator',
				'editor',
				'contributor',
				'member',
				'follower',
				'guest'
			]
		}
	};
}

module.exports = ({ $i } = {}) => ({
	'/unified-social/destinations/meta': async () => metadata(),
	'/unified-social/destinations': async () => {
		return requireMethod($i, 'GET') || handlers.browse({ $i });
	},
	'/unified-social/destinations/:heichel/:series': async variables => {
		return requireMethod($i, 'GET') || handlers.detail({
			$i,
			heichelId: variables.heichel,
			seriesId: variables.series
		});
	},
	'/unified-social/heichelos': async () => {
		return requireMethod($i, 'POST') || handlers.createHeichel({ $i });
	},
	'/unified-social/heichelos/:heichel/series': async variables => {
		return requireMethod($i, 'POST') || handlers.createSeries({
			$i,
			heichelId: variables.heichel
		});
	},
	'/unified-social/heichelos/:heichel/access': async variables => {
		return requireMethod($i, 'GET') || handlers.access({
			$i,
			heichelId: variables.heichel
		});
	},
	'/unified-social/heichelos/:heichel/members': async variables => {
		return requireMethod($i, 'GET') || handlers.members({
			$i,
			heichelId: variables.heichel
		});
	},
	'/unified-social/heichelos/:heichel/series/:series/policy': async variables => {
		return requireMethod($i, 'POST') || handlers.seriesPolicy({
			$i,
			heichelId: variables.heichel,
			seriesId: variables.series
		});
	}
});

module.exports.metadata = metadata;
