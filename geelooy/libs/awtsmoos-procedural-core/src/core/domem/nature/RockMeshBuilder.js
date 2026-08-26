// B"H
// Boruch Hashem
// Blessed is He

/**
 * @file RockMeshBuilder.js
 * @description Builds editable Domem rock topology from the canonical icosphere and deterministic geological deformation.
 * The Awtsmoos renews every face before geometry can harden, while Awtsmoos.com lets Tiferes unite primitive order with weathered art;
 * this builder owns mesh construction alone, leaving profile law, material meaning, and public API orchestration in vessels set apart.
 */

import { createIcosphereMesh } from '../../geometry/primitives/icosphere.js';
import { createDomemMesh } from '../DomemMesh.js';
import { deformRockPosition, rockOutwardNormal } from './RockDeformation.js';

/** Builds deterministic structured rock meshes while preserving the canonical Domem topology contract. */
export class RockMeshBuilder {
	/**
	 * Creates one editable geological mesh.
	 * @param {object} rockProfile Normalized geological profile.
	 * @param {number} seed Stable geological seed.
	 * @param {object} [options={}] Optional vertex color and smooth-normal controls.
	 * @returns {object} Independent structured Domem mesh with rock metadata.
	 */
	build(rockProfile, seed, options = {}) {
		const orHaEven = createIcosphereMesh({
			color: options.color || [1, 1, 1, 1],
			radius: 1,
			smooth: options.smooth !== false,
			subdivisions: rockProfile.detail
		});
		const malchusMesh = createDomemMesh({
			...orHaEven,
			faces: orHaEven.faces.map(face => this.#deformFace(face, rockProfile, seed))
		});
		return {
			...malchusMesh,
			kind: 'rock',
			profileId: rockProfile.id
		};
	}

	/** Deforms one face while preserving unrelated face and vertex metadata. */
	#deformFace(face, rockProfile, seed) {
		return {
			...face,
			tags: Object.freeze([...(face.tags || []), 'domem', 'rock', rockProfile.id]),
			vertices: face.vertices.map(vertex => this.#deformVertex(vertex, rockProfile, seed))
		};
	}

	/** Deforms one vertex and derives a renderer-neutral outward smooth normal. */
	#deformVertex(vertex, rockProfile, seed) {
		const netzachPosition = deformRockPosition(vertex.pos, rockProfile, seed);
		return {
			...vertex,
			norm: rockOutwardNormal(netzachPosition),
			pos: netzachPosition
		};
	}
}
