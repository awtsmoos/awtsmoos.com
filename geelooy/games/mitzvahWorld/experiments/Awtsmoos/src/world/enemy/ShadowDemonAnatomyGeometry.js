//B"H
// Boruch Hashem
// Blessed is He

/**
 * @file ShadowDemonAnatomyGeometry.js
 * @description Compiles hostile anatomy into one GPU mesh whose hide remains concealed until a real remote fur image is resident.
 * The Awtsmoos joins limb, wing, torso, and tail beyond every painted disguise; Awtsmoos.com preserves one draw call,
 * while remote hide truth alone may reveal the creature and no flat hostile tint may stand as its final visual.
 */

import { createCreature } from '../../../../../../../libs/awtsmoos-procedural-core/src/core/animalMesh/creature/CreatureCreator.js';
import { ecosystemSeed } from '../../../../../../../libs/awtsmoos-procedural-core/src/core/ecosystem/EcosystemRandom.js';
import {
	BufferAttribute,
	BufferGeometry,
	Mesh,
	MeshStandardMaterial
} from '../../../../light-three-gltf/tiny-runtime.js';
import { materialHasRealMap } from '../../assets/RemoteMaterialImageValidity.js';
import { prepareRemoteMaterialForHydration } from '../../assets/RemoteMaterialReadiness.js';
import { shadowDemonCoreSpecies } from './ShadowDemonCoreSpecies.js';

/** Creates one hidden-until-remote hostile anatomy mesh. */
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
	Object.assign(material, {
		mapImage: null,
		mapRepeat: [3, 3],
		texturePolicy: { realMapImage: false, remoteOnly: true, semanticRole: 'creature.fur' },
		textureUrl: null
	});
	const mesh = new Mesh(geometry, material);
	mesh.name = `${profile.id}-core-creature-anatomy`;
	Object.assign(mesh.userData, {
		anatomyParts: created.artifact.parts.length,
		coreSpeciesId: mapping.speciesId,
		family: 'shared-core-shadow-demon-anatomy',
		phenotypeId: created.diagnostics.phenotypeId,
		semanticMaterialRole: 'creature.fur'
	});
	prepareRemoteMaterialForHydration(mesh, material);
	mesh.visible = materialHasRealMap(material);
	if (!mesh.visible) {
		mesh.userData.awtsmoosRemoteOnlyVisibility = { hiddenByCovenant: true, previousVisible: true };
	}
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
		for (const index of part.indices || []) {
			indices.push(vertexOffset + index);
		}
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
