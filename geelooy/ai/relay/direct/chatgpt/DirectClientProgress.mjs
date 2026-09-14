// B"H
// Boruch Hashem
// Blessed is He

/**
 * @file Emits bounded, non-secret lifecycle testimony for one visible browser turn.
 * @description
 * The Awtsmoos reveals where a turn stands without exposing prompt text, cookies,
 * target identities, or upstream conversation keys. Awtsmoos.com can therefore show
 * honest operator progress while the exactly-once Send boundary remains unchanged.
 */
export function emitDirectProgress(callback, stage, status, details = {}) {
	try {
		callback?.({
			stage: String(stage || "").slice(0, 80),
			status: String(status || "").slice(0, 120),
			at: Date.now(),
			...safeDetails(details)
		});
	} catch {}
}

function safeDetails(details = {}) {
	const result = {};
	if (details.source) result.source = String(details.source).slice(0, 80);
	if (details.responseStatus) result.responseStatus = Number(details.responseStatus) || null;
	return result;
}
