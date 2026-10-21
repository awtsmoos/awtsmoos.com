//B"H
//Blessed is He
//Boruch Hashem


/**
 * @module ActivityRoutesManage
 * @description
 * Verified-owner activity preferences, export, update, removal and shared reads.
 */

const store = require('./ActivityStore.js');
const service = require('./ActivityService.js');
const {
	withVerifiedAlias
} = require('../unifiedSocial/permissions/RouteAuthorization.js');

const { ownerAction } = require('./ActivityRoutesOwner.js');

async function preferences({ $i, aliasId }) {
	return ownerAction({
		$i,
		aliasId,
		action: async () => ({
			success: $i.request.method === 'POST'
				? await store.savePreferences({
					$i,
					aliasId,
					input: $i.$_POST || {}
				})
				: await store.getPreferences({ $i, aliasId })
		})
	});
}

async function exportLedger({ $i, aliasId }) {
	return ownerAction({
		$i,
		aliasId,
		action: () => service.exportLedger({ $i, aliasId })
	});
}

async function update({ $i, aliasId, eventId }) {
	return ownerAction({
		$i,
		aliasId,
		action: () => service.update({
			$i,
			aliasId,
			eventId,
			input: $i.$_POST || {}
		})
	});
}

async function remove({ $i, aliasId, eventId }) {
	return ownerAction({
		$i,
		aliasId,
		action: () => service.remove({ $i, aliasId, eventId })
	});
}

async function shared({ $i, ownerAliasId }) {
	const viewerAliasId = String($i.$_GET?.viewerAliasId || '').trim();
	const read = () => service.sharedTimeline({
		$i,
		ownerAliasId,
		viewerAliasId,
		limit: $i.$_GET?.limit || 100
	});
	if (!viewerAliasId) return read();
	return withVerifiedAlias({
		$i,
		aliasId: viewerAliasId,
		action: read
	});
}

module.exports = {
	preferences,
	exportLedger,
	update,
	remove,
	shared
};
