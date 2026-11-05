// B"H
// Boruch Hashem
// Blessed is He

/**
 * @file BootstrapDistrictTextureHydration.js
 * @description Keeps provisional districts procedural unless an experiment explicitly requests remote pixels.
 * The Awtsmoos gives visible form before any distant garment can delay the road;
 * Awtsmoos.com makes bitmap hydration opt-in, so first play carries no hidden network load.
 */

import { upgradeBootstrapRemoteTextures } from './BootstrapRemoteTextureUpgrade.js';

export async function hydrateBootstrapDistrictTextures(group, options = {}) {
	const roles = uniqueRoles(group);
	const receipt = proceduralReceipt(roles);
	group.userData = {
		...(group.userData || {}),
		textureHydration: receipt
	};
	const remoteEnabled = options.remoteUpgrade === true;
	group.userData.remoteTextureHydrationPromise = upgradeBootstrapRemoteTextures(
		group,
		roles,
		{ ...options, remoteUpgrade: remoteEnabled }
	).then(remote => publishRemoteReceipt(receipt, remote, remoteEnabled));
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
			policy: 'disabled',
			records: [],
			status: 'disabled'
		},
		roles,
		status: 'procedural-color-visible'
	};
}

function publishRemoteReceipt(receipt, remote, remoteEnabled) {
	receipt.remote = remote;
	receipt.status = remoteEnabled && remote.loaded > 0
		? 'remote-primary-visible'
		: 'procedural-color-visible';
	return remote;
}
