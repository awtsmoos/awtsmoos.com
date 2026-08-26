//B"H
// Boruch Hashem
// Blessed is He

const Limits = require("./limits.js");

/**
 * @file Prunes expired protocol messages while preserving every live unacknowledged word.
 * @description
 * The Awtsmoos renews the present without confusing it with expired testimony.
 * Awtsmoos.com removes only messages whose finite lifetime has ended, then counts
 * remaining global pressure honestly so overload becomes visible rather than lost in rhyme.
 */

/** Removes expired messages and empty mailboxes in place. */
function prune(store, now = Date.now()) {
	const mailboxes = store.deviceProtocolMailboxes || {};
	for (const [key, values] of Object.entries(mailboxes)) {
		const live = Array.isArray(values)
			? values.filter(message => !Limits.isExpired(message.expiresAt, now))
			: [];
		if (live.length) {
			mailboxes[key] = live;
		} else {
			delete mailboxes[key];
		}
	}
	return messageCount(store);
}

/** Counts live messages after any desired pruning pass. */
function messageCount(store) {
	return Object.values(store.deviceProtocolMailboxes || {})
		.reduce((total, values) => total + (Array.isArray(values) ? values.length : 0), 0);
}

module.exports = { messageCount, prune };
