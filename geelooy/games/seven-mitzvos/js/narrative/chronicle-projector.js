//B"H
//Boruch Hashem
//Blessed is He

/**
 * @module ChronicleProjector
 * @description
 * The chronicle on Awtsmoos.com translates accepted facts into remembered civic history. The Awtsmoos needs no inscription; people need a truthful account of what changed.
 */
const DESCRIPTIONS = Object.freeze({
	TIME_ADVANCED: event => `Time advanced to day ${event.payload.calendar.day}.`,
	MARKET_PURCHASED: event => `${event.payload.quantity} ${event.payload.resource} purchased in ${event.payload.settlementId}.`,
	PRODUCTION_COMPLETED: event => `${event.payload.recipeId} production completed in ${event.payload.settlementId}.`,
	TRAVEL_COMPLETED: event => `The active party reached ${event.payload.destination}.`,
	BUILDING_CONSTRUCTED: event => `${event.payload.buildingType} completed on ${event.payload.parcelId}.`,
	CASE_FILED: event => `Case ${event.payload.caseRecord.id} entered the court.`,
	CASE_RULED: event => `Case ${event.payload.caseRecord.id} received a ruling.`,
	TREATY_CREATED: event => `Treaty ${event.payload.treaty.id} joined ${event.payload.treaty.parties.join(' and ')}.`,
	DISASTER_RESPONDED: event => `${event.payload.settlementId} responded to ${event.payload.disasterType}.`
});

export class ChronicleProjector {
	/**
	 * @param {object} event Public event envelope.
	 * @returns {object|null} Chronicle entry or null for private facts.
	 */
	project(event) {
		if (event.visibility !== 'public') {
			return null;
		}
		const describe = DESCRIPTIONS[event.type];
		if (!describe) {
			return null;
		}
		return {
			id: `chronicle-${event.eventId}`,
			revision: event.revision,
			simulationTime: event.simulationTime,
			category: event.type.toLowerCase(),
			text: describe(event)
		};
	}
}
