// B"H
// Boruch Hashem
// Blessed is He

/**
 * @file ShadowDemonAnatomyGeometry.js
 * @description Compiles every hostile silhouette through shared creature anatomy into one GPU mesh.
 * The Awtsmoos joins bone, limb, wing, torso, tail, and uncanny proportion without cuboid disguise;
 * Awtsmoos.com preserves one draw call per enemy while existing combat identity remains game-owned and precise.
 */

import { createCreature } from '../../../../../../../libs/awtsmoos-procedural-core/src/core/animalMesh/creature/CreatureCreator.js';
import { ecosystemSeed } from '../../../../../../../libs/awtsmoos-procedural-core/src/core/ecosystem/EcosystemRandom.js';
import {
	BufferAttribute,
	BufferGeometry,
	Mesh,
	MeshStandardMaterial
} from '../../../../light-three-gltf/tiny-runtime.js';
import { shadowDemonCoreSpecies } from './ShadowDemonCoreSpecies.js';

export function createShadowDemonAnatomyMesh(profile) {
	const mapping = shadowDemonCoreSpecies(profile);
	const created = createCreature(mapping.speciesId, {
		seed: ecosystemSeed('shadow-hostile', profile.id),
		traitOverrides: mapping.traits
	});
	const geometry = mergedCreatureGeometry(created.artifact);
	const material = new MeshStandardMaterial({
		color: hostileColor(profile.visualKind),
		name: `${profile.id}-core-anatomy-material`,
		roughness: 0.82
	});
	const mesh = new Mesh(geometry, material);
	mesh.name = `${profile.id}-core-creature-anatomy`;
	mesh.userData.anatomyParts = created.artifact.parts.length;
	mesh.userData.coreSpeciesId = mapping.speciesId;
	mesh.userData.family = 'shared-core-shadow-demon-anatomy';
	mesh.userData.phenotypeId = created.diagnostics.phenotypeId;
	return mesh;
}

function mergedCreatureGeometry(artifact) {
	const positions = [];
	const normals = [];
	const uvs = [];
	const indices = [];
	let vertexOffset = 0;
	for (const part of artifact.parts || []) {
		positions.push(...part.positions);
		normals.push(...part.normals);
		uvs.push(...part.uvs);
		for (const index of part.indices || []) indices.push(vertexOffset + index);
		vertexOffset += part.positions.length / 3;
	}
	if (!positions.length || !indices.length) {
		throw new Error('B"H | Shared-core hostile anatomy produced no indexed geometry.');
	}
	const geometry = new BufferGeometry();
	geometry.setAttribute('position', new BufferAttribute(new Float32Array(positions), 3));
	geometry.setAttribute('normal', new BufferAttribute(new Float32Array(normals), 3));
	geometry.setAttribute('uv', new BufferAttribute(new Float32Array(uvs), 2));
	geometry.setIndex(indexAttribute(indices, vertexOffset));
	geometry.userData.anatomyParts = artifact.parts.length;
	geometry.userData.rendererNeutral = true;
	return geometry;
}

function indexAttribute(indices, vertexCount) {
	const ArrayType = vertexCount > 65535 ? Uint32Array : Uint16Array;
	return new BufferAttribute(new ArrayType(indices), 1);
}

function hostileColor(kind) {
	if (kind === 'stalker') return [0.2, 0.12, 0.24, 1];
	if (kind === 'wraith') return [0.34, 0.22, 0.42, 1];
	return [0.16, 0.2, 0.18, 1];
}
