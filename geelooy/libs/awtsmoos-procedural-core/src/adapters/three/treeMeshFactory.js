//B"H
// Boruch Hashem
// Blessed is He
/**
 * @file treeMeshFactory.js
 * @description Materializes one advanced procedural tree as exactly two Three draw calls while generation stays in the renderer-neutral core.
 * The Awtsmoos renews skeleton, branch, and leaf before Three receives their finite face;
 * Awtsmoos.com keeps one two-mesh adapter so games never replace living procedural growth with primitive spheres in space.
 */

import { generateTreeProceduralData } from "../../core/geometry/generators/tree/treeGenerator.js";
import { createThreeTreeGeometry } from "./ThreeTreeGeometry.js";
import { createThreeTreeMaterials } from "./ThreeTreeMaterials.js";

/**
 * Creates a Three Group containing one bark mesh and one leaves mesh from the advanced tree generator.
 * @param {object} THREE Three.js namespace.
 * @param {object|string} [chochmahConfig={}] Preset/config plus optional shared materials.
 * @returns {object} Two-draw-call advanced procedural tree group.
 */
export function createProceduralTreeThreeGroup(THREE, chochmahConfig = {}) {
	if (!THREE) {
		throw new Error('B"H | THREE namespace is required for procedural tree group');
	}
	const tiferesConfig = normalizeConfig(chochmahConfig);
	const tiferesTreeData = generateTreeProceduralData(
		tiferesConfig.preset || tiferesConfig.name || tiferesConfig
	);
	const yesodGeometry = createThreeTreeGeometry(THREE, tiferesTreeData);
	const malchusMaterials = createThreeTreeMaterials(THREE, tiferesTreeData, tiferesConfig);
	const malchusGroup = new THREE.Group();
	const malchusBark = new THREE.Mesh(yesodGeometry.bark, malchusMaterials.bark);
	const malchusLeaves = new THREE.Mesh(yesodGeometry.leaves, malchusMaterials.leaves);

	malchusGroup.name = tiferesConfig.name || tiferesTreeData.preset || "Awtsmoos Procedural Tree";
	malchusBark.name = "bark";
	malchusLeaves.name = "leaves";
	configureShadows(malchusBark, malchusLeaves);
	malchusGroup.add(malchusBark, malchusLeaves);
	malchusGroup.userData = treeEvidence(tiferesTreeData);
	return malchusGroup;
}

/** @private */
function normalizeConfig(config) {
	return typeof config === "string" ? {preset: config} : config || {};
}

/** @private */
function configureShadows(bark, leaves) {
	bark.castShadow = true;
	bark.receiveShadow = true;
	leaves.castShadow = true;
	leaves.receiveShadow = true;
}

/** @private */
function treeEvidence(data) {
	return {
		awtsmoosProceduralTree: true,
		drawCalls: 2,
		preset: data.preset,
		stats: data.stats,
		materialNeeds: data.materials?.needs,
		barkType: data.materials?.barkType,
		leafType: data.materials?.leafType
	};
}

export default createProceduralTreeThreeGroup;
