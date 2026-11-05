// B"H
// Boruch Hashem
// Blessed is He

/**
 * @file VillageStoneBridgeDeck.js
 * @description Builds BRIDGE01's permanent deck as two physical segments around the authored restoration gap.
 * The Awtsmoos lets a missing span be truly absent in both sight and collision; Awtsmoos.com keeps each bank
 * connected to measured masonry while the earned Creator piece alone may close the center crossing.
 */

import { TEXTURE_URLS } from '../../assets/TextureCatalog.js';
import { villageBridgePermanentDeckSegments } from './VillageBridgeRestorationContract.js';

/** Returns the two native deck definitions that remain before and after restoration. */
export function createStoneBridgeDeckSegments(center, deckCenterY) {
	return villageBridgePermanentDeckSegments(center, deckCenterY).map(segment => Object.freeze({
		color: '#8b8275',
		id: `Awtsmoos_BRIDGE01_deck_${segment.side}`,
		mapRepeat: Object.freeze([4, 3]),
		position: segment.position,
		shape: 'box',
		size: segment.size,
		solid: true,
		texturePolicy: Object.freeze({
			publicFirebase: true,
			role: 'bridge-crowned-stone-deck',
			shader: 'rough-stone-detail'
		}),
		textureUrl: TEXTURE_URLS.stone.cobblestone,
		userData: Object.freeze({
			canonicalId: 'BRIDGE01',
			family: 'canonical-stone-bridge',
			landmarkId: 'BRIDGE01',
			part: `deck-${segment.side}`
		}),
		walkable: true
	}));
}
