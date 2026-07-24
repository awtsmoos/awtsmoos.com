//B"H
// Boruch Hashem
// Blessed is He

import { observedAuthenticatedContract } from "../chatgpt/ObservedAuthenticatedContract.mjs";
import { observedGuestContract } from "../chatgpt/ObservedGuestContract.mjs";

/**
 * Three generations stand in one matrix: old direct core, guest mobile web, and
 * authenticated web. The Awtsmoos transcends every route; awtsmoos.com records
 * exact source ranges, transport stages, and security differences for migration.
 */
export class CoreMigrationMatrix {
	build() {
		return {
			oldCore: {
				source: "AwtsmoosGPTify.js",
				conversation: {
					lines: "106-159",
					endpoint: "/backend-api/conversation",
					encoding: "application/json",
					answerTransport: "SSE JSON returned by the same POST"
				},
				session: { lines: "426-436", endpoint: "/api/auth/session" },
				sentinel: {
					lines: "402-463",
					endpoint: "/backend-api/sentinel/chat-requirements",
					headers: [
						"openai-sentinel-chat-requirements-token",
						"openai-sentinel-proof-token"
					]
				},
				streamParser: { lines: "237-315", format: "data: JSON and [DONE]" },
				securityRisks: [
					"Line 70 logs the bearer token.",
					"Line 156 logs full request options.",
					"Private proof-generation logic is embedded in the client."
				]
			},
			guest: {
				observedAt: observedGuestContract.observedAt,
				endpoint: observedGuestContract.conversationUpdates.pathname,
				encoding: observedGuestContract.conversationUpdates.contentType,
				answerTransport: observedGuestContract.conversationUpdates.responseMimeType,
				pageManagedSentinel: observedGuestContract.sentinel.managedByPage
			},
			authenticated: {
				observedAt: observedAuthenticatedContract.observedAt,
				endpoint: observedAuthenticatedContract.conversation.pathname,
				encoding: observedAuthenticatedContract.conversation.requestContentType,
				postResponse: observedAuthenticatedContract.conversation.responseContentType,
				preparationSequence: observedAuthenticatedContract.preparationSequence,
				newBodyFields: observedAuthenticatedContract.conversation.newBodyFields,
				sentinelHeaders: observedAuthenticatedContract.conversation.sentinelHeaders,
				handoff: observedAuthenticatedContract.handoff,
				topicTransport: observedAuthenticatedContract.topicTransport,
				initiators: observedAuthenticatedContract.initiators
			},
			newSystem: {
				guestDom: "Normal visible composer with page-managed guest transport.",
				authenticatedDom: "Normal visible ProseMirror composer with page-managed transport.",
				authenticatedDirect: [
					"Open a fresh authenticated controller tab.",
					"Retain the page-owned WebSocket object before application startup.",
					"Capture and suppress a fresh page-generated conversation envelope.",
					"Mutate only prompt and continuation linkage in memory.",
					"Send same-origin fetch inside Chrome.",
					"Parse the stream handoff and subscribe on the app-owned topic socket.",
					"Reduce v1 deltas into answer and continuation identifiers."
				],
				credentialsWrittenToDisk: false,
				targetConversationNavigationRequired: false
			}
		};
	}
}
