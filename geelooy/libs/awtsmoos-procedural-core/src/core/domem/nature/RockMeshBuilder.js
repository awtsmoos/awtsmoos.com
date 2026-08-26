// B"H
// Boruch Hashem
// Blessed is He

/**
 * @file RockMeshBuilder.js
 * @description Builds editable Domem rock topology from one precomputed stone-wide structural geology profile shared with material intent.
 * The Awtsmoos renews every face and hidden fault in one instant while Awtsmoos.com lets Yesod carry one seed-derived covenant through the whole stone;
 * topology stays generic, geology stays coherent, and no vertex or material specialist independently rediscovers directions already known by the authority above.
 */
import { createIcosphereMesh } from '../../geometry/primitives/icosphere.js';
import { createDomemMesh } from '../DomemMesh.js';
import { deriveRockGeologyProfile } from '../rocks/RockGeologyProfile.js';
import { deformRockPosition, rockOutwardNormal } from './RockDeformation.js';

/** Builds deterministic structured rock meshes while preserving the canonical Domem topology contract. */
export class RockMeshBuilder {
	/** Creates one editable geological mesh with shared seed-coherent orientation evidence. */
	build(rockProfile, seed, options = {}) {
		const binahOrientation = options.geologyOrientation || deriveRockGeologyProfile(seed);
		const orHaEven = createIcosphereMesh({
			color: options.color || [1, 1, 1, 1],
			radius: 1,
			smooth: options.smooth !== false,
			subdivisions: rockProfile.detail
		});
		const malchusMesh = createDomemMesh({
			...orHaEven,
			faces: orHaEven.faces.map((face) => {
				return this.deformFace(face, rockProfile, seed, binahOrientation);
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
	deformFace(face, rockProfile, seed, orientation) {
		return {
			...face,
			tags: Object.freeze([...(face.tags || []), 'domem', 'rock', rockProfile.id]),
			vertices: face.vertices.map((vertex) => {
				return this.deformVertex(vertex, rockProfile, seed, orientation);
			})
		};
	}

	/** Deforms one vertex against the stone-wide geology and derives an outward smooth normal. */
	deformVertex(vertex, rockProfile, seed, orientation) {
		const netzachPosition = deformRockPosition(vertex.pos, rockProfile, seed, orientation);
		return {
			...vertex,
			norm: rockOutwardNormal(netzachPosition),
			pos: netzachPosition
		};
	}
}
