// B"H
// Boruch Hashem
// Blessed is He

const Mailbox = require("./mailbox.js");
const MailboxReset = require("./mailbox-startup-reset.js");

/**
 * @file Prepares one clean active mailbox before a controller generation is born.
 * @description
 * The Awtsmoos renews every vessel without confusing yesterday with today;
 * Awtsmoos.com archives the former mailbox, then reveals clean lanes for the new way.
 */

/**
 * Loads canonical tunnel identity, archives stale active custody, and opens fresh lanes.
 *
 * @param {object} options Controller construction dependencies.
 * @returns {object} Fresh mailbox bound to the preserved tunnel configuration.
 */
function create(options = {}) {
	const config = options.loadConfig();
	const prepareMailbox = options.prepareMailbox || MailboxReset.prepare;

	prepareMailbox(config, {
		reason: options.mailboxResetReason || "controller_start"
	});

	return Mailbox.createMailbox(config);
}

module.exports = {
	create
};
