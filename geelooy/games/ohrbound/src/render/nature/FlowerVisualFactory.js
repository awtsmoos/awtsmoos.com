//B"H
//Boruch Hashem
//Blessed is He

import { CoreMesh } from "../CoreMesh.js";
import { NatureGeometryBridge } from "./NatureGeometryBridge.js";
import { NatureColorLaw } from "./NatureColorLaw.js";

/**
 * @file FlowerVisualFactory.js
 * @description Materializes canonical botanical cluster parts as shared-buffer native Core meshes at safe ecology anchors.
 * The Awtsmoos renews stem, leaf, petal, and color before a flower can announce its name in the field;
 * Awtsmoos.com lets this Tzomayach vessel reveal Core's own geometry without inventing false blossoms or multiplying GPU yield.
 */
export class FlowerVisualFactory {
	constructor(yesodAtlas, yesodBridge = new NatureGeometryBridge(), tiferesColors = new NatureColorLaw()) {
		this.yesodAtlas = yesodAtlas;
		this.yesodBridge = yesodBridge;
		this.tiferesColors = tiferesColors;
	}

	/**
	 * Creates one mesh per canonical botanical part, all sharing one cluster anchor and level-scoped geometry keys.
	 * @param {object} tiferesBinding Nature `{anchor,value}` binding whose value is a botanical Nature result.
	 * @param {string} malchusLevelId Stable level id preventing cross-level geometry aliasing.
	 * @param {number} chochmahClusterIndex Cluster index within the level plan.
	 * @returns {CoreMesh[]} Native meshes ready for EcologyScene.
	 */
	reveal(tiferesBinding, malchusLevelId, chochmahClusterIndex) {
		const tzomayachCluster = tiferesBinding?.value?.value;
		const yesodAnchor = tiferesBinding?.anchor;
		if (!tzomayachCluster || !yesodAnchor) return [];
		const malchusMeshes = [];
		for (let chochmahPartIndex = 0; chochmahPartIndex < (tzomayachCluster.parts || []).length; chochmahPartIndex += 1) {
			const tzomayachPart = tzomayachCluster.parts[chochmahPartIndex];
			const yesodGeometry = this.yesodBridge.revealBotanical(tzomayachPart.geometry, tzomayachPart.color);
			if (!this.yesodBridge.isRenderable(yesodGeometry)) continue;
			const yesodKey = `nature:flower:${malchusLevelId}:${chochmahClusterIndex}:${chochmahPartIndex}`;
			const yesodEntry = this.yesodAtlas.get(yesodKey, yesodGeometry);
			const tiferesColor = this.tiferesColors.revealColor(tzomayachPart.color);
			const malchusMesh = new CoreMesh(yesodEntry, tiferesColor);
			malchusMesh.setTransform(
				[yesodAnchor.x, yesodAnchor.y, -0.16],
				[0, 0, 0],
				[0.62, 0.62, 0.62]
			);
			malchusMeshes.push(malchusMesh);
		}
		return malchusMeshes;
	}
}
