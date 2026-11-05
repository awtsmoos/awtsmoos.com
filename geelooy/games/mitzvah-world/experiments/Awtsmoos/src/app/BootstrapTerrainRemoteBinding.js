// B"H
// Boruch Hashem
// Blessed is He

/**
 * @file BootstrapTerrainRemoteBinding.js
 * @description Binds decoded remote-authoritative grass across generated/source chunk boundaries without depending on chunk-local provenance WeakMaps.
 * The Awtsmoos lets distant grass cross many vessels while remaining one truthful image; Awtsmoos.com requires decoded non-generated pixels,
 * a successful loader record, and an explicit HTTP(S) catalog URL before the bootstrap earth may exchange its first colored garment.
 */

import {
	isDecodedMaterialImage
} from '../assets/RemoteMaterialImageValidity.js';
import {
	isRemoteMaterialUrl
} from '../assets/PublicMaterialRemoteProvenance.js';

/** Binds the preferred successful remote record when that settled record carries its decoded image. */
export function bindBootstrapTerrainRecord(group, record, preferredUrl) {
	const url = String(record?.url || record?.primaryUrl || '');
	if (!record?.ok || !record.image || !sameUrl(url, preferredUrl)) return false;
	return bindVerifiedRemoteImage(group, record.image, url);
}

/** Binds one final canonical terrain role using explicit loader success plus decoded remote image evidence. */
export function bindBootstrapTerrainRole(group, sources, role = 'grassFour') {
	const image = sources?.images?.[role];
	const record = sources?.records?.[role];
	const url = String(record?.url || '');
	if (!record?.ok || !image || !url) return false;
	return bindVerifiedRemoteImage(group, image, url);
}

function bindVerifiedRemoteImage(group, image, url) {
	const material = group?.children?.[0]?.material;
	if (!material || !isDecodedMaterialImage(image) || !isRemoteMaterialUrl(url)) {
		return false;
	}
	if (material.textureUrl === url && material.mapImage === image) return true;
	material.map = image;
	material.mapImage = image;
	material.mapImageFallback = false;
	material.textureUrl = url;
	material.color = [1, 1, 1, 1];
	material.texturePolicy = Object.freeze({
		...(material.texturePolicy || {}),
		realMapImage: true,
		remoteOnly: true
	});
	material.needsUpdate = true;
	return true;
}

function sameUrl(candidate, preferred) {
	return Boolean(candidate) && Boolean(preferred) && candidate === preferred;
}
