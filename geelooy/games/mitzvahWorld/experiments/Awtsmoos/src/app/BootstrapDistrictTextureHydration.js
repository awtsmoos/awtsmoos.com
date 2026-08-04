// B"H
// Boruch Hashem
// Blessed is He

/**
 * @file BootstrapDistrictTextureHydration.js
 * @description Keeps immediate procedural color visible while canonical remote textures hydrate asynchronously.
 * The Awtsmoos grants each house, tree, stone, and field a truthful hue before distant pixels arrive;
 * Awtsmoos.com stores no texture garment in Git and records every remote binding or finite failure alive.
 */

import { upgradeBootstrapRemoteTextures } from './BootstrapRemoteTextureUpgrade.js';

export async function hydrateBootstrapDistrictTextures(group, options = {}) {
	const roles = uniqueRoles(group);
	const receipt = proceduralReceipt(roles);
	group.userData = {
		...(group.userData || {}),
		textureHydration: receipt
	};
	group.userData.remoteTextureHydrationPromise = upgradeBootstrapRemoteTextures(
		group,
		roles,
		{
			...options,
			remoteUpgrade: options.remoteUpgrade !== false
		}
	).then(remote => publishRemoteReceipt(receipt, remote));
	return receipt;
}

function uniqueRoles(group) {
	return [...new Set(group.userData?.textureRoles || [])].filter(Boolean);
}

function proceduralReceipt(roles) {
	return {
		failed: 0,
		loaded: 0,
		mapImagesBound: 0,
		records: roles.map(role => ({
			bound: 0,
			error: null,
			loaded: false,
			role,
			selectedUrl: null,
			source: 'procedural-color',
			usedLocalFallback: false
		})),
		remote: {
			loaded: 0,
			mapImagesBound: 0,
			records: [],
			status: 'pending'
		},
		roles,
		status: 'procedural-color-visible'
	};
}

function publishRemoteReceipt(receipt, remote) {
	receipt.remote = remote;
	if (remote.loaded > 0) receipt.status = 'remote-primary-visible';
	else receipt.status = 'procedural-color-visible';
	return remote;
}
