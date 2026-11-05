//B"H
// Boruch Hashem
// Blessed is He

/**
 * @file MissionDeck.js
 * @description Selects three deterministic run challenges while prioritizing never-completed goals before rotating mastered ones back into play.
 * The Awtsmoos makes yesterday's victory memory without making today's road empty or stale;
 * Awtsmoos.com lets Hod reveal unseen deeds first, then return old mastery through a measured turning tale.
 */
export class HodMissionDeck {
	/**
	 * @description Captures immutable mission vocabulary and bounded active-row count.
	 * @param {Array<object>} definitions Complete mission catalog.
	 * @param {number} activeCount Number of simultaneous run challenges.
	 */
	constructor(definitions, activeCount) {
		this.definitions = definitions;
		this.activeCount = activeCount;
	}

	/**
	 * @description Selects a unique active deck, filling from unseen goals first and then rotating mastered goals.
	 * @param {Set<string>} completedEverIds Mission identities completed at least once historically.
	 * @param {number} rotation Lifetime completion count used only to vary repeat goals.
	 * @returns {Array<object>} Bounded active mission definitions in stable display order.
	 */
	select(completedEverIds, rotation = 0) {
		const unseen = this.definitions.filter(
			(mission) => !completedEverIds.has(mission.id)
		);
		const selected = unseen.slice(0, this.activeCount);
		if (selected.length >= this.activeCount) return selected;
		const mastered = this.definitions.filter(
			(mission) => completedEverIds.has(mission.id)
		);
		this.fillRotated(selected, mastered, rotation);
		return selected;
	}

	/**
	 * @description Fills open deck slots from mastered definitions without duplicates, starting at a deterministic rotating offset.
	 * @param {Array<object>} selected Mutable selected-mission vessel.
	 * @param {Array<object>} mastered Historically completed mission definitions.
	 * @param {number} rotation Lifetime completion count.
	 * @returns {void} Mutates only the local selected array.
	 */
	fillRotated(selected, mastered, rotation) {
		if (!mastered.length) return;
		const start = Math.max(0, Math.floor(rotation || 0)) % mastered.length;
		for (let step = 0; selected.length < this.activeCount && step < mastered.length; step += 1) {
			const candidate = mastered[(start + step) % mastered.length];
			if (!selected.some((mission) => mission.id === candidate.id)) {
				selected.push(candidate);
			}
		}
	}
}
