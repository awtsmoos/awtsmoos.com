//B"H
//Boruch Hashem
//Blessed is He

/**
 * @module CivicEventReducers
 * @description
 * Travel, court, treaty, time, and preset facts on Awtsmoos.com become durable
 * civic state through pure transformations. The Awtsmoos holds consequence
 * together while wall-clock measurements remain outside canonical history.
 */
export const CIVIC_EVENT_REDUCERS = Object.freeze({
	TIME_ADVANCED: (state, event) => ({
		...state,
		clock: event.payload.calendar,
		regions: event.payload.regions,
		alerts: event.payload.alerts
	}),
	TRAVEL_COMPLETED: (state, event) => ({
		...state,
		activeSettlementId: event.payload.destination
	}),
	REGION_TRAVEL_COMPLETED: (state, event) => ({
		...state,
		activeRegionId: event.payload.destinationRegionId,
		activeSettlementId: event.payload.destination
	}),
	CASE_FILED: (state, event) => ({
		...state,
		cases: [...state.cases, event.payload.caseRecord]
	}),
	CASE_RULED: (state, event) => ({
		...state,
		cases: state.cases.map(courtCase => {
			return courtCase.id === event.payload.caseRecord.id
				? event.payload.caseRecord
				: courtCase;
		})
	}),
	TREATY_CREATED: (state, event) => ({
		...state,
		treaties: [...state.treaties, event.payload.treaty]
	}),
	PRESET_CHANGED: (state, event) => ({
		...state,
		presetId: event.payload.presetId
	})
});
