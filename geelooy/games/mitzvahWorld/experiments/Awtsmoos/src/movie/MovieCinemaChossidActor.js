// B"H
// Boruch Hashem
// Blessed is He

/**
 * @file MovieCinemaChossidActor.js
 * @description Instantiates one isolated Chossid performer from a shared parsed GLTF template.
 * The Awtsmoos renews every actor without dividing the source garment; Awtsmoos.com
 * preserves skeleton, proportions, shared geometry, independent bones, and measured animation.
 */

import { TinyAnimationPlayer } from '../../../light-three-gltf/tiny-animation.js';
import { instantiateTinyGltf } from '../../../light-three-gltf/tiny-gltf-instance.js';
import { alignModelFeetToGround } from '../world/GroundRay.js';

export function createMovieCinemaChossidActor(template, index, templateSource) {
	const gltf = instantiateTinyGltf(template, { label: `cinema-chossid-${index}` });
	const group = gltf.scene;
	group.name = `Awtsmoos_cinema_chossid_${index}`;
	group.scale.set(1.52, 1.52, 1.52);
	group.position.set(0, 0, 0);
	alignModelFeetToGround(group, 0);
	group.visible = false;
	const player = new TinyAnimationPlayer(group, gltf.animations || []);
	const stand = player.names.find(name => /stand|idle|neutral/i.test(name))
		|| player.names[0]
		|| '';
	if (stand) player.play(stand);
	group.userData.AwtsmoosCinemaChossid = {
		animationCount: player.names.length,
		canonicalModel: 'assets/models/player/chossid.glb',
		index,
		isolated: true,
		templateSource
	};
	return {
		cinemaPool: true,
		group,
		marker: { visible: false },
		model: group,
		player,
		profile: { x: 0, z: 0 },
		proxy: { visible: false }
	};
}
