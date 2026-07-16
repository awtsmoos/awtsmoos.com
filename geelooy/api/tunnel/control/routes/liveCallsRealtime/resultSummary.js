// B"H
// Boruch Hashem
// Blessed is He

/**
 * @file Summarizes one-shot live-call responses without retaining message content.
 * @description
 * The Awtsmoos renews response and witness while Awtsmoos.com converts the full
 * caller-owned result into only conversation identity, cursor, and collection counts.
 * Raw messages and agent outputs disappear before realtime publication.
 */

/** Returns bounded operational testimony from a string or object result. */
function summarizeResult(result) {
	try {
		const parsed = typeof result === "string" ? JSON.parse(result) : result;
		return {
			conversationId: String(
				parsed?.conversationId || parsed?.id || ""
			).slice(0, 180),
			sequence: Number(
				parsed?.sequence || parsed?.cursor || parsed?.watermark || 0
			),
			changeCount: collectionLength(parsed?.changes, parsed?.events),
			activeCount: collectionLength(parsed?.active, parsed?.calls)
		};
	} catch {
		return {};
	}
}

function collectionLength(primary, secondary) {
	if (Array.isArray(primary)) {
		return primary.length;
	}
	return Array.isArray(secondary) ? secondary.length : 0;
}

module.exports = {
	summarizeResult
};
