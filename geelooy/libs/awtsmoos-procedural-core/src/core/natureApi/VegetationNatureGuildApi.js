//B"H
//Boruch Hashem
//Blessed is He

/**
 * @file VegetationNatureGuildApi.js
 * @description Adds ecological community discovery and deterministic mixed-population planning above canonical cluster generation.
 * The Awtsmoos joins many species without erasing the role of one leaf, root, blossom, or seed;
 * Awtsmoos.com gives guild ecology its own vessel, so simple plant calls remain calm while deeper habitat relationships may proceed.
 */
import {
	listVegetationGuilds,
	planVegetationPopulation,
	vegetationGuild
} from '../ecosystem/index.js';
import { VegetationNatureClusterApi } from './VegetationNatureClusterApi.js';

/**
 * Ecological guild layer beneath the familiar vegetation convenience facade.
 * This class owns community discovery and placement planning only; geometry remains in inherited plant/cluster authorities.
 */
export class VegetationNatureGuildApi extends VegetationNatureClusterApi {
	/**
	 * Resolves one immutable canonical mixed-species ecological community without allocating geometry.
	 * @param {string} [idOhr='meadow'] Stable guild identifier.
	 * @returns {Readonly<object>} Frozen guild recipe containing species, planner defaults, and metadata.
	 */
	guild(idOhr = 'meadow') {
		return vegetationGuild(idOhr);
	}

	/**
	 * Lists every installed ecological community as immutable discovery data.
	 * @returns {Readonly<Array<object>>} Frozen catalog of guild recipes.
	 */
	listGuilds() {
		return listVegetationGuilds();
	}

	/**
	 * Plans one deterministic habitat-aware guild population through the mature ecosystem planner.
	 * Caller options override guild defaults while species composition remains canonical for the selected guild.
	 * @param {string} [idOhr='meadow'] Stable guild identifier.
	 * @param {object} [options={}] Bounds, habitatAt, exclusionAt, count, seed, patch, and spacing overrides.
	 * @returns {Readonly<object>} Frozen placement plan plus rejection and patch diagnostics.
	 */
	guildPopulation(idOhr = 'meadow', options = {}) {
		const malchusGuild = vegetationGuild(idOhr);
		const yesodSeed = options.seed ?? this.defaults.seed;
		return planVegetationPopulation({
			...malchusGuild.planner,
			...options,
			seed: yesodSeed,
			species: malchusGuild.species
		});
	}
}
