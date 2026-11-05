// B"H
// Boruch Hashem
// Blessed is He

/**
 * @file VillageBridgeRestorationDefinition.js
 * @description Creates the one persistent Creator-compatible primitive that closes BRIDGE01's authored repair gap.
 * The Awtsmoos joins earned stone to the exact missing measure; Awtsmoos.com gives that deed one visible mesh,
 * one physical collider set, and one semantic identity that survives reload without duplicating the native bridge.
 */

import { TEXTURE_URLS } from '../../assets/TextureCatalog.js';
import {
	BRIDGE_RESTORATION_PART_ID,
	villageBridgeRestorationPlacement
} from './VillageBridgeRestorationContract.js';

/** Returns the canonical box definition consumed by Creator document and runtime adapters. */
export function createVillageBridgeRestorationDefinition() {
	const placement = villageBridgeRestorationPlacement();
	return Object.freeze({
		color: '#8b8275',
		id: BRIDGE_RESTORATION_PART_ID,
		mapRepeat: Object.freeze([3, 3]),
		position: placement.position,
		rotation: Object.freeze({ y: 0 }),
		shape: 'box',
		size: placement.size,
		solid: true,
		texturePolicy: Object.freeze({
			publicFirebase: true,
			role: 'bridge-restoration-stone-deck',
			shader: 'rough-stone-detail'
		}),
		textureUrl: TEXTURE_URLS.stone.cobblestone,
		userData: Object.freeze({
			AwtsmoosCreatorPart: 'stone-platform',
			canonicalId: 'BRIDGE01',
			family: 'canonical-stone-bridge',
			part: 'restoration-center-span',
			restorationTarget: 'village-bridge-restoration'
		}),
		walkable: true
	});
}
