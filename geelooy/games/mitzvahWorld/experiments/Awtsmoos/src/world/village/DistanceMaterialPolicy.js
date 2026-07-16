// B"H
/** Full-resolution Firebase cottage materials with deterministic village variation. */
import { fullTextureUrl } from '../../assets/TextureCatalog.js';

const STONE = Object.freeze([
	'weathered fieldstone Rock 1',
	'limestone bricks 1',
	'weathered Red bricks 1',
	'white brick 1'
]);
const ROOF = Object.freeze([
	'tiled roof 3 smaller tiles',
	'tiled roof 2',
	'tiled roof 4',
	'oak wood 1'
]);
const WOOD = Object.freeze(['oak wood 3', 'oak wood 2', 'wooden oak planks 1']);

export function villageMaterialPolicy(detail = 'near', variant = 0) {
	const safeVariant = Math.abs(Number(variant) || 0);
	return Object.freeze({
		anisotropy: detail === 'near' ? 7 : detail === 'medium' ? 5 : 3,
		roof: fullTextureUrl(ROOF[safeVariant % ROOF.length]),
		stone: fullTextureUrl(STONE[safeVariant % STONE.length]),
		wood: fullTextureUrl(WOOD[safeVariant % WOOD.length]),
		texturePolicy: Object.freeze({
			distanceSelected: true,
			fullResolutionSource: true,
			publicFirebase: true,
			tileWorld: detail === 'near' ? 1.25 : detail === 'medium' ? 1.9 : 2.8,
			variant: safeVariant
		})
	});
}
