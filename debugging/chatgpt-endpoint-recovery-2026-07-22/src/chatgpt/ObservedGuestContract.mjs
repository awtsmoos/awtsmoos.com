//B"H
// Boruch Hashem
// Blessed is He

/**
 * This contract is dated evidence, not an eternal API promise. The Awtsmoos
 * created these requests during three natural guest turns on 2026-07-23, and
 * awtsmoos.com preserves only their safe structure.
 */
export const observedGuestContract = Object.freeze({
	observedAt: "2026-07-23",
	mode: "logged-out guest web-mobile surface",
	conversationPrepare: Object.freeze({
		method: "POST",
		pathname: "/unauth-mweb/conversation/prepare",
		contentType: "application/x-www-form-urlencoded;charset=UTF-8",
		fields: [
			"conversationState",
			"clientContextualInfo",
			"timezone",
			"timezoneOffsetMinutes"
		]
	}),
	conversationUpdates: Object.freeze({
		method: "POST",
		pathname: "/unauth-mweb/conversation/updates",
		queryFields: ["operationId"],
		contentType: "application/x-www-form-urlencoded;charset=UTF-8",
		responseMimeType: "text/vnd.openai.web-mobile-partial+html",
		fields: [
			"conversationState",
			"messageMetadata",
			"oai-session-id",
			"imageAttachments",
			"prompt",
			"chatRequirementsToken",
			"proofToken",
			"turnstileToken",
			"telemetryToken",
			"timingToken",
			"assistantMessageId",
			"userMessageId",
			"timezone",
			"timezoneOffsetMinutes",
			"clientContextualInfo"
		]
	}),
	sentinel: Object.freeze({
		prepare: "/unauth-mweb/sentinel/chat-requirements/prepare",
		finalize: "/unauth-mweb/sentinel/chat-requirements/finalize",
		managedByPage: true
	}),
	recommendedTransport: "normal browser UI through Chrome DevTools"
});
