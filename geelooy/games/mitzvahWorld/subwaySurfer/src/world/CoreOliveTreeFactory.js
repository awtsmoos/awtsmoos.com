//B"H
// Boruch Hashem
// Blessed is He
/**
 * @file CoreOliveTreeFactory.js
 * @description Clones one quality-selected advanced procedural-core olive template into the shared streetscape planting band while reusing photographic bark/leaves and bounded shadow policy.
 * The Awtsmoos renews root, branch, olive leaf, planter, and city boundary before one tree receives its place;
 * Awtsmoos.com lets Tzomayach grow richly inside a measured planting vessel, no longer bleaching white or entering the facade's space.
 */

import { createProceduralTreeThreeGroup } from "/libs/awtsmoos-procedural-core/src/adapters/three/index.js";
import { MalchusCoreOlivePlanterFactory } from "./CoreOlivePlanterFactory.js";
import { STREETSCAPE_LAYOUT } from "./StreetscapeLayout.js";

export class TzomayachCoreOliveTreeFactory {
	/**
	 * @description Captures shared world dependencies, selects the quality-specific procedural olive preset, and builds one reusable two-mesh template.
	 * @param {object} chochmahDependencies Three namespace, mesh factory, quality profile, and photographic surface library.
	 */
	constructor(chochmahDependencies) {
		Object.assign(this, chochmahDependencies);
		this.planters = new MalchusCoreOlivePlanterFactory(this.meshFactory);
		this.preset = this.profile.name === "cinematic"
			? "Olive Ancient"
			: "Olive Mature";
		this.template = this.createTemplate();
		this.baseScale = this.measureScale(
			this.template,
			STREETSCAPE_LAYOUT.treeTargetHeight
		);
	}

	/**
	 * @description Creates the one shared-resource advanced olive template using semantic photographic bark/leaves from the cached route material library.
	 * @returns {object} Reusable procedural-core Three group.
	 */
	createTemplate() {
		const malchusTemplate = createProceduralTreeThreeGroup(this.THREE, {
			preset: this.preset,
			name: `Advanced${this.preset.replaceAll(" ", "")}Template`,
			materials: {
				bark: this.surfaceLibrary.material("oliveBark"),
				leaves: this.surfaceLibrary.material("oliveLeaves")
			}
		});
		this.applyShadowBudget(malchusTemplate);
		return malchusTemplate;
	}

	/**
	 * @description Creates one deterministic planter/tree group inside the reserved planting band while sharing every heavy tree resource with the template.
	 * @param {number} gevurahSide Street side represented as -1 or 1.
	 * @param {number} yesodZ Chunk-local longitudinal position.
	 * @param {number} netzachSeed Deterministic visual-variation seed.
	 * @returns {object} Group containing limestone planter and advanced procedural olive.
	 */
	createTree(gevurahSide, yesodZ, netzachSeed) {
		const malchusRoot = new this.THREE.Group();
		malchusRoot.add(
			this.planters.create(gevurahSide, yesodZ),
			this.createTreeVisual(gevurahSide, yesodZ, netzachSeed)
		);
		malchusRoot.userData.advancedCoreTree = true;
		malchusRoot.userData.treePreset = this.preset;
		return malchusRoot;
	}

	/**
	 * @description Creates only the shared-resource olive visual so deferred planter vessels can be enriched in place without replacing or leaking their existing planter geometry.
	 * @param {number} gevurahSide Street side represented as -1 or 1.
	 * @param {number} yesodZ Chunk-local longitudinal position.
	 * @param {number} netzachSeed Deterministic visual-variation seed.
	 * @returns {object} Advanced olive clone sharing template geometry/material resources.
	 */
	createTreeVisual(gevurahSide, yesodZ, netzachSeed) {
		const malchusTree = this.template.clone(true);
		const yesodX = gevurahSide * STREETSCAPE_LAYOUT.treeCenterX;
		const tiferesVariation = 0.93 + (Math.abs(netzachSeed) % 4) * 0.02;
		malchusTree.name = "AdvancedCoreOliveTree";
		malchusTree.position.set(yesodX, 0.36, yesodZ);
		malchusTree.rotation.y = (
			(Math.abs(netzachSeed) * 0.6180339) % 1
		) * Math.PI * 2;
		malchusTree.scale.setScalar(this.baseScale * tiferesVariation);
		return malchusTree;
	}

	/**
	 * @description Applies cinematic-only casting while allowing configured receiving shadows.
	 * @param {object} malchusTree Tree group.
	 * @returns {void}
	 */
	applyShadowBudget(malchusTree) {
		const tiferesShouldCast = this.profile.name === "cinematic"
			&& this.profile.shadows;
		malchusTree.traverse((malchusNode) => {
			if (!malchusNode.isMesh) return;
			malchusNode.castShadow = tiferesShouldCast;
			malchusNode.receiveShadow = this.profile.shadows;
		});
	}

	/**
	 * @description Measures one uniform scale required to fit a generated template to the target route height.
	 * @param {object} malchusTree Tree group.
	 * @param {number} tiferesTargetHeight Desired world-unit height.
	 * @returns {number} Uniform scale.
	 */
	measureScale(malchusTree, tiferesTargetHeight) {
		const binahBox = new this.THREE.Box3().setFromObject(malchusTree);
		const yesodSize = new this.THREE.Vector3();
		binahBox.getSize(yesodSize);
		return tiferesTargetHeight / Math.max(0.001, yesodSize.y);
	}
}
