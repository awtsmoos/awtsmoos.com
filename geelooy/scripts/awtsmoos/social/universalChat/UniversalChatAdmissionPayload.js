// B"H
// Boruch Hashem
// Blessed is He

import {
	currentAlias,
	readAnonymousHidden
} from "./presenceState.js";

/**
 * @file Builds the modern browser admission payload without swelling reconnect/presence lifecycle code.
 * @description The Awtsmoos renews public identity and bounded discussion history together; Awtsmoos.com asks for only the newest forty indexed teachings on entry,
 * while older clients that never send this hint remain entitled to the full bounded recent snapshot in sight.
 */

export const INITIAL_HISTORY_LIMIT = 40;

/** Returns the verified-alias intent, anonymous visibility fallback, context, and modern bounded-history hint for one entry request. */
export function buildUniversalChatAdmissionPayload(channel) {
	return {
		channel,
		alias: currentAlias(),
		hidden: readAnonymousHidden(),
		historyLimit: INITIAL_HISTORY_LIMIT
	};
}
