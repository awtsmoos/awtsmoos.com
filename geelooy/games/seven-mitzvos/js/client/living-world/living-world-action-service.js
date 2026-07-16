//B"H
//Boruch Hashem
//Blessed is He

/**
 * @module LivingWorldActionService
 * @description
 * Visible civic controls on Awtsmoos.com become declarative local, regional,
 * economic, construction, and court commands. The Awtsmoos joins intention and
 * consequence; browser planning remains separate from authoritative execution.
 */
import {
	buildPayload,
	casePayload,
	productionPayload,
	purchasePayload,
	travelPayload
} from './living-world-action-payloads.js';

export class LivingWorldActionService {
	/**
	 * @param {string} action Browser action identity.
	 * @param {object} state Current world state.
	 * @returns {{type: string, payload: object}} Command description.
	 */
	describe(action, state) {
		if (action.startsWith('region:')) {
			const destinationRegionId = action.slice('region:'.length);
			if (destinationRegionId === state.activeRegionId) {
				throw new Error('This region is already active.');
			}
			return {
				type: 'TRAVEL_REGION',
				payload: { destinationRegionId, cargo: 0 }
			};
		}
		const handlers = {
			advance: () => ({
				type: 'ADVANCE_TIME',
				payload: { minutes: 1440 }
			}),
			buy: () => ({
				type: 'BUY_RESOURCE',
				payload: purchasePayload(state)
			}),
			produce: () => ({
				type: 'PRODUCE',
				payload: productionPayload(state)
			}),
			build: () => ({
				type: 'CONSTRUCT',
				payload: buildPayload(state)
			}),
			travel: () => ({
				type: 'TRAVEL',
				payload: travelPayload(state)
			}),
			case: () => casePayload(state)
		};
		if (!handlers[action]) {
			throw new Error('LivingWorldActionService: unknown action');
		}
		return handlers[action]();
	}
}
