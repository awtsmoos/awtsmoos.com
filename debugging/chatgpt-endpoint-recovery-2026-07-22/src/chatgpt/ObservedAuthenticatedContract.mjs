//B"H
// Boruch Hashem
// Blessed is He

/**
 * This dated contract is evidence, not a public API promise. The Awtsmoos
 * revealed it through authenticated DOM and direct turns on 2026-07-23, while
 * awtsmoos.com retains routes and shapes without credential or socket URL values.
 */
export const observedAuthenticatedContract = Object.freeze({
	observedAt: "2026-07-23",
	mode: "authenticated Plus web surface",
	preparationSequence: [
		"/backend-api/f/conversation/prepare",
		"/backend-api/sentinel/chat-requirements/prepare",
		"/backend-api/f/conversation",
		"/backend-api/sentinel/ping",
		"/backend-api/sentinel/chat-requirements/finalize"
	],
	conversation: Object.freeze({
		method: "POST",
		pathname: "/backend-api/f/conversation",
		requestContentType: "application/json",
		responseContentType: "text/event-stream; charset=utf-8",
		retainedLegacyFields: ["action", "messages", "parent_message_id", "model"],
		newBodyFields: [
			"client_prepare_state", "timezone_offset_min", "timezone",
			"conversation_mode", "enable_message_followups", "system_hints",
			"supports_buffering", "supported_encodings", "client_contextual_info",
			"paragen_cot_summary_display_override", "force_parallel_switch",
			"thinking_effort", "local_function_names"
		],
		sentinelHeaders: [
			"OpenAI-Sentinel-Chat-Requirements-Prepare-Token",
			"OpenAI-Sentinel-Proof-Token",
			"OpenAI-Sentinel-Turnstile-Token"
		]
	}),
	handoff: Object.freeze({
		events: ["resume_conversation_token", "stream_handoff", "[DONE]"],
		selectedOption: "subscribe_ws_topic",
		requiredFields: ["conversation_id", "topic_id"],
		answerIncludedInPostResponse: false
	}),
	topicTransport: Object.freeze({
		origin: "wss://ws.chatgpt.com/",
		urlPersistenceAllowed: false,
		command: {
			type: "subscribe",
			fields: ["topic_id", "offset"],
			offset: "0"
		},
		frameTypes: ["reply", "subscribe", "message", "conversation-turn-stream", "stream-item"],
		encodedItemEvents: [
			"delta_encoding", "input_message", "delta", "title_generation", "message_marker"
		],
		deltaOperations: ["add", "append", "patch"],
		terminalMarker: "last_token"
	}),
	initiators: Object.freeze({
		application: "cdn/assets/2340486e-ochsjnnr5ckjjz3o.js:26:3287 function o",
		sentinelProof: "sentinel/20260423af3c/sdk.js:1:27054 function Ce"
	}),
	directMode: Object.freeze({
		controller: "fresh authenticated root tab with pre-load WebSocket constructor proxy",
		envelope: "fresh page-generated request captured and carrier request suppressed",
		request: "same-origin page fetch with captured current headers and mutated JSON body",
		answer: "app-owned WebSocket topic subscription reduced from v1 delta items",
		navigation: "target conversation is never visited",
		credentialsPersistedByLibrary: false
	})
});
