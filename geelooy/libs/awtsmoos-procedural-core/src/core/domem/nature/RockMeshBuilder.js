// B"H
// Boruch Hashem
// Blessed is He

/**
 * @file RockMeshBuilder.js
 * @description Builds editable Domem rock topology and derives one immutable geological orientation per stone before any vertex is deformed.
 * The Awtsmoos renews every face and hidden fault in one instant, while Awtsmoos.com lets Yesod carry one seed through the whole stone;
 * topology stays generic, geology stays coherent, and tools receive orientation evidence without asking every vertex to rediscover what is known.
 */

import { createIcosphereMesh } from '../../geometry/primitives/icosphere.js';
import { createDomemMesh } from '../DomemMesh.js';
import { deriveRockGeologyProfile } from '../rocks/RockGeologyProfile.js';
import { deformRockPosition, rockOutwardNormal } from './RockDeformation.js';

/** Builds deterministic structured rock meshes while preserving the canonical Domem topology contract. */
export class RockMeshBuilder {
	/**
	 * Creates one editable geological mesh with seed-coherent orientation evidence.
	 * @param {object} rockProfile Normalized geological profile.
	 * @param {number|string} seed Stable geological seed.
	 * @param {object} [options={}] Optional vertex color and smooth-normal controls.
	 * @returns {object} Independent structured Domem mesh with rock metadata and frozen orientation.
	 */
	build(rockProfile, seed, options = {}) {
		const binahOrientation = deriveRockGeologyProfile(seed);
		const orHaEven = createIcosphereMesh({
			color: options.color || [1, 1, 1, 1],
			radius: 1,
			smooth: options.smooth !== false,
			subdivisions: rockProfile.detail
		});
		const malchusMesh = createDomemMesh({
			...orHaEven,
			faces: orHaEven.faces.map(face => {
				return this.#deformFace(face, rockProfile, seed, binahOrientation);
			})
		});
		return {
			...malchusMesh,
			geologyOrientation: binahOrientation,
			kind: 'rock',
			profileId: rockProfile.id
		};
	}

	/** Deforms one face while preserving unrelated face and vertex metadata. */
	#deformFace(face, rockProfile, seed, orientation) {
		return {
			...face,
			tags: Object.freeze([...(face.tags || []), 'domem', 'rock', rockProfile.id]),
			vertices: face.vertices.map(vertex => {
				return this.#deformVertex(vertex, rockProfile, seed, orientation);
			})
		};
	}

	/** Deforms one vertex against the stone-wide orientation and derives an outward smooth normal. */
	#deformVertex(vertex, rockProfile, seed, orientation) {
		const netzachPosition = deformRockPosition(vertex.pos, rockProfile, seed, orientation);
		return {
			...vertex,
			norm: rockOutwardNormal(netzachPosition),
			pos: netzachPosition
		};
	}
}
