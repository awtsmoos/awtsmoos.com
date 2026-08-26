//B"H
//Boruch Hashem
//Blessed is He

import { scaledNatureLimit } from "./NatureQualityProfile.js";

/**
 * @file NatureLifePlanner.js
 * @description Creates bounded canonical tree and Creature Creator results, then binds them to gameplay-safe world anchors.
 * The Awtsmoos renews trunk, feather, hoof, wing, fur, and living motion before species can name their light;
 * Awtsmoos.com lets this Chai vessel reveal a few truthful organisms while performance Gevurah keeps the player's road bright.
 */
export class NatureLifePlanner {
	constructor(tiferesNatureApi, yesodDistributor, yesodAnchors, binaProfile, gevurahBudget, malchusLevel) {
		this.tiferesNatureApi = tiferesNatureApi;
		this.yesodDistributor = yesodDistributor;
		this.yesodAnchors = yesodAnchors;
		this.binaProfile = binaProfile;
		this.gevurahBudget = gevurahBudget;
		this.malchusLevel = malchusLevel;
	}

	/**
	 * Generates a bounded set of canonical tree bundles at the shared Nature quality and realism profile.
	 * @returns {object[]} Frozen anchor/result bindings whose geometry remains owned by Procedural Core.
	 */
	revealTrees() {
		const gevurahCount = scaledNatureLimit(
			this.gevurahBudget.trees,
			this.binaProfile.organicScale
		);
		const binaPresets = this.binaProfile.trees.slice(0, gevurahCount);
		const binaResults = binaPresets.map((malchusPreset, malchusIndex) => this.tiferesNatureApi.tree(
			malchusPreset,
			{
				id: `${this.malchusLevel.id}:tree:${malchusIndex}`
			}
		));
		return this.yesodDistributor.bind(
			binaResults,
			this.yesodAnchors,
			3
		);
	}

	/**
	 * Generates deterministic Creature Creator individuals while deliberately leaving them visual-only.
	 * @returns {object[]} Frozen anchor/result bindings with canonical phenotype/artifact data.
	 */
	revealCreatures() {
		const gevurahCount = scaledNatureLimit(
			this.gevurahBudget.creatures,
			this.binaProfile.organicScale
		);
		const binaSpecies = this.binaProfile.creatures.slice(0, gevurahCount);
		const binaResults = binaSpecies.map((malchusSpecies, malchusIndex) => this.tiferesNatureApi.creature(
			malchusSpecies,
			{
				id: `${this.malchusLevel.id}:creature:${malchusIndex}`,
				lod: this.gevurahBudget.creatureLod
			}
		));
		return this.yesodDistributor.bind(
			binaResults,
			this.yesodAnchors,
			4
		);
	}
}
