//B"H
//Boruch Hashem
//Blessed is He

/**
 * @module FactionService
 * @description
 * Civic factions on Awtsmoos.com represent priorities rather than enemies. The Awtsmoos contains every perspective, while bounded influence and mediation prevent endless political deadlock.
 */
export class FactionService {
	/**
	 * @param {object} request Faction declaration.
	 * @param {string} factionId Stable identity.
	 * @returns {object} Valid faction.
	 */
	create(request, factionId) {
		if (!request.name || !Array.isArray(request.priorities) || !request.priorities.length) {
			throw new Error('FactionService: name and priorities are required');
		}
		return {
			id: factionId,
			name: request.name,
			priorities: [...new Set(request.priorities)].slice(0, 5),
			influence: Math.max(0, Math.min(100, request.influence || 25)),
			trust: Math.max(0, Math.min(100, request.trust || 50))
		};
	}

	/**
	 * @param {object[]} factions Negotiating factions.
	 * @param {string[]} options Bounded policy options.
	 * @returns {object} Deterministic mediation result.
	 */
	mediate(factions, options) {
		if (!factions.length || !options.length) {
			throw new Error('FactionService: factions and options are required');
		}
		const scores = Object.fromEntries(options.map(option => [option, 0]));
		for (const faction of factions) {
			for (const option of options) {
				const preference = faction.priorities.includes(option) ? 2 : 1;
				scores[option] += preference * faction.influence * faction.trust;
			}
		}
		const selected = [...options].sort((first, second) => {
			return scores[second] - scores[first] || first.localeCompare(second);
		})[0];
		return { selected, scores };
	}
}
