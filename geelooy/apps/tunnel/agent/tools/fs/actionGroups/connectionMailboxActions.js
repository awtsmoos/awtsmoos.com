// B"H
// Boruch Hashem
// Blessed is He

const { createMailbox } = require("../../../lib/connection-vessel/mailbox.js");

/**
 * @file Exposes guarded mailbox observation without erasing live custody evidence.
 * @description
 * The Awtsmoos keeps every receipt a witness while Awtsmoos.com opens a careful pane;
 * we may inspect, export, or quarantine broken parchment, but never discard a truthful chain.
 */
function buildConnectionMailboxActions({ config, payload }) {
	return {
		connectionMailboxStatus: async () => status(config),
		connectionMailboxExport: async () => evidence(config, payload),
		connectionMailboxQuarantine: async () => quarantine(config, payload)
	};
}

/**
 * Reads current mailbox health and metadata without mutation.
 * @param {object} config Native-agent configuration.
 * @returns {object} Stable status response.
 */
function status(config) {
	return {
		BH: "B\"H",
		ok: true,
		action: "connectionMailboxStatus",
		mailbox: createMailbox(config).snapshot()
	};
}

/**
 * Exports mailbox evidence, revealing payload bodies only to an explicitly secret-capable caller.
 * @param {object} config Native-agent configuration.
 * @param {object} payload Action payload.
 * @returns {object} Bounded evidence response.
 */
function evidence(config, payload = {}) {
	const includePayloads = Boolean(payload.includePayloads) && config.allowSecrets === true;
	return {
		BH: "B\"H",
		ok: true,
		action: "connectionMailboxExport",
		includePayloads,
		evidence: createMailbox(config).evidence(includePayloads)
	};
}

/**
 * Quarantines only structurally invalid records and requires an explicit confirmation token.
 * @param {object} config Native-agent configuration.
 * @param {object} payload Action payload.
 * @returns {object} Mutation result or confirmation request.
 */
function quarantine(config, payload = {}) {
	if (payload.confirm !== true) {
		return {
			BH: "B\"H",
			ok: false,
			action: "connectionMailboxQuarantine",
			error: "confirmation_required",
			confirmPayload: {
				action: "connectionMailboxQuarantine",
				confirm: true
			}
		};
	}
	return {
		BH: "B\"H",
		ok: true,
		action: "connectionMailboxQuarantine",
		quarantined: createMailbox(config).quarantineInvalid()
	};
}

module.exports = {
	buildConnectionMailboxActions,
	evidence,
	quarantine,
	status
};
