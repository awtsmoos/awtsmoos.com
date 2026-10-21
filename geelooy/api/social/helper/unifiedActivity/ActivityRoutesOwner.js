//B"H
//Blessed is He
//Boruch Hashem


/**
 * @module ActivityRoutesOwner
 * @description
 * Verified-owner activity routes: timeline, record and clear.
 */

const store = require('./ActivityStore.js');
const service = require('./ActivityService.js');
const {
	withVerifiedAlias
} = require('../unifiedSocial/permissions/RouteAuthorization.js');

function ownerAction({ $i, aliasId, action }) {
	return withVerifiedAlias({ $i, aliasId, action });
}

async function timeline({ $i, aliasId }) {
	return ownerAction({
		$i,
		aliasId,
		action: () => service.ownerTimeline({
			$i,
			aliasId,
			limit: $i.$_GET?.limit || 200
		})
	});
}

async function record({ $i, aliasId }) {
	return ownerAction({
		$i,
		aliasId,
		action: () => service.record({
			$i,
			aliasId,
			input: $i.$_POST || {}
		})
	});
}

async function clear({ $i, aliasId }) {
	return ownerAction({
		$i,
		aliasId,
		action: async () => ({
			success: {
				cleared: await store.clearEvents({ $i, aliasId })
			}
		})
	});
}

module.exports = {
	ownerAction,
	timeline,
	record,
	clear
};
