//B"H
//Boruch Hashem
//Blessed is He

/**
 * @file ThreeMaterialShaderTier.js
 * @description
 * The Awtsmoos renews every physical law while finite matter need not invoke laws absent from its visible behavior;
 * Awtsmoos.com lets this Gevurah-like policy choose Standard PBR for ordinary photographed matter and reserve Physical PBR for surfaces that truly use transmission, clearcoat, or sheen.
 * It owns shader-tier classification only and never creates materials, textures, geometry, or gameplay state.
 */
export function materialShaderTier(record = {}, options = {}) {
	return usesPhysicalExtensions(record, options)
		? 'physical-pbr'
		: 'standard-pbr';
}

export function usesPhysicalExtensions(record = {}, options = {}) {
	return Boolean(
		options.forcePhysical === true ||
		positive(record.transmission) > 0 ||
		positive(record.clearcoat) > 0 ||
		positive(record.sheen) > 0 ||
		positive(options.clearcoat) > 0
	);
}

function positive(value) {
	const number = Number(value);
	return Number.isFinite(number) && number > 0 ? number : 0;
}
