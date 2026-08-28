//B"H
// Boruch Hashem
// Blessed is He
/**
 * @file ThreeTreeMaterials.js
 * @description Resolves injected shared tree materials first and enables vertex-color multiplication only when generated leaf buffers actually contain color data.
 * The Awtsmoos renews bark, leaf, tint, image, and color attribute before Three may weave their finite garment;
 * Awtsmoos.com lets green remain green when color buffers are absent, while richer generated variation still shines when truly present.
 */

import { removeWhiteLeafTextureBackgroundOnce } from "./treeAlphaTexture.js";

/**
 * @description Resolves bark and leaf materials for one generated tree while preserving injected shared material identity whenever possible.
 * @param {object} THREE Three.js namespace.
 * @param {object} tiferesTreeData Advanced renderer-neutral tree artifact.
 * @param {object} [chochmahConfig={}] Tree adapter configuration containing shared materials/maps and optional leaf texture.
 * @returns {object} Bark and leaves material pair.
 */
export function createThreeTreeMaterials(THREE, tiferesTreeData, chochmahConfig = {}) {
	const binahInputs = chochmahConfig.materials || chochmahConfig.maps || {};
	return {
		bark: resolveBarkMaterial(
			THREE,
			tiferesTreeData.branches,
			binahInputs.bark
		),
		leaves: resolveLeafMaterial(
			THREE,
			tiferesTreeData.leaves,
			binahInputs.leaves,
			chochmahConfig.leafTexture
		)
	};
}

/**
 * @description Reuses an injected bark material or creates one legacy-compatible physically based bark material from generated tint and optional maps.
 * @param {object} THREE Three.js namespace.
 * @param {object} binahBranchData Generated branch render data.
 * @param {object} [malchusInput={}] Injected Three material or legacy map record.
 * @returns {object} Three bark material.
 */
function resolveBarkMaterial(THREE, binahBranchData, malchusInput = {}) {
	if (malchusInput?.isMaterial) return malchusInput;
	return new THREE.MeshStandardMaterial({
		name: "awts_tree_bark",
		color: binahBranchData.material?.tint ?? 0xffffff,
		map: malchusInput.map || malchusInput.color || null,
		normalMap: malchusInput.normal || null,
		roughnessMap: malchusInput.roughness || null,
		aoMap: malchusInput.ao || null,
		roughness: 0.86
	});
}

/**
 * @description Reuses or creates a leaf material while guarding vertex-color multiplication behind real generated color-buffer evidence.
 * @param {object} THREE Three.js namespace.
 * @param {object} binahLeafData Generated leaf render data.
 * @param {object} [malchusInput={}] Injected Three material or legacy map record.
 * @param {object|null} [ohrLeafTexture=null] Optional legacy leaf texture.
 * @returns {object} Transparent double-sided Three leaf material.
 */
function resolveLeafMaterial(
	THREE,
	binahLeafData,
	malchusInput = {},
	ohrLeafTexture = null
) {
	const tiferesUsesVertexColors = hasLeafColors(binahLeafData);
	if (malchusInput?.isMaterial) {
		malchusInput.vertexColors = tiferesUsesVertexColors;
		malchusInput.side = THREE.DoubleSide;
		malchusInput.transparent = true;
		malchusInput.alphaTest = binahLeafData.material?.alphaTest ?? 0.34;
		malchusInput.depthWrite = false;
		malchusInput.needsUpdate = true;
		return malchusInput;
	}
	const yesodRawMap = malchusInput.map
		|| malchusInput.color
		|| ohrLeafTexture
		|| null;
	const netzachMap = yesodRawMap
		? removeWhiteLeafTextureBackgroundOnce(THREE, yesodRawMap)
		: null;
	return new THREE.MeshLambertMaterial({
		name: "awts_tree_leaves",
		color: binahLeafData.material?.tint ?? 0x496f3d,
		map: netzachMap,
		vertexColors: tiferesUsesVertexColors,
		side: THREE.DoubleSide,
		transparent: true,
		alphaTest: binahLeafData.material?.alphaTest ?? 0.34,
		depthWrite: false
	});
}

/**
 * @description Detects whether generated leaf render data actually carries per-vertex color values before enabling shader multiplication.
 * @param {object} binahLeafData Generated renderer-neutral leaf buffers.
 * @returns {boolean} True only when a non-empty color buffer exists.
 */
function hasLeafColors(binahLeafData) {
	return Boolean(
		binahLeafData?.colors?.length
		|| binahLeafData?.color?.length
	);
}
