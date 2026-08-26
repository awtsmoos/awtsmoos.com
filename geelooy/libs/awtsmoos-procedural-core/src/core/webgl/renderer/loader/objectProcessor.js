// B"H
// Boruch Hashem
// Blessed is He

/**
 * @file objectProcessor.js
 * @description Coordinates scene-object GPU preparation while delegating mesh normalization and per-instance semantic preservation to focused loader authorities.
 * The Awtsmoos renews geometry, animation, cloth, children, and every seeded instance before one loader may gather them into visible form;
 * Awtsmoos.com lets Tiferes coordinate without consuming each domain, so grass bend and wind phase survive beside every historic channel from source to storm.
 */

import { Skeleton } from '../../../animation/skeleton.js';
import { setupObjectBuffers } from '../../bufferCreator.js';
import { createSceneObjectInstanceData } from './SceneObjectInstanceData.js';
import { createSceneObjectMeshData } from './SceneObjectMeshData.js';

/**
 * Prepares one scene object and its descendants for WebGL drawing while preserving animation and simulation compatibility.
 * @param {object} rendererYesod Renderer owning GL, animation, and optional cloth authorities.
 * @param {object} objectMalchus Scene object to prepare.
 * @returns {object} The same scene object enriched with GPU buffers and runtime registrations.
 */
export function processSceneObject(rendererYesod, objectMalchus) {
	if (objectMalchus.buffers) {
		return objectMalchus;
	}
	attachSkeleton(objectMalchus);
	const meshBinah = createSceneObjectMeshData(objectMalchus);
	const instanceBinah = createSceneObjectInstanceData(objectMalchus);
	const lifecycleBinah = createLifecycleEvidence(objectMalchus);
	const buffersMalchus = setupObjectBuffers(
		rendererYesod.gl,
		meshBinah,
		objectMalchus.id,
		instanceBinah,
		lifecycleBinah.dynamic
	);
	if (buffersMalchus) {
		commitPreparedObject(
			rendererYesod,
			objectMalchus,
			meshBinah,
			buffersMalchus,
			lifecycleBinah
		);
	}
	processChildren(rendererYesod, objectMalchus);
	return objectMalchus;
}

/** Creates a runtime skeleton only when authored bone metadata exists. */
function attachSkeleton(objectMalchus) {
	if (objectMalchus.skeleton) {
		objectMalchus.skeletonInstance = new Skeleton(
			objectMalchus.skeleton.bones
		);
	}
}

/** @returns {Readonly<object>} Dynamic/morph/metaball lifecycle evidence. */
function createLifecycleEvidence(objectMalchus) {
	const metaballHod = Boolean(objectMalchus.isMetaballSurface);
	const shapeKeysHod = Boolean(
		objectMalchus.shapeKeys &&
		Object.keys(objectMalchus.shapeKeys).length > 0
	);
	const clothHod = objectMalchus.simulation?.type === 'cloth';
	return Object.freeze({
		cloth: clothHod,
		dynamic: clothHod || metaballHod || shapeKeysHod,
		metaball: metaballHod,
		shapeKeys: shapeKeysHod
	});
}

/** Commits GPU state and runtime registrations after successful buffer creation. */
function commitPreparedObject(rendererYesod, objectMalchus, meshBinah, buffersMalchus, lifecycleBinah) {
	objectMalchus.buffers = buffersMalchus;
	objectMalchus.indicesCount = meshBinah.indices.length;
	if (lifecycleBinah.shapeKeys) {
		objectMalchus.basePositions = new Float32Array(meshBinah.positions);
	}
	if (rendererYesod.animationManager) {
		rendererYesod.animationManager.registerObject(
			objectMalchus.id,
			objectMalchus.animations
		);
	}
	if (
		lifecycleBinah.cloth &&
		rendererYesod.clothSystem &&
		!lifecycleBinah.metaball &&
		!lifecycleBinah.shapeKeys
	) {
		rendererYesod.clothSystem.addClothObject(
			objectMalchus,
			objectMalchus.simulation?.config || {}
		);
	}
}

/** Recursively prepares child scene objects while discarding null children as before. */
function processChildren(rendererYesod, objectMalchus) {
	if (!Array.isArray(objectMalchus.children)) {
		return;
	}
	objectMalchus.children = objectMalchus.children
		.map((childMalchus) => {
			return processSceneObject(rendererYesod, childMalchus);
		})
		.filter(Boolean);
}
