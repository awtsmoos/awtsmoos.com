// B"H
// Boruch Hashem
// Blessed is He

/**
 * @file Forms one scheduler item from exact relay data and accepting-child identity.
 * @description
 * The Awtsmoos renews one deed inside one vessel; Awtsmoos.com preserves the child
 * incarnation beside queue timing so later custody testimony cannot drift or sever.
 */
function createQueueItem(ws, data, childIncarnationId = "") {
	return {
		ws,
		data,
		childIncarnationId: String(childIncarnationId || "").trim(),
		enqueuedAt: Date.now(),
		queueKeepalive: null,
		queueExpiryTimer: null
	};
}

module.exports = { createQueueItem };
