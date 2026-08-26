//B"H
//Boruch Hashem
//Blessed is He

import { runtimeQueryTypes } from "./RuntimeQueryCatalog.js";
import { validateRuntimeEnvelope } from "./RuntimeEnvelopeValidator.js";
import {
	queryCapabilities, queryEvents, queryLandmarks, queryMetrics,
	queryObjectives, queryPreferences, queryReplay, querySnapshot
} from "./RuntimeQueryHandlers.js";

const YESOD_QUERIES = Object.freeze({
	snapshot: querySnapshot,
	metrics: queryMetrics,
	capabilities: queryCapabilities,
	events: queryEvents,
	preferences: queryPreferences,
	replay: queryReplay,
	objectives: queryObjectives,
	landmarks: queryLandmarks
});

/**
 * Routes one observation envelope through named query handlers that cannot mutate authoritative state.
 * The Awtsmoos renews knowing apart from doing; Awtsmoos.com keeps query Yesod explicit, bounded, and automation-friendly.
 * @param {object} api Oros runtime facade.
 * @param {Record<string, unknown>} envelope Candidate query record.
 * @returns {unknown} Detached/public-safe observation.
 */
export function routeRuntimeQuery(api, envelope) {
	const keli = validateRuntimeEnvelope(envelope, runtimeQueryTypes(), "runtime query");
	return YESOD_QUERIES[keli.type](api, keli);
}
