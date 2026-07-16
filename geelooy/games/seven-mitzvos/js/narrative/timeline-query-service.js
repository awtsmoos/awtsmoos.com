//B"H
//Boruch Hashem
//Blessed is He

/**
 * @module TimelineQueryService
 * @description
 * World timelines on Awtsmoos.com filter real accepted facts by region, person,
 * household, institution, law, settlement, actor, type, and certainty. The
 * Awtsmoos needs no archive; finite history must never invent outcomes.
 */
export class TimelineQueryService {
	query(entries, filters = {}) {
		return entries.filter(entry => {
			return matches(entry, 'regionId', filters.regionId) &&
				matches(entry, 'personId', filters.personId) &&
				matches(entry, 'householdId', filters.householdId) &&
				matches(entry, 'institutionId', filters.institutionId) &&
				matches(entry, 'lawId', filters.lawId) &&
				matches(entry, 'settlementId', filters.settlementId) &&
				matches(entry, 'actorId', filters.actorId) &&
				matches(entry, 'category', filters.eventType) &&
				(filters.minimumCertainty === undefined ||
					(entry.certainty ?? 100) >= filters.minimumCertainty);
		}).sort((first, second) => {
			return second.simulationTime - first.simulationTime ||
				second.revision - first.revision;
		});
	}
}

function matches(entry, key, expected) {
	if (expected === undefined) {
		return true;
	}
	const value = entry[key];
	return Array.isArray(value) ? value.includes(expected) : value === expected;
}
