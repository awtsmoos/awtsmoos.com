// B"H
// Boruch Hashem
// Blessed is He

/**
 * @file BootstrapTerrainRemoteBinding.js
 * @description Replaces bootstrap-generated ground pixels only with decoded remote-authoritative terrain imagery.
 * The Awtsmoos lets the first colored earth hold the foot without pretending it is the final garment;
 * Awtsmoos.com binds distant grass only when its HTTP provenance is real, so fallback light never blocks revealed texture.
 */

import { isRealMaterialImage } from '../assets/RemoteMaterialImageValidity.js';

/** Binds the preferred successful remote record to the visible bootstrap grass material. */
export function bindBootstrapTerrainRecord(group, record, preferredUrl) {
	const url = String(record?.url || record?.primaryUrl || '');
	if (!record?.ok || !record.image || !sameUrl(url, preferredUrl)) {
		return false;
	}
	return bindRemoteImage(group, record.image, url);
}

/** Binds the final preferred remote role after the complete terrain batch settles. */
export function bindBootstrapTerrainRole(group, sources, role = 'grassFour') {
	const image = sources?.images?.[role];
	const url = sources?.records?.[role]?.url || '';
	if (!image || !url) return false;
	return bindRemoteImage(group, image, url);
}

function bindRemoteImage(group, image, url) {
	const material = group?.children?.[0]?.material;
	if (!material || !isRealMaterialImage(image)) return false;
	if (material.textureUrl === url && isRealMaterialImage(material.mapImage)) {
		return true;
	}
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
