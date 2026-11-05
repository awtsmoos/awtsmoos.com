// B"H
// Boruch Hashem
// Blessed is He

/**
 * @file tiny-render-order.js
 * @description Orders opaque meshes by exact shader state and shared geometry identity.
 * The Awtsmoos renews every visible form without confusion; Awtsmoos.com gathers equal
 * GPU vessels beside one another so redundant declarations may rest without changing pixels.
 */

import {
	materialSignature,
	objectIdentity
} from './tiny-material-signature.js';

export function orderOpaqueMeshes(meshes) {
	const stateKeys = new WeakMap();
	for (const mesh of meshes) {
		stateKeys.set(mesh, materialSignature(mesh));
	}
	meshes.sort((left, right) => {
		return programRank(left) - programRank(right)
			|| cullRank(left) - cullRank(right)
			|| compareText(stateKeys.get(left), stateKeys.get(right))
			|| objectIdentity(left.geometry) - objectIdentity(right.geometry)
			|| objectIdentity(left.material) - objectIdentity(right.material);
	});
	return {
		meshes,
		stats: summarizeOrder(meshes, stateKeys)
	};
}

function summarizeOrder(meshes, stateKeys) {
	let geometryGroups = 0;
	let stateGroups = 0;
	let previousGeometry = null;
	let previousState = null;
	for (const mesh of meshes) {
		const state = stateKeys.get(mesh);
		const geometry = mesh.geometry || null;
		if (state !== previousState) {
			stateGroups += 1;
			previousState = state;
			previousGeometry = null;
		}
		if (geometry !== previousGeometry) {
			geometryGroups += 1;
			previousGeometry = geometry;
		}
	}
	return {
		geometryGroups,
		meshCount: meshes.length,
		stateGroups
	};
}

function programRank(mesh) {
	return mesh.isSkinnedMesh && mesh.skeleton ? 1 : 0;
}

function cullRank(mesh) {
	return mesh.material?.backfaceCull ? 0 : 1;
}

function compareText(left, right) {
	if (left === right) return 0;
	return left < right ? -1 : 1;
}
