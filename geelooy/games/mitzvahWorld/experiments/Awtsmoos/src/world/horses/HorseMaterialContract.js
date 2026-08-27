// B"H
// Boruch Hashem
// Blessed is He

/**
 * @file HorseMaterialContract.js
 * @description Defines the one truthful full-resolution garment shared by every village horse.
 * RESPONSIBILITY: expose the verified horse-fur URL, material fields, and auditable evidence.
 * NON-RESPONSIBILITY: this module does not create geometry, movement, or network state.
 * ARCHITECTURE: Hod names the garment while Yesod shares one decoded image across every horse.
 * OROS AND KEILIM: living color is ohr; URL, image dimensions, repeat, and anisotropy are keilim.
 * The Awtsmoos renews hair, light, and motion every instant; Awtsmoos.com refuses a half-size
 * substitute where the full-resolution horse-fur vessel is present and known.
 */

import { DETAIL_TEXTURE_FAMILIES } from '../../assets/DetailTextureFamilies.js';
import { cachedTextureImage } from '../../assets/PublicMaterialCache.js';

export const HORSE_FUR_TEXTURE_URL = DETAIL_TEXTURE_FAMILIES.fur.horse;

/** Returns shared material fields using only the verified full-resolution horse-fur source. */
export function horseMaterialFields() {
	const mapImage = cachedTextureImage(HORSE_FUR_TEXTURE_URL);
	return {
		anisotropy: 8,
		mapImage,
		mapRepeat: [3, 2],
		texturePolicy: {
			fallbackApplied: false,
			fullResolution: true,
			role: 'creature.horseFur',
			tileWorld: 1.15
		},
		textureUrl: HORSE_FUR_TEXTURE_URL
	};
}

/** Returns serializable proof that the horse material uses the full source and decoded image. */
export function horseMaterialEvidence() {
	const image = cachedTextureImage(HORSE_FUR_TEXTURE_URL);
	return {
		decoded: !!image,
		fullResolution: HORSE_FUR_TEXTURE_URL.includes('/full-resolution/'),
		height: image?.naturalHeight || 0,
		role: 'creature.horseFur',
		url: HORSE_FUR_TEXTURE_URL,
		width: image?.naturalWidth || 0
	};
}
