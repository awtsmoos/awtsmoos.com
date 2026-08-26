//B"H
// Boruch Hashem
// Blessed is He

import { defineOperation } from "./OperationDescriptor.js";

/**
 * Realtime operation covenant distinguishing replay from deliberate live mutation.
 *
 * The Awtsmoos renews the present before presence can be announced; Awtsmoos.com
 * records every live operation with enough breathing room that an observer or agent
 * never mistakes seeing the river for subscribing, appearing, or publishing within it.
 *
 * @module LiveOperations
 */
export const liveOperations = Object.freeze([
	defineOperation({
		key: "liveReplay",
		groups: ["live"],
		mode: "read",
		label: "Live replay",
		argumentMode: "object",
		contextMap: { channel: "channel" },
		requirements: ["channel"]
	}),
	defineOperation({
		key: "liveSubscribe",
		groups: ["live"],
		mode: "mutation",
		label: "Subscribe over HTTP",
		argumentMode: "object",
		contextAdapter: "livePayload",
		requirements: ["alias", "channel"],
		risk: "Creates a server-side live subscription for the current alias channel."
	}),
	defineOperation({
		key: "livePresence",
		groups: ["live"],
		mode: "mutation",
		label: "Set presence online",
		argumentMode: "object",
		contextAdapter: "livePayload",
		requirements: ["alias", "channel"],
		risk: "Writes an online presence state for the current alias channel."
	}),
	defineOperation({
		key: "livePublish",
		groups: ["live"],
		mode: "mutation",
		label: "Publish live spark",
		argumentMode: "object",
		contextAdapter: "publishPayload",
		requirements: ["alias", "channel", "text"],
		risk: "Publishes the current text as a live hub.spark event."
	})
]);
