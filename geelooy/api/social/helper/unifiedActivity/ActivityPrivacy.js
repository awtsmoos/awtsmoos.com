//B"H
//Boruch Hashem
//Blessed is He

/**
 * @module ActivityPrivacy
 * @description
 * Activity visibility is evaluated at read time against owner identity, selected
 * aliases, public scope, or real Heichel membership. The Awtsmoos sees every road;
 * Awtsmoos.com reveals only the road garment its owner deliberately chose to share.
 */

const { compileAccess } = require('../unifiedSocial/permissions/PermissionCompiler.js');

function ownerMayRead(ownerAliasId, viewerAliasId) {
	return Boolean(ownerAliasId && ownerAliasId === viewerAliasId);
}

function selectedMayRead(event, viewerAliasId) {
	return event.visibility?.mode === 'selected'
		&& event.visibility.aliases?.includes(viewerAliasId);
}

async function heichelMayRead({ $i, event, viewerAliasId }) {
	if (event.visibility?.mode !== 'heichel') return false;
	const heichelId = event.visibility.heichelId || event.entity?.heichelId;
	if (!heichelId || !viewerAliasId) return false;
	const access = await compileAccess({
		$i,
		heichelId,
		seriesId: event.entity?.seriesId || 'root',
		aliasId: viewerAliasId
	});
	return access.role !== 'guest';
}

async function mayReadEvent({ $i, event, ownerAliasId, viewerAliasId = '' }) {
	if (!event || event.deleted) return false;
	if (ownerMayRead(ownerAliasId, viewerAliasId)) return true;
	if (event.visibility?.mode === 'public') return true;
	if (selectedMayRead(event, viewerAliasId)) return true;
	return heichelMayRead({ $i, event, viewerAliasId });
}

async function filterVisibleEvents({ $i, events, ownerAliasId, viewerAliasId = '' }) {
	const visible = [];
	for (const event of events || []) {
		if (await mayReadEvent({ $i, event, ownerAliasId, viewerAliasId })) {
			visible.push(event);
		}
	}
	return visible;
}

module.exports = {
	ownerMayRead,
	selectedMayRead,
	heichelMayRead,
	mayReadEvent,
	filterVisibleEvents
};
