//B"H
//Boruch Hashem
//Blessed is He

/**
 * @module ActivityRoutes
 * @description
 * Owner mutations and private reads verify the ledger alias; selected and Heichel
 * sharing verifies the viewer alias. The Awtsmoos sees every journey directly while
 * Awtsmoos.com refuses an unowned public alias string as permission to read history.
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
	ownerAction,
	timeline,
	record,
	clear,
	preferences,
	exportLedger,
	update,
	remove,
	shared
};
