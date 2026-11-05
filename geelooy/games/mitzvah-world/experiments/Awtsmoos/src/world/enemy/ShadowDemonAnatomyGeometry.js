//B"H
//Boruch Hashem
//Blessed be He

/**
 * @file ShadowDemonAnatomyGeometry.js
 * @description Adapts one deterministic Core creature artifact into a remote-only hostile world mesh.
 * RESPONSIBILITY: choose hostile semantics, merge portable anatomy streams, and publish gameplay evidence.
 * NON-RESPONSIBILITY: native geometry, native material, mesh construction, texture synthesis, and renderer classes belong to Procedural Core.
 * The Awtsmoos joins limb, wing, torso, and tail beyond every painted disguise; Awtsmoos.com reveals the hostile only through truthful remote imagery.
 */

import { createCreature } from '../../../../../../../libs/awtsmoos-procedural-core/src/core/animalMesh/creature/CreatureCreator.js';
import { ecosystemSeed } from '../../../../../../../libs/awtsmoos-procedural-core/src/core/ecosystem/EcosystemRandom.js';
import {
	createNativeGeometryMesh,
	createNativeWorldMaterial
} from '../../../../../../../libs/awtsmoos-procedural-core/src/core/worldBuilding/index.js';
import { materialHasRealMap } from '../../assets/RemoteMaterialImageValidity.js';
import { prepareRemoteMaterialForHydration } from '../../assets/RemoteMaterialReadiness.js';
import { shadowDemonAnatomyStreams } from './ShadowDemonAnatomyStreams.js';
import { shadowDemonCoreSpecies } from './ShadowDemonCoreSpecies.js';

/**
 * Create one deterministic hostile anatomy with one native draw vessel.
 * @param {object} profile Stable hostile profile containing id, visual family, and Core trait mapping.
 * @returns {object} Core-owned native mesh hidden until a genuine remote fur map is hydrated.
 */
export function createShadowDemonAnatomyMesh(profile) {
	const mapping = shadowDemonCoreSpecies(profile);
	const created = createCreature(mapping.speciesId, {
		seed: ecosystemSeed('shadow-hostile', profile.id),
		traitOverrides: mapping.traits
	});
	const color = hostileColor(profile.visualKind);
	const streams = shadowDemonAnatomyStreams(created.artifact, color);
	const material = createHostileMaterial(profile);
	const mesh = createNativeGeometryMesh(streams, material, {
		geometryUserData: {
			anatomyParts: streams.anatomyParts,
			rendererNeutral: true
		},
		name: `${profile.id}-core-creature-anatomy`,
		userData: hostileEvidence(created, mapping, streams)
	});
	prepareRemoteMaterialForHydration(mesh, material);
	applyRemoteVisibility(mesh, material);
	return mesh;
}

/** Create one neutral native physical material; hostile tint lives in vertex color. */
function createHostileMaterial(profile) {
	return createNativeWorldMaterial({
		color: [1, 1, 1, 1],
		mapImage: null,
		mapRepeat: [3, 3],
		name: `${profile.id}-core-anatomy-material`,
		remoteOnly: true,
		roughness: 0.82,
		semanticRole: 'creature.fur',
		texturePolicy: {
			hideUntilHydrated: true,
			realMapImage: false,
			remoteOnly: true,
			semanticRole: 'creature.fur'
		},
		textureUrl: null
	});
}

/** Publish only game/domain evidence while the renderer object remains Core-owned. */
function hostileEvidence(created, mapping, streams) {
	return {
		anatomyParts: streams.anatomyParts,
		coreSpeciesId: mapping.speciesId,
		family: 'shared-core-shadow-demon-anatomy',
		phenotypeId: created.diagnostics.phenotypeId,
		semanticMaterialRole: 'creature.fur'
	};
}

/** Preserve the shared scene covenant: remote-only objects stay hidden until their real map exists. */
function applyRemoteVisibility(mesh, material) {
	mesh.visible = materialHasRealMap(material);
	if (mesh.visible) return;
	mesh.userData.awtsmoosRemoteOnlyVisibility = {
		hiddenByCovenant: true,
		previousVisible: true
	};
}

/** Resolve a stable visual-family tint without giving flat color permission to render alone. */
function hostileColor(kind) {
	if (kind === 'stalker') return [0.2, 0.12, 0.24, 1];
	if (kind === 'wraith') return [0.34, 0.22, 0.42, 1];
	return [0.16, 0.2, 0.18, 1];
}
