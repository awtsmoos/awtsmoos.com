// B"H
import {
	materialTexture,
	REPEAT_HOOKS
} from '../../assets/TextureRepeat.js';

/**
 * Every material repeats by world measure, so taller walls reveal more stone
 * rather than stretching one remembered image over the renewed architecture.
 */
export function createHouseMaterials(assets = {}) {
	return {
		wall: material('#eee8d9', assets.whiteBrickImage || assets.brickImage, REPEAT_HOOKS.wallTileWorld),
		side: material('#eee8d9', assets.whiteBrickImage || assets.brickImage, REPEAT_HOOKS.wallTileWorld),
		stone: material('#c7bea9', assets.stoneImage, REPEAT_HOOKS.floorTileWorld),
		door: material('#7d4827', assets.woodImage, 2),
		roof: material('#8a5b35', assets.woodImage, REPEAT_HOOKS.roofTileWorld),
		fence: material('#d8c0a0', assets.woodImage, 2),
		mezuza: material('#b58a28', assets.goldImage || assets.woodImage, 0.5)
	};
}

function material(color, image, tileWorld) {
	return materialTexture(color, image, [1, 1], {
		backfaceCull: true,
		tileWorld,
		projection: 'cube-world',
		hook: 'modular-house'
	});
}
