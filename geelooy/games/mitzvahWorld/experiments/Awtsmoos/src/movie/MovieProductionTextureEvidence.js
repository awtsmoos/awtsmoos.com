// B"H
// Boruch Hashem
// Blessed is He

/** Truthful image and fallback evidence shared by production Movie audits. */
export function realMaterialImages(material) {
	if (!material || materialUsesFallback(material)) return [];
	return imageSlots(material).filter(slot => realImage(material, slot.image, slot.url));
}

export function materialUsesFallback(material) {
	return Boolean(
		material?.mapImageFallback === true
		|| material?.texturePolicy?.fallbackApplied === true
		|| material?.texturePolicy?.proceduralFallbackActive === true
		|| material?.texturePolicy?.semanticFallback === true
		|| imageSlots(material).some(slot => prohibitedSource(material, slot.image, slot.url))
	);
}

export function materialList(material) {
	return (Array.isArray(material) ? material : [material]).filter(Boolean);
}

export function usableImage(image) {
	const source = image?.image || image;
	return Number(source?.naturalWidth || source?.videoWidth || source?.width || 0) > 1
		&& Number(source?.naturalHeight || source?.videoHeight || source?.height || 0) > 1;
}

function imageSlots(material) {
	return [
		slot(material.mapImage, material.textureUrl),
		slot(material.map, material.textureUrl),
		slot(material.mixImage, material.mixTextureUrl),
		slot(material.normalImage, material.normalTextureUrl),
		slot(material.normalDetailImage, material.normalDetailTextureUrl),
		...(material.textureLayers || []).map(layer => slot(layer?.image, layer?.url))
	].filter(item => item.image);
}

function realImage(material, image, url) {
	if (!usableImage(image) || prohibitedSource(material, image, url)) return false;
	const source = image?.image || image;
	const declared = String(url || source?.currentSrc || source?.src || '').trim();
	if (declared) return !declared.startsWith('procedural:');
	return String(source?.tagName || '').toUpperCase() !== 'CANVAS';
}

function prohibitedSource(material, image, url) {
	const source = image?.image || image;
	const values = [url, source?.dataset?.url, source?.currentSrc, source?.src];
	return values.some(value => {
		const text = String(value || '');
		if (text.startsWith('procedural:')) return true;
		if (!text.startsWith('data:')) return false;
		return material?.texturePolicy?.bilingualSvg !== true;
	});
}

function slot(image, url) { return { image, url }; }
