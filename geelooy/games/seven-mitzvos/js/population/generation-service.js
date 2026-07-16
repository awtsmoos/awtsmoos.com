//B"H
//Boruch Hashem
//Blessed is He

/**
 * @module GenerationService
 * @description
 * Generations on Awtsmoos.com inherit names, relationships, property claims, and compressed history without simulating consciousness. The Awtsmoos creates each life anew; the world preserves lawful continuity.
 */
export class GenerationService {
	/**
	 * @param {object} person Persistent person.
	 * @param {number} years Elapsed years.
	 * @returns {object} Aged person.
	 */
	age(person, years = 1) {
		if (!Number.isInteger(years) || years < 0) {
			throw new Error('GenerationService: years must be nonnegative');
		}
		return { ...person, age: Math.max(0, (person.age || 18) + years) };
	}

	/**
	 * @param {object} estate Estate declaration.
	 * @param {object[]} heirs Ordered heirs.
	 * @returns {object[]} Conserved inheritance shares.
	 */
	inherit(estate, heirs) {
		if (!heirs.length || !Number.isInteger(estate.quantity) || estate.quantity < 0) {
			throw new Error('GenerationService: valid estate and heirs are required');
		}
		const base = Math.floor(estate.quantity / heirs.length);
		let remainder = estate.quantity % heirs.length;
		return heirs.map(heir => {
			const quantity = base + (remainder > 0 ? 1 : 0);
			remainder = Math.max(0, remainder - 1);
			return { heirId: heir.id, resource: estate.resource, quantity };
		});
	}

	/**
	 * @param {object} leader Current leader.
	 * @param {object[]} candidates Eligible candidates.
	 * @returns {object} Deterministically selected successor.
	 */
	successor(leader, candidates) {
		const eligible = candidates.filter(candidate => candidate.id !== leader.id && candidate.eligible);
		if (!eligible.length) {
			throw new Error('GenerationService: no eligible successor');
		}
		return [...eligible].sort((first, second) => {
			return second.trust - first.trust || first.id.localeCompare(second.id);
		})[0];
	}
}
