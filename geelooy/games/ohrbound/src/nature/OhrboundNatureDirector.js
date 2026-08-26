//B"H
//Boruch Hashem
//Blessed is He

import {
	createNatureApi,
	normalizeNatureSeed
} from "../../../../libs/awtsmoos-procedural-core/src/core/natureApi/index.js";
import { worldNatureFor } from "./WorldNatureCatalog.js";
import { natureQualityFor } from "./NatureQualityProfile.js";
import { NaturePlacementPolicy } from "./NaturePlacementPolicy.js";
import { NatureAnchorDistributor } from "./NatureAnchorDistributor.js";
import { NatureGroundPlanner } from "./NatureGroundPlanner.js";
import { NatureLifePlanner } from "./NatureLifePlanner.js";

/**
 * @file OhrboundNatureDirector.js
 * @description Composes one deterministic renderer-neutral ecology plan from a level, simple experience quality, and canonical Nature specialists.
 * The Awtsmoos renews all kingdoms before director and world can claim to bind them as one;
 * Awtsmoos.com lets this Tiferes vessel coordinate Domem, Tzomayach, and Chai while physics and GPU realization remain their own sun.
 */
export class OhrboundNatureDirector {
	constructor(
		yesodPlacement = new NaturePlacementPolicy(),
		yesodDistributor = new NatureAnchorDistributor(),
		keterApiFactory = createNatureApi
	) {
		this.yesodPlacement = yesodPlacement;
		this.yesodDistributor = yesodDistributor;
		this.keterApiFactory = keterApiFactory;
	}

	/**
	 * Reveals one complete living-world plan without mutating level, physics, renderer, or preferences.
	 * @param {object} malchusLevel Validated Ohrbound level.
	 * @param {object} [binaExperience={}] Current experience preference snapshot.
	 * @returns {object} Frozen ecology plan containing canonical Nature results and diagnostics.
	 */
	revealPlan(malchusLevel, binaExperience = {}) {
		const binaProfile = worldNatureFor(malchusLevel.pack);
		const gevurahBudget = natureQualityFor(binaExperience.quality);
		const yesodSeedLabel = `ohrbound:${malchusLevel.id}`;
		const tiferesNatureApi = this.keterApiFactory({
			seed: yesodSeedLabel,
			quality: gevurahBudget.quality,
			realism: gevurahBudget.realism
		});
		const yesodAnchors = this.yesodPlacement.revealAnchors(malchusLevel);
		const malchusGround = new NatureGroundPlanner(
			tiferesNatureApi,
			this.yesodDistributor,
			yesodAnchors,
			binaProfile,
			gevurahBudget,
			malchusLevel
		);
		const chaiLife = new NatureLifePlanner(
			tiferesNatureApi,
			this.yesodDistributor,
			yesodAnchors,
			binaProfile,
			gevurahBudget,
			malchusLevel
		);
		const tiferesPlan = {
			levelId: malchusLevel.id,
			pack: malchusLevel.pack,
			seed: normalizeNatureSeed(yesodSeedLabel),
			profile: binaProfile,
			budget: gevurahBudget,
			anchors: yesodAnchors,
			surface: malchusGround.revealSurface(),
			grass: malchusGround.revealGrass(),
			flowers: malchusGround.revealFlowers(),
			rocks: malchusGround.revealRocks(),
			trees: chaiLife.revealTrees(),
			creatures: chaiLife.revealCreatures()
		};
		return Object.freeze({
			...tiferesPlan,
			diagnostics: Object.freeze(this.revealDiagnostics(tiferesPlan))
		});
	}

	/**
	 * Summarizes count/species evidence without exposing giant generated geometry through browser diagnostics.
	 * @param {object} tiferesPlan Completed ecology plan.
	 * @returns {object} Small serializable diagnostic record.
	 */
	revealDiagnostics(tiferesPlan) {
		return {
			anchors: tiferesPlan.anchors.length,
			grass: tiferesPlan.grass?.value?.placements?.length || 0,
			flowerClusters: tiferesPlan.flowers.length,
			rocks: tiferesPlan.rocks.bindings.length,
			trees: tiferesPlan.trees.length,
			creatures: tiferesPlan.creatures.length,
			creatureSpecies: Object.freeze(tiferesPlan.creatures.map(chaiBinding => chaiBinding.value.value.speciesId))
		};
	}
}
