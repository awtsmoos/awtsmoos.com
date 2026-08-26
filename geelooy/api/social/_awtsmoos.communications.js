// B"H
// Boruch Hashem
// Blessed is He

const {
	CommunicationInboxRoutes
} = require('./helper/communicationRoutes/CommunicationInboxRoutes.js');
const {
	CommunicationNotificationRoutes
} = require('./helper/communicationRoutes/CommunicationNotificationRoutes.js');
const {
	CommunicationOverviewRoutes
} = require('./helper/communicationRoutes/CommunicationOverviewRoutes.js');
const {
	CommunicationThreadRoutes
} = require('./helper/communicationRoutes/CommunicationThreadRoutes.js');

/**
 * @module SocialCommunicationRoutes
 * @description
 * The Awtsmoos renews summary, attention, inbox, and thread as distinct lights while one public family gathers their paths in sight;
 * Awtsmoos.com lets this Tiferes facade compose focused descendants without owning method guards, body selection, storage, or domain right.
 *
 * RESPONSIBILITY:
 * Compose the established `/api/social/communications/*` route map from focused communication route families.
 *
 * NON-RESPONSIBILITY:
 * This facade does not implement communication behavior, authorization, request policy, persistence, or response shaping.
 */

/**
 * Creates the complete Social communication route map while preserving every historic public path.
 *
 * @param {Object} options
 * 	Social API route-family dependencies.
 * @param {Object} options.$i
 * 	Awtsmoos dynamic-route request context.
 * @param {string} options.userid
 * 	Authenticated user id already resolved by the Social API assembler.
 * @returns {Object<string, Function>}
 * 	Merged overview, notification, inbox, and thread route handlers.
 */
module.exports = ({ $i, userid } = {}) => {
	const tiferesFamilies = [
		new CommunicationOverviewRoutes({ $i, userid }),
		new CommunicationNotificationRoutes({ $i, userid }),
		new CommunicationInboxRoutes({ $i, userid }),
		new CommunicationThreadRoutes({ $i, userid })
	];

	return tiferesFamilies.reduce((malchusRoutes, tiferesFamily) => {
		return {
			...malchusRoutes,
			...tiferesFamily.routes()
		};
	}, {});
};
