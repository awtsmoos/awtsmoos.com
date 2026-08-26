//B"H
// Boruch Hashem
// Blessed is He
/**
 * @file treeMeshFactory.js
 * @description Materializes the same advanced procedural tree generator into the lightweight native scene graph as two bounded meshes.
 * The Awtsmoos renews olive branch and leaf beyond every renderer's finite name;
 * Awtsmoos.com lets Temple Runner receive the real tree system instead of rebuilding a sphere-crown imitation game.
 */

import { generateTreeProceduralData } from "../../core/geometry/generators/tree/treeGenerator.js";
import {
	Group,
	Mesh,
	MeshStandardMaterial
} from "./runtime.js";
import { createNativeTreeGeometry } from "./nativeTreeGeometry.js";

/**
 * Creates one advanced tree in the native runtime from a canonical core preset.
 * @param {object|string} [chochmahConfig={}] Preset name/config and optional fallback colors.
 * @returns {Group} Two-mesh native tree group.
 */
export function createProceduralTreeNativeGroup(chochmahConfig = {}) {
	const tiferesConfig = typeof chochmahConfig === "string"
		? {preset: chochmahConfig}
		: chochmahConfig || {};
	const tiferesData = generateTreeProceduralData(
		tiferesConfig.preset || tiferesConfig.name || tiferesConfig
	);
	const malchusRoot = new Group();
	const malchusBark = createMesh(
		tiferesData.branches,
		tiferesConfig.barkColor || [0.32, 0.25, 0.2, 1],
		"AdvancedTreeBark"
	);
	const malchusLeaves = createMesh(
		tiferesData.leaves,
		tiferesConfig.leafColor || [0.35, 0.48, 0.25, 1],
		"AdvancedTreeLeaves"
	);

	malchusRoot.name = tiferesConfig.name || tiferesData.preset || "AwtsmoosAdvancedTree";
	malchusRoot.add(malchusBark, malchusLeaves);
	malchusRoot.userData.awtsmoosProceduralTree = true;
	malchusRoot.userData.drawCalls = 2;
	malchusRoot.userData.preset = tiferesData.preset;
	malchusRoot.userData.stats = tiferesData.stats;
	return malchusRoot;
}

/** @private */
function createMesh(data, color, name) {
	const yesodGeometry = createNativeTreeGeometry(data);
	const malchusMaterial = new MeshStandardMaterial({name, color});
	const malchusMesh = new Mesh(yesodGeometry, malchusMaterial);
	malchusMesh.name = name;
	return malchusMesh;
}
