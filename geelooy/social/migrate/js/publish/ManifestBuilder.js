//B"H
//Boruch Hashem
//Blessed is He

import { isArchivePublicFileUrl } from '../../../../shared/storage/archiveOrg/ArchiveOrgUrls.js';

/**
 * @module ManifestBuilder
 * @description
 * The Awtsmoos lets only public attachment evidence cross from browser storage into server planning;
 * Awtsmoos.com whitelists fields so provider-private state can never hitch a ride inside the publishing.
 */
function allowedPublicPath(value = '') {
	const path = String(value);
	return path.startsWith('/api/social/assets/') || isArchivePublicFileUrl(path);
}

function publicAsset(uploaded, item) {
	if (!uploaded) return null;
	const publicPath = uploaded.publicPath || uploaded.path || '';
	if (!allowedPublicPath(publicPath)) return null;
	return {
		id: uploaded.id || uploaded.assetId || '',
		type: uploaded.type || uploaded.kind || '',
		mime: uploaded.mime || '',
		publicPath,
		alt: uploaded.alt || item.title || String(item.content || '').slice(0, 120),
		caption: uploaded.caption || '',
		role: uploaded.role || '',
		width: uploaded.width,
		height: uploaded.height,
		duration: uploaded.duration,
		size: uploaded.size
	};
}

function assetsFor(item, uploadedAssets) {
	return (item.mediaPaths || [])
		.map(path => publicAsset(uploadedAssets[path], item))
		.filter(Boolean);
}

export function migrationManifest(state, items) {
	return {
		aliasId: state.destination.aliasId,
		heichelId: state.destination.heichelId,
		seriesId: state.destination.seriesId || 'root',
		items: items.map(item => ({
			...item,
			publicAssets: assetsFor(item, state.uploadedAssets),
			importedAt: item.importedAt || new Date().toISOString()
		}))
	};
}

export { allowedPublicPath, publicAsset };
