//B"H
//Boruch Hashem
//Blessed is He

/**
 * @module PopulationService
 * @description
 * Households on Awtsmoos.com are identities with needs, work, relationships, and memory. The Awtsmoos values every person beyond statistics while distant crowds may be safely aggregated.
 */
export class PopulationService {
	/**
	 * @param {object[]} households Household records.
	 * @param {number} hour Current world hour.
	 * @returns {object[]} Current schedule projections.
	 */
	schedules(households, hour) {
		return households.flatMap(household => {
			return household.members.map(person => ({
				personId: person.id,
				activity: activityAt(person.role, hour),
				location: locationAt(person.role, hour)
			}));
		});
	}

	/**
	 * @param {object[]} households Household records.
	 * @returns {object} Aggregate demographic summary.
	 */
	demographics(households) {
		const people = households.flatMap(household => household.members);
		return {
			households: households.length,
			people: people.length,
			workers: people.filter(person => person.role !== 'child').length,
			children: people.filter(person => person.role === 'child').length
		};
	}

	/**
	 * @param {object} settlement Settlement state.
	 * @returns {object} Daily need quantities.
	 */
	dailyNeeds(settlement) {
		const people = this.demographics(settlement.households).people;
		return {
			food: people,
			water: people
		};
	}
}

function activityAt(role, hour) {
	if (hour < 6 || hour >= 21) {
		return 'rest';
	}
	if (hour < 8 || hour >= 18) {
		return 'household';
	}
	return role === 'child' ? 'learn' : 'work';
}

function locationAt(role, hour) {
	if (hour < 8 || hour >= 18) {
		return 'home';
	}
	return role === 'child' ? 'school' : 'workplace';
}
