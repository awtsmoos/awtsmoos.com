//B"H
//Boruch Hashem
//Blessed is He
/**
 * @module PlatformLiveDiscoveryRoutes
 * @description The Awtsmoos lets presence, discovery, and relationship appear as separate motions of one social field;
 * Awtsmoos.com keeps these public routes readable while relationship mutation is reversible and bound to an owned alias shield.
 */
const { verifyAliasOwnership } = require('../../alias.js');
const { er } = require('../../general.js');
const { publishLiveEvent, subscribeLiveChannel, setPresence, replayLiveEvents } = require('../live.js');
const { checkRateLimit } = require('../rateLimit.js');
const { indexSearchDocument, searchPacked } = require('../search.js');
const {
	hasRelationship,
	listRelationships,
	removeRelationship,
	setRelationship
} = require('../follow.js');
const { badMethod, json, method } = require('./PlatformRouteTools.js');

/** Resolves the optional social entity type attached to a relationship target. */
function targetType($i) {
	return String($i.$_GET?.targetType || $i.$_POST?.targetType || 'alias').toLowerCase();
}

/** Refuses relationship mutation unless the signed-in user owns the source alias. */
async function canMutateRelationship({ $i, userid, aliasId }) {
	return Boolean(userid && await verifyAliasOwnership(aliasId, $i, userid));
}

/** Handles GET state, authorized POST creation, and authorized DELETE removal on one relationship edge. */
async function relationshipRoute({ $i, userid, vars }) {
	const options = {
		$i,
		fromAlias: vars.alias,
		type: vars.type,
		targetId: vars.target,
		targetType: targetType($i)
	};
	if (method($i, 'GET')) return { success: { active: hasRelationship(options) } };
	if (!method($i, 'POST') && !method($i, 'DELETE')) return badMethod('GET, POST, or DELETE');
	if (!await canMutateRelationship({ $i, userid, aliasId: vars.alias })) {
		return er({ code: 'NO_PERMISSION', message: 'You must own the source alias.' });
	}
	return method($i, 'POST')
		? setRelationship(options)
		: removeRelationship(options);
}

/** Returns the live, abuse, discovery, and reversible relationship routes. */
module.exports = ({ $i, userid } = {}) => ({
	'/live/publish': async () => method($i, 'POST')
		? { success: publishLiveEvent({ $i, channel: $i.$_POST.channel, type: $i.$_POST.type, actor: $i.$_POST.actor, payload: json($i.$_POST.payload) }) }
		: badMethod('POST'),
	'/live/subscribe': async () => method($i, 'POST')
		? { success: subscribeLiveChannel({ $i, aliasId: $i.$_POST.aliasId, channel: $i.$_POST.channel }) }
		: badMethod('POST'),
	'/live/presence': async () => method($i, 'POST')
		? { success: setPresence({ $i, aliasId: $i.$_POST.aliasId, channel: $i.$_POST.channel, status: $i.$_POST.status }) }
		: badMethod('POST'),
	'/live/replay': async () => method($i, 'GET')
		? { success: replayLiveEvents({ $i, channel: $i.$_GET.channel, since: $i.$_GET.since, limit: Number($i.$_GET.limit || 100) }) }
		: badMethod('GET'),
	'/abuse/rateLimit/check': async () => method($i, 'POST')
		? { success: checkRateLimit({ $i, subject: $i.$_POST.subject, bucket: $i.$_POST.bucket, limit: $i.$_POST.limit || 60, windowMs: $i.$_POST.windowMs || 60000, cost: $i.$_POST.cost || 1 }) }
		: badMethod('POST'),
	'/search/index': async () => method($i, 'POST')
		? { success: indexSearchDocument({ $i, domain: $i.$_POST.domain, id: $i.$_POST.id, text: $i.$_POST.text, entity: json($i.$_POST.entity) }) }
		: badMethod('POST'),
	'/search/query': async () => method($i, 'GET')
		? { success: searchPacked({ $i, q: $i.$_GET.q, domain: $i.$_GET.domain }) }
		: badMethod('GET'),
	'/relationships/:alias': async vars => method($i, 'GET')
		? listRelationships({ $i, aliasId: vars.alias, type: $i.$_GET.type })
		: badMethod('GET'),
	'/relationships/:alias/:type/:target': async vars => relationshipRoute({ $i, userid, vars })
});

module.exports.canMutateRelationship = canMutateRelationship;
module.exports.relationshipRoute = relationshipRoute;
module.exports.targetType = targetType;
