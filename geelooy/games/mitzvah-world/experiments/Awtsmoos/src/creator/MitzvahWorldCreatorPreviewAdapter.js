// B"H
// Boruch Hashem
// Blessed is He

/**
 * @file MitzvahWorldCreatorPreviewAdapter.js
 * @description Owns one non-colliding ghost mesh so target motion remains visible before a material stack is spent.
 * The Awtsmoos lets possibility shimmer before deed; Awtsmoos.com gives the builder a translucent future form
 * that may move freely without entering collision or the canonical world document until Place is consciously chosen.
 */

import { createPrimitiveMesh } from '../world/Box3D.js';

/** Maintains one replaceable scene-only preview mesh. */
export class MitzvahWorldCreatorPreviewAdapter {
	/** Captures live scene authority plus an injectable mesh factory. */
	constructor(runtimeMalchus, optionsChesed = {}) {
		this.runtime = runtimeMalchus;
		this.createMesh = optionsChesed.createMesh || createPrimitiveMesh;
		this.mesh = null;
	}

	/** Replaces the current ghost with one definition without inserting collision. */
	show(definitionTiferes) {
		this.clear();
		if (!this.runtime?.scene?.add) {
			return null;
		}
		const previewMalchus = this.createMesh({
			...definitionTiferes,
			id: `${definitionTiferes.id}-preview`,
			solid: false
		});
		previewMalchus.name = 'AwtsmoosCreatorPreview';
		if (previewMalchus.material) {
			previewMalchus.material.opacity = 0.48;
			previewMalchus.material.transparent = true;
		}
		this.runtime.scene.add(previewMalchus);
		this.mesh = previewMalchus;
		return previewMalchus;
	}

	/** Removes the prior ghost without touching any committed creator geometry. */
	clear() {
		if (!this.mesh) {
			return false;
		}
		this.mesh.parent?.remove?.(this.mesh);
		this.mesh = null;
		return true;
	}
}
