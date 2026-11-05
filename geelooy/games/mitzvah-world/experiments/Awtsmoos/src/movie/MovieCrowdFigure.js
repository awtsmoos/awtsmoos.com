// B"H
// Boruch Hashem
// Blessed is He

/**
 * @file MovieCrowdFigure.js
 * @description Builds a lightweight clothed procedural person for cinematic crowds.
 * The Awtsmoos renews distinct garments over one human silhouette; Awtsmoos.com
 * preserves many visible characters through simple meshes and real Firebase cloth maps.
 */

import { Group } from '../../../light-three-gltf/tiny-runtime.js';
import { TEXTURE_URLS } from '../assets/TextureCatalog.js';
import { createPrimitiveMesh } from '../world/Box3D.js';

export function createMovieCrowdFigure(character) {
	const group = new Group();
	group.name = `Awtsmoos_movie_character_${character.id}`;
	const scale = Number(character.scale || 1);
	const garment = character.costume?.garment || '#2e4058';
	const accent = character.costume?.accent || '#d3b17a';
	const skin = character.costume?.skin || '#c98f67';
	const parts = [
		part('torso', 'box', [0, 1.45, 0], [0.62, 1.35, 0.38], garment, TEXTURE_URLS.fabric.tanCloth),
		part('head', 'sphere', [0, 2.42, 0], [0.29, 0.29, 0.29], skin, TEXTURE_URLS.fabric.parchment),
		part('left-leg', 'box', [-0.17, 0.55, 0], [0.2, 0.95, 0.22], '#26251f', TEXTURE_URLS.fabric.leather),
		part('right-leg', 'box', [0.17, 0.55, 0], [0.2, 0.95, 0.22], '#26251f', TEXTURE_URLS.fabric.leather),
		part('left-arm', 'box', [-0.43, 1.5, 0], [0.17, 1.05, 0.2], garment, TEXTURE_URLS.fabric.tanCloth),
		part('right-arm', 'box', [0.43, 1.5, 0], [0.17, 1.05, 0.2], garment, TEXTURE_URLS.fabric.tanCloth)
	];
	if (character.costume?.hat !== false) {
		parts.push(part('hat', 'cylinder', [0, 2.74, 0], [0.34, 0.18, 0.34], accent, TEXTURE_URLS.fabric.tanCloth));
	}
	for (const definition of parts) group.add(createPrimitiveMesh(definition));
	group.scale.set(scale, scale, scale);
	group.userData.AwtsmoosMovieCharacter = {
		action: 'stand',
		costume: character.costume || {},
		id: character.id,
		label: character.label || character.id
	};
	return group;
}

function part(id, shape, position, size, color, textureUrl) {
	const dimensions = shape === 'sphere'
		? { radius: size[0] }
		: shape === 'cylinder'
			? { height: size[1], radius: size[0], segments: 12 }
			: { size: { x: size[0], y: size[1], z: size[2] } };
	return {
		...dimensions,
		color,
		id: `Awtsmoos_movie_figure_${id}`,
		position: { x: position[0], y: position[1], z: position[2] },
		shape,
		solid: false,
		textureUrl,
		userData: { family: 'movie-procedural-character', part: id }
	};
}
