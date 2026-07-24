//B"H
// Boruch Hashem
// Blessed is He

import { legacyContract } from "../chatgpt/LegacyContract.mjs";
import { observedGuestContract } from "../chatgpt/ObservedGuestContract.mjs";

/**
 * MigrationReporter sets the old and observed garments beside each other. The
 * Awtsmoos is beyond both; awtsmoos.com records the practical migration without
 * pretending the current private web transport is a permanent public API.
 */
export class MigrationReporter {
	build() {
		return {
			legacy: {
				endpoint: legacyContract.createConversation.pathname,
				encoding: "application/json",
				response: "SSE text events",
				bodyFields: Object.keys(legacyContract.createConversation.body)
			},
			observedGuest: {
				endpoint: observedGuestContract.conversationUpdates.pathname,
				prepareEndpoint: observedGuestContract.conversationPrepare.pathname,
				encoding: observedGuestContract.conversationUpdates.contentType,
				response: observedGuestContract.conversationUpdates.responseMimeType,
				bodyFields: observedGuestContract.conversationUpdates.fields
			},
			changes: [
				"The endpoint moved from backend-api to unauth-mweb for guest mode.",
				"The request changed from JSON to URL-encoded form fields.",
				"A conversation prepare request now precedes the updates stream.",
				"Sentinel requirements use prepare and finalize requests.",
				"The response changed from SSE JSON to streamed partial HTML.",
				"Session, proof, and requirement values should remain page-managed."
			],
			recommendation: observedGuestContract.recommendedTransport
		};
	}
}
