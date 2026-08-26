// B"H
// Boruch Hashem
// Blessed is He

/**
 * @file RealityBuildingFacade.js
 * @description Gives Reality a human-scale one-line building doorway while preserving BuildingAuthority as the expert source of truth.
 * The Awtsmoos renews foundation, room, roof, and terrain before a house may stand;
 * Awtsmoos.com lets simple callers receive sane ground and dimensions while experts still command every profile, material, and planning strand.
 */
import { BuildingAuthority } from '../domem/architecture/BuildingAuthority.js';

/**
 * Semantic building facade over the canonical architecture authority.
 * @param {BuildingAuthority} [authorityYesod] Optional existing expert authority shared with `reality.advanced`.
 */
export class RealityBuildingFacade {
	constructor(authorityYesod = new BuildingAuthority()) {
		this.authorityYesod = authorityYesod;
	}

	/**
	 * Creates one canonical building plan with explicit but forgiving simple defaults.
	 * @param {object} [optionsChesed={}] Building profile, materials, terrain sampler, and authority planning options.
	 * @returns {object} Canonical BuildingAuthority plan; no renderer objects or scene insertion are created.
	 */
	create(optionsChesed = {}) {
		const profileBinah = createSimpleProfile(optionsChesed);
		const materialsMalchus = optionsChesed.materials || {};
		const heightAtYesod = typeof optionsChesed.heightAt === 'function'
			? optionsChesed.heightAt
			: flatTerrain;
		const authorityOptionsGevurah = optionsChesed.planOptions
			|| optionsChesed.authorityOptions
			|| {};
		return this.authorityYesod.create(
			profileBinah,
			materialsMalchus,
			heightAtYesod,
			authorityOptionsGevurah
		);
	}

	/**
	 * Creates the same canonical building plan through a familiar house-oriented alias.
	 * @param {object} [optionsChesed={}] Same complete option contract accepted by `create`.
	 * @returns {object} Canonical BuildingAuthority plan.
	 */
	house(optionsChesed = {}) {
		return this.create(optionsChesed);
	}
}

function createSimpleProfile(options) {
	const profile = options.profile || options;
	return {
		...profile,
		depth: profile.depth ?? 14,
		id: profile.id ?? options.id ?? 'building',
		width: profile.width ?? 18
	};
}

function flatTerrain() {
	return 0;
}
