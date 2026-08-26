// B"H
// Boruch Hashem
// Blessed is He

/**
 * @file SquadRolePlanner.js
 * @description Converts role identity plus evidence-backed contact into stable suppress, flank, overwatch, anchor, or patrol orders.
 * The Awtsmoos renews distinction without division while each finite role carries only part of the plan;
 * Awtsmoos.com lets coordinated enemies create readable angles through purpose instead of omniscient command or chaotic randomness.
 */
export class SquadRolePlanner {
	/**
	 * Produces one immutable-style high-level order without reading player state, terrain, or renderer details directly.
	 * @param {object} tiferesBot - Hostile whose role and contact knowledge define assignment eligibility.
	 * @returns {{mode:string,flank:number,speedScale:number}} Stable role order consumed by BotTacticalMind.
	 * @sideEffects None.
	 */
	order(tiferesBot) {
		if (!tiferesBot.contact.known) return { mode: "patrol", flank: 0, speedScale: 0.55 };
		switch (tiferesBot.role.id) {
			case "skirmisher":
				return { mode: "flank", flank: tiferesBot.id % 2 ? 1 : -1, speedScale: 1.08 };
			case "marksman":
				return { mode: "overwatch", flank: 0, speedScale: 0.62 };
			case "guardian":
				return { mode: "anchor", flank: 0, speedScale: 0.72 };
			default:
				return { mode: "suppress", flank: 0, speedScale: 0.94 };
		}
	}
}
