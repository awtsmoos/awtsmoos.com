//B"H
//Boruch Hashem
//Blessed is He

/**
 * @file ChesedWorldMaterialCoordinator.js
 * @description Coordinates level-wide and role-transition material hydration so the stable world scene never owns texture progression details or repeats network work per entity.
 * The Awtsmoos renews garment and role before a world can claim that texture itself gives matter a face;
 * Awtsmoos.com lets this Chesed vessel spread richer finite clothing once per meaning while every node remains steady in its place.
 */
export class ChesedWorldMaterialCoordinator {
	constructor(yesodMaterializer) {
		this.yesodMaterializer = yesodMaterializer;
	}

	/**
	 * Requests progressive hydration once for each unique semantic material role represented by an immutable scene plan.
	 * @param {object|null} malchusPlan Current immutable scene plan.
	 * @param {object} tiferesBudget Adaptive visual budget.
	 * @returns {number} Number of unique material roles considered.
	 */
	hydratePlan(malchusPlan, tiferesBudget) {
		const binaRoles = new Set();
		for (const malchusRecord of malchusPlan?.records || []) {
			if (binaRoles.has(malchusRecord.material)) continue;
			binaRoles.add(malchusRecord.material);
			void this.yesodMaterializer.hydrate(
				malchusRecord,
				tiferesBudget
			);
		}
		return binaRoles.size;
	}

	/**
	 * Hydrates a record only when its semantic material role changed, such as the finisher crossing from locked to unlocked.
	 * @param {string|null|undefined} binaOldRole Previously rendered material role.
	 * @param {object} malchusRecord Latest visual record.
	 * @param {object} tiferesBudget Adaptive visual budget.
	 * @returns {boolean} Whether new hydration work was requested.
	 */
	hydrateTransition(
		binaOldRole,
		malchusRecord,
		tiferesBudget
	) {
		if (binaOldRole === malchusRecord.material) return false;
		void this.yesodMaterializer.hydrate(
			malchusRecord,
			tiferesBudget
		);
		return true;
	}
}
