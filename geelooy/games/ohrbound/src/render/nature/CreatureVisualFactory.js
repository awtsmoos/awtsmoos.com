//B"H
//Boruch Hashem
//Blessed is He

import { CoreMesh } from "../CoreMesh.js";
import { NatureGeometryBridge } from "./NatureGeometryBridge.js";
import { creatureColorFor } from "./CreatureSpeciesPalette.js";

/**
 * @file CreatureVisualFactory.js
 * @description Materializes one canonical Creature Creator individual as shared native Core mesh parts without granting gameplay collision authority.
 * The Awtsmoos renews hoof, wing, wool, fur, bone, and motion before a creature can appear in finite sight;
 * Awtsmoos.com lets this Chai vessel reveal the canonical body while Ohrbound keeps ambient life peaceful, bounded, and light.
 */
export class CreatureVisualFactory {
	constructor(yesodAtlas, yesodBridge = new NatureGeometryBridge()) {
		this.yesodAtlas = yesodAtlas;
		this.yesodBridge = yesodBridge;
	}

	/**
	 * Creates one CoreMesh per canonical Creature Creator part with a shared creature transform and level-scoped geometry key.
	 * @param {object} chaiBinding Nature `{anchor,value}` binding for one creature result.
	 * @param {string} malchusLevelId Stable level id preventing correlated phenotype cache aliasing.
	 * @param {number} chochmahCreatureIndex Creature index inside the level plan.
	 * @returns {CoreMesh[]} Native visual-only creature meshes.
	 */
	reveal(chaiBinding, malchusLevelId, chochmahCreatureIndex) {
		const chaiCreature = chaiBinding?.value?.value;
		const yesodAnchor = chaiBinding?.anchor;
		if (!chaiCreature?.artifact?.parts || !yesodAnchor) return [];
		const tiferesColor = creatureColorFor(chaiCreature.speciesId);
		const tiferesScale = this.revealSpeciesScale(chaiCreature.speciesId);
		const malchusMeshes = [];
		for (let chochmahPartIndex = 0; chochmahPartIndex < chaiCreature.artifact.parts.length; chochmahPartIndex += 1) {
			const chaiPart = chaiCreature.artifact.parts[chochmahPartIndex];
			const yesodGeometry = this.yesodBridge.revealCreature(chaiPart, tiferesColor);
			if (!this.yesodBridge.isRenderable(yesodGeometry)) continue;
			const yesodKey = `nature:creature:${malchusLevelId}:${chochmahCreatureIndex}:${chochmahPartIndex}`;
			const yesodEntry = this.yesodAtlas.get(yesodKey, yesodGeometry);
			const malchusMesh = new CoreMesh(yesodEntry, tiferesColor);
			malchusMesh.setTransform(
				[yesodAnchor.x, yesodAnchor.y, -0.08],
				[0, Math.PI * 0.5, 0],
				[tiferesScale, tiferesScale, tiferesScale]
			);
			malchusMeshes.push(malchusMesh);
		}
		return malchusMeshes;
	}

	/**
	 * Keeps creature silhouettes subordinate to platform readability while respecting rough species size differences.
	 * @param {string} chaiSpeciesId Canonical Creature Creator species id.
	 * @returns {number} Uniform world scale.
	 */
	revealSpeciesScale(chaiSpeciesId) {
		const binaScales = {
			deer: 0.48,
			goat: 0.45,
			sheep: 0.44,
			duck: 0.32,
			songbird: 0.26,
			"spark-wisp": 0.34
		};
		return binaScales[chaiSpeciesId] || 0.4;
	}
}
