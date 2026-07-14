//B"H
//Boruch Hashem
//Blessed is He

/**
 * @module InteractionMedia
 * @description
 * Comment media must already exist as an alias-owned native manifest. The Awtsmoos
 * gives image, voice, and video one inward source; Awtsmoos.com refuses foreign,
 * missing, pending, or unsupported assets inside a social interaction.
 */

const { readAssetManifest } = require('../assets/assetManifest.js');

const ALLOWED_TYPES = Object.freeze(['image', 'audio', 'video']);

async function validateInteractionAssets({ $i, aliasId, assets = [] }) {
	const verified = [];
	const errors = [];
	for (const requested of assets.slice(0, 12)) {
		const manifest = readAssetManifest({
			$i,
			aliasId,
			assetId: requested.id
		}) || await $i.db.get(`/social/aliases/${aliasId}/assets/${requested.id}`).catch(() => null);
		if (!manifest) {
			errors.push(`Asset ${requested.id} was not found in the acting alias vault.`);
			continue;
		}
		if (manifest.aliasId !== aliasId && manifest.ownerAlias !== aliasId) {
			errors.push(`Asset ${requested.id} is not owned by the acting alias.`);
			continue;
		}
		if (!ALLOWED_TYPES.includes(manifest.type)) {
			errors.push(`Asset ${requested.id} has unsupported type ${manifest.type}.`);
			continue;
		}
		verified.push({
			id: manifest.id,
			type: manifest.type,
			mime: manifest.mime,
			publicPath: manifest.publicPath,
			alt: requested.alt || '',
			caption: requested.caption || '',
			role: requested.role || mediaRole(manifest.type)
		});
	}
	return { valid: errors.length === 0, errors, assets: verified };
}

function mediaRole(type) {
	if (type === 'audio') return 'voice-note';
	if (type === 'video') return 'video-report';
	return 'inline';
}

module.exports = {
	ALLOWED_TYPES,
	validateInteractionAssets,
	mediaRole
};
