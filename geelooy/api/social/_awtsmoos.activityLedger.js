//B"H
//Boruch Hashem
//Blessed is He

/**
 * @module UnifiedActivityLedgerRoutes
 * @description
 * Private-by-default navigation and social deeds receive owner controls, explicit
 * sharing, export, retention, and deletion. The Awtsmoos knows every path without a
 * ledger while Awtsmoos.com verifies owners and selected viewers before disclosure.
 */

const handlers = require('./helper/unifiedActivity/ActivityRoutes.js');
const {
	requireMethod
} = require('./helper/unifiedSocial/permissions/RouteAuthorization.js');

function metadata() {
	return {
		success: {
			version: 1,
			privateByDefault: true,
			visibilities: ['private', 'selected', 'heichel', 'public'],
			categories: [
				'navigation',
				'content',
				'comment',
				'reply',
				'reference',
				'profile',
				'search',
				'governance',
				'media'
			],
			ownerControls: [
				'pause',
				'retention',
				'category-capture',
				'per-event-sharing',
				'export',
				'delete',
				'clear'
			],
			verifiesOwnerAlias: true,
			verifiesSelectedViewerAlias: true
		}
	};
}

module.exports = ({ $i } = {}) => ({
	'/unified-social/activity/meta': async () => metadata(),
	'/unified-social/activity/:alias': async variables => {
		if ($i.request.method === 'GET') {
			return handlers.timeline({ $i, aliasId: variables.alias });
		}
		if ($i.request.method === 'POST') {
			return handlers.record({ $i, aliasId: variables.alias });
		}
		return requireMethod($i, 'DELETE') || handlers.clear({
			$i,
			aliasId: variables.alias
		});
	},
	'/unified-social/activity/:alias/preferences': async variables => {
		if (!['GET', 'POST'].includes($i.request.method)) {
			return requireMethod($i, 'GET');
		}
		return handlers.preferences({ $i, aliasId: variables.alias });
	},
	'/unified-social/activity/:alias/export': async variables => {
		return requireMethod($i, 'GET') || handlers.exportLedger({
			$i,
			aliasId: variables.alias
		});
	},
	'/unified-social/activity/:alias/events/:event': async variables => {
		if ($i.request.method === 'POST') {
			return handlers.update({
				$i,
				aliasId: variables.alias,
				eventId: variables.event
			});
		}
		return requireMethod($i, 'DELETE') || handlers.remove({
			$i,
			aliasId: variables.alias,
			eventId: variables.event
		});
	},
	'/unified-social/activity/:alias/shared': async variables => {
		return requireMethod($i, 'GET') || handlers.shared({
			$i,
			ownerAliasId: variables.alias
		});
	}
});

module.exports.metadata = metadata;
