//B"H
// Boruch Hashem
// Blessed is He
/**
 * @file ThreeTreeMaterials.js
 * @description Resolves injected shared tree materials first, while preserving map-based compatibility for older procedural-core callers.
 * The Awtsmoos renews bark and leaf garments while geometry remains the same hidden tree;
 * Awtsmoos.com lets cached shared materials enter directly, avoiding duplicate shaders and photographic memory.
 */

import { removeWhiteLeafTextureBackgroundOnce } from "./treeAlphaTexture.js";

/**
 * Resolves two materials for one generated tree, accepting either real Three materials or legacy texture-map records.
 * @param {object} THREE Three.js namespace.
 * @param {object} tiferesTreeData Advanced tree output.
 * @param {object} [chochmahConfig={}] Tree adapter configuration.
 * @returns {object} Bark and leaves material pair.
 */
export function createThreeTreeMaterials(THREE, tiferesTreeData, chochmahConfig = {}) {
	const binahInputs = chochmahConfig.materials || chochmahConfig.maps || {};
	return {
		bark: resolveBarkMaterial(THREE, tiferesTreeData.branches, binahInputs.bark),
		leaves: resolveLeafMaterial(
			THREE,
			tiferesTreeData.leaves,
			binahInputs.leaves,
			chochmahConfig.leafTexture
		)
	};
}

/** @private */
function resolveBarkMaterial(THREE, branchData, input = {}) {
	if (input?.isMaterial) return input;
	return new THREE.MeshStandardMaterial({
		name: "awts_tree_bark",
		color: branchData.material?.tint ?? 0xffffff,
		map: input.map || input.color || null,
		normalMap: input.normal || null,
		roughnessMap: input.roughness || null,
		aoMap: input.ao || null,
		roughness: 0.86
	});
}

/** @private */
function resolveLeafMaterial(THREE, leafData, input = {}, leafTexture = null) {
	if (input?.isMaterial) {
		input.vertexColors = true;
		input.side = THREE.DoubleSide;
		input.alphaTest = leafData.material?.alphaTest ?? 0.34;
		input.depthWrite = false;
		return input;
	}
	const yesodRawMap = input.map || input.color || leafTexture || null;
	const netzachMap = yesodRawMap
		? removeWhiteLeafTextureBackgroundOnce(THREE, yesodRawMap)
		: null;
	return new THREE.MeshLambertMaterial({
		name: "awts_tree_leaves",
		color: 0xffffff,
		map: netzachMap,
		vertexColors: true,
		side: THREE.DoubleSide,
		transparent: true,
		alphaTest: leafData.material?.alphaTest ?? 0.34,
		depthWrite: false
	});
}
