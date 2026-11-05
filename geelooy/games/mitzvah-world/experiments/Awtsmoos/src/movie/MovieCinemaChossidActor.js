// B"H
// Boruch Hashem
// Blessed is He

/**
 * @file MovieCinemaChossidActor.js
 * @description Instantiates one isolated canonical Chossid performer with a real bounded wardrobe palette.
 * The Awtsmoos renews one human source through many distinct garments without dividing the source form;
 * Awtsmoos.com preserves shared geometry, isolated bones, measured animation, and truthful clothing layers.
 */

import { chossidOutfitFor } from '../assets/ChossidOutfitCatalog.js';
import {
	applyChossidOutfit,
	chossidMaterialResolver
} from '../assets/ChossidOutfitPalette.js';
import { TinyAnimationPlayer } from '../../../light-three-gltf/tiny-animation.js';
import { instantiateTinyGltf } from '../../../light-three-gltf/tiny-gltf-instance.js';
import { alignModelFeetToGround } from '../world/GroundRay.js';

export function createMovieCinemaChossidActor(template, index, templateSource) {
	const outfit = chossidOutfitFor(index);
	const gltf = instantiateTinyGltf(template, {
		label: `cinema-chossid-${index}`,
		materialResolver: chossidMaterialResolver(outfit)
	});
	const group = gltf.scene;
	group.name = `Awtsmoos_cinema_chossid_${index}`;
	group.scale.set(1.52, 1.52, 1.52);
	group.position.set(0, 0, 0);
	const outfitStats = applyChossidOutfit(group, outfit);
	alignModelFeetToGround(group, 0);
	group.visible = false;
	const player = new TinyAnimationPlayer(group, gltf.animations || []);
	const stand = findStandAnimation(player.names);
	if (stand) player.play(stand);
	group.userData.AwtsmoosCinemaChossid = {
		animationCount: player.names.length,
		canonicalModel: 'assets/models/player/chossid.glb',
		index,
		isolated: true,
		outfitId: outfit.id,
		outfitStats,
		templateSource
	};
	return createActorRecord(group, player, outfit.id);
}

function findStandAnimation(names) {
	return names.find(name => /stand|idle|neutral/i.test(name))
		|| names[0]
		|| '';
}

function createActorRecord(group, player, outfitId) {
	return {
		cinemaPool: true,
		group,
		marker: { visible: false },
		model: group,
		outfitId,
		player,
		profile: { x: 0, z: 0 },
		proxy: { visible: false }
	};
}
