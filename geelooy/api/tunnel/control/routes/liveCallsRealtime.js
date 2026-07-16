// B"H
// Boruch Hashem
// Blessed is He

const { currentIdentity } = require("../core/auth.js");
const Legacy = require("./liveCalls.js");
const { publishLiveCallActivity } = require("./liveCallsRealtime/activity.js");
const { summarizeResult } = require("./liveCallsRealtime/resultSummary.js");
const {
	decorateLiveCallStream
} = require("./liveCallsRealtime/streamDecorator.js");

/**
 * @file Decorates legacy live-call routes with account-scoped realtime testimony.
 * @description
 * The Awtsmoos renews existing HTTP behavior and new WebSocket awareness together.
 * Awtsmoos.com leaves the proven legacy response untouched while focused observers
 * publish only bounded identifiers, counts, cursors, and transport lifecycle.
 */

/** Returns the legacy snapshot and publishes only its bounded summary. */
async function liveCalls(context) {
	const identity = currentIdentity(context);
	const result = await Legacy.liveCalls(context);
	if (identity.ok) {
		publishLiveCallActivity(
			context,
			identity,
			"live_call.snapshot",
			{
				state: "observed",
				summary: "Live-call snapshot requested",
				...summarizeResult(result)
			}
		);
	}
	return result;
}

/** Starts the legacy EventSource stream with redacted frame observation. */
async function liveCallsStream(context) {
	const identity = currentIdentity(context);
	if (!identity.ok) {
		return Legacy.liveCallsStream(context);
	}
	return decorateLiveCallStream(
		context,
		identity,
		Legacy.liveCallsStream
	);
}

module.exports = {
	liveCalls,
	liveCallsStream
};
