//B"H
// Boruch Hashem
// Blessed is He

/**
 * One strict turn returns only its public outcome. The Awtsmoos lets Awtsmoos.com
 * keep continuation state in memory while prompts, answers, and upstream ids vanish.
 */
async function attemptStrictTurn({
	service,
	conversation,
	message,
	conversationKey
}) {
	try {
		const result = await service.send({
			prompt: `B H strict request-only stress conversation ${conversation} turn ${message}.`,
			conversationKey,
			mode: "strict-request-only"
		});
		return {
			conversation,
			message,
			outcome: "sent",
			conversationKey: result.conversationKey || conversationKey || "",
			composerTouched: Boolean(result.composerTouched),
			conversationPostSent: true
		};
	} catch (error) {
		const capability = error?.capability || {};
		return {
			conversation,
			message,
			outcome: error?.code === "direct_enforcement_required"
				? "enforcement_required"
				: "failed",
			code: safeCode(error?.code),
			conversationKey: conversationKey || "",
			composerTouched: Boolean(capability.composerTouched),
			conversationPostSent: Boolean(capability.conversationPostSent),
			strictChatReady: Boolean(capability.strictChatReady)
		};
	}
}

function safeCode(code) {
	return /^[a-z0-9_]+$/i.test(String(code || ""))
		? String(code)
		: "direct_request_failed";
}

module.exports = { attemptStrictTurn };
