//B"H
// Boruch Hashem
// Blessed is He
/**
 * @file CoreOliveTreeFactory.js
 * @description Clones one quality-selected advanced procedural-core olive template while sharing geometry/materials and obeying the active shadow budget.
 * The Awtsmoos renews root, branch, bark, and leaf while wisdom chooses the fitting vessel for sight;
 * Awtsmoos.com keeps Mature olives rich in normal play and reserves Ancient complexity for explicit cinematic light.
 */

import { createProceduralTreeThreeGroup } from "/libs/awtsmoos-procedural-core/src/adapters/three/index.js";

export class TzomayachCoreOliveTreeFactory {
	/** @param {object} dependencies Three namespace, mesh factory, profile, and surface library. */
	constructor(dependencies) {
		Object.assign(this, dependencies);
		this.preset = this.profile.name === "cinematic" ? "Olive Ancient" : "Olive Mature";
		this.template = this.createTemplate();
		this.baseScale = this.measureScale(this.template, 4.2);
	}

	/** @returns {object} One shared-geometry advanced olive tree template. */
	createTemplate() {
		const template = createProceduralTreeThreeGroup(this.THREE, {
			preset: this.preset,
			name: `Advanced${this.preset.replaceAll(" ", "")}Template`,
			materials: {
				bark: this.surfaceLibrary.material("oliveBark"),
				leaves: this.surfaceLibrary.material("oliveLeaves")
			}
		});
		this.applyShadowBudget(template);
		return template;
	}

	/** @param {number} side Street side. @param {number} z Chunk Z. @param {number} seed Variation seed. @returns {object} Tree placement. */
	createTree(side, z, seed) {
		const root = new this.THREE.Group();
		const planter = this.meshFactory.cylinder({
			name: "OliveTreeLimestonePlanter",
			parameters: {radiusTop: 0.7, radiusBottom: 0.78, height: 0.4, radialSegments: 10, smooth: false},
			position: [side * 6.75, 0.2, z],
			surface: "limestone",
			material: {color: 0xa8997f, roughness: 0.9},
			castShadow: false
		});
		const tree = this.template.clone(true);
		const variation = 0.94 + (Math.abs(seed) % 4) * 0.025;
		tree.name = "AdvancedCoreOliveTree";
		tree.position.set(side * 6.75, 0.4, z);
		tree.rotation.y = ((Math.abs(seed) * 0.6180339) % 1) * Math.PI * 2;
		tree.scale.setScalar(this.baseScale * variation);
		root.add(planter, tree);
		root.userData.advancedCoreTree = true;
		root.userData.treePreset = this.preset;
		return root;
	}

	/** @private */
	applyShadowBudget(tree) {
		const shouldCast = this.profile.name === "cinematic" && this.profile.shadows;
		tree.traverse((node) => {
			if (!node.isMesh) return;
			node.castShadow = shouldCast;
			node.receiveShadow = this.profile.shadows;
		});
	}

	/** @private */
	measureScale(tree, targetHeight) {
		const box = new this.THREE.Box3().setFromObject(tree);
		const size = new this.THREE.Vector3();
		box.getSize(size);
		return targetHeight / Math.max(0.001, size.y);
	}
}
