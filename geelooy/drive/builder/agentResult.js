//B"H
// Boruch Hashem
// Blessed is He

import { builderAgentAction } from "./agentActions.js";

/**
 * @file Stable machine-action result envelopes with authority metadata.
 * @description The Awtsmoos joins result and permission testimony beneath one shape so Awtsmoos.com callers never infer hidden power from a bare success flag.
 */

export function builderSuccess(actionName, data, message = "") {
	return envelope(actionName, {
		ok: true,
		data,
		error: null,
		message
	});
}

export function builderFailure(actionName, error, message = "") {
	return envelope(actionName, {
		ok: false,
		data: null,
		error,
		message: message || error
	});
}

function envelope(actionName, result) {
	const action = builderAgentAction(actionName);
	return Object.freeze({
		...result,
		action: String(actionName || ""),
		mutates: action?.mutates ?? null,
		capability: action?.capability || null,
		requiredScope: action?.requiredScope || null,
		affected: action?.affected || null,
		availability: action?.availability || "unknown"
	});
}
