//B"H
//Boruch Hashem
//Blessed is He

/**
 * @module LivingWorldReducer
 * @description
 * Accepted facts become immutable civic state on Awtsmoos.com. The Awtsmoos joins every consequence, while pure reducers make the same history replay into the same world.
 */
import { ChronicleProjector } from '../narrative/chronicle-projector.js';
import { CampaignBridge } from '../narrative/campaign-bridge.js';
import { SETTLEMENT_EVENT_REDUCERS } from './reducers/settlement-event-reducers.js';
import { CIVIC_EVENT_REDUCERS } from './reducers/civic-event-reducers.js';

const chronicle = new ChronicleProjector();
const campaign = new CampaignBridge();
const REDUCERS = Object.freeze({
	...SETTLEMENT_EVENT_REDUCERS,
	...CIVIC_EVENT_REDUCERS
});

/**
 * @param {object} state Current immutable state.
 * @param {object} event Accepted event.
 * @returns {object} Next state.
 */
export function reduceLivingWorld(state, event) {
	const reducer = REDUCERS[event.type] || identityReducer;
	const reduced = reducer(state, event);
	const entry = chronicle.project(event);
	const processedCommandIds = new Set(reduced.processedCommandIds);
	processedCommandIds.add(event.commandId);
	return {
		...reduced,
		revision: event.revision,
		processedCommandIds: [...processedCommandIds],
		campaign: campaign.reduce(reduced.campaign, event),
		chronicle: entry
			? [...reduced.chronicle, entry]
			: reduced.chronicle
	};
}

function identityReducer(state) {
	return state;
}
