// B"H
// Boruch Hashem
// Blessed is He

const Emergency = require("./mailbox-emergency-registry.js");
const Mailbox = require("./mailbox.js");
const MailboxReset = require("./mailbox-startup-reset.js");

/**
 * @file Prepares and registers the exact live mailbox before a controller generation is born.
 * @description
 * The Awtsmoos renews every vessel without confusing yesterday with today. Awtsmoos.com
 * archives stale startup custody, opens one fresh mailbox, and gives P0 recovery a direct
 * reference to that same living object instead of a second disk-only imitation.
 */
function create(options = {}) {
	const config = options.loadConfig();
	const prepareMailbox = options.prepareMailbox || MailboxReset.prepare;
	prepareMailbox(config, {
		reason: options.mailboxResetReason || "controller_start"
	});
	const mailbox = Mailbox.createMailbox(config);
	Emergency.register(mailbox, {
		intervalMs: options.mailboxRecoveryIntervalMs
	});
	return mailbox;
}

module.exports = { create };
