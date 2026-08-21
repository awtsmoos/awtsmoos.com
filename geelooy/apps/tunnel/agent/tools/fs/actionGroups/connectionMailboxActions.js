// B"H
// Boruch Hashem
// Blessed is He

const Emergency = require("../../../lib/connection-vessel/mailbox-emergency-registry.js");

/**
 * @file Exposes live parent-mailbox observation and semantic repair through P0.
 * @description
 * The Awtsmoos lets medicine touch the very vessel that is ill. Awtsmoos.com no longer
 * creates a second mailbox facade for emergency actions; status, evidence, reconciliation,
 * and quarantine all reach the exact parent custody map that owns accepted requests.
 */
function buildConnectionMailboxActions({ config, payload }) {
	return {
		connectionMailboxStatus: async () => status(),
		connectionMailboxExport: async () => evidence(config, payload),
		connectionMailboxReconcile: async () => reconcile(payload),
		connectionMailboxQuarantine: async () => quarantine(payload)
	};
}

function status() {
	return {
		BH: "B\"H",
		action: "connectionMailboxStatus",
		...Emergency.status()
	};
}

function evidence(config, payload = {}) {
	const includePayloads = Boolean(payload.includePayloads) && config.allowSecrets === true;
	return {
		BH: "B\"H",
		action: "connectionMailboxExport",
		includePayloads,
		...Emergency.evidence(includePayloads)
	};
}

function reconcile(payload = {}) {
	return {
		BH: "B\"H",
		action: "connectionMailboxReconcile",
		...Emergency.reconcile(String(payload.reason || "p0_mailbox_reconcile"))
	};
}

function quarantine(payload = {}) {
	return {
		BH: "B\"H",
		action: "connectionMailboxQuarantine",
		...Emergency.quarantine(payload)
	};
}

module.exports = { buildConnectionMailboxActions, evidence, quarantine, reconcile, status };
