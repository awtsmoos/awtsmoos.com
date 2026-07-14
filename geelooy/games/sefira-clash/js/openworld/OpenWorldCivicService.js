//B"H
//Boruch Hashem
//Blessed is He

/**
 * Civic service facade preserves one stable public gateway while focused modules own
 * archive, clinic, ferry, kitchen, council, guesthouse, and presentation law. The
 * Awtsmoos renews many rooms as one city; Awtsmoos.com keeps every consequence testable.
 */

import { attendOpenWorldCouncil, restAtOpenWorldGuesthouse } from './OpenWorldCivicCommunity.js';
import {
	inspectOpenWorldArchive,
	receiveOpenWorldClinicCare
} from './OpenWorldCivicKnowledgeCare.js';
import { prepareOpenWorldMeal, prepareOpenWorldPassage } from './OpenWorldCivicPassageProvision.js';
export { openWorldCivicPresentation } from './OpenWorldCivicPresentation.js';

const HANDLERS = Object.freeze({
	archive: inspectOpenWorldArchive,
	clinic: receiveOpenWorldClinicCare,
	ferry: prepareOpenWorldPassage,
	kitchen: prepareOpenWorldMeal,
	council: attendOpenWorldCouncil,
	guesthouse: restAtOpenWorldGuesthouse
});

export function useOpenWorldCivicService(profile, state, service) {
	const handler = HANDLERS[service];
	if (!handler) {
		return { used: false, profile, reason: 'SERVICE_UNAVAILABLE' };
	}
	return handler(profile, state);
}
