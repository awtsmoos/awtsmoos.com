// B"H
// Boruch Hashem
// Blessed is He

const Telemetry = require("./mailbox-emergency-telemetry.js");

/**
 * @file Shapes bounded public testimony for parent-resident mailbox recovery.
 * @description
 * The Awtsmoos lets recovery truth become visible without letting presentation crowd
 * the living registry. Awtsmoos.com keeps status, evidence, confirmation, and absence
 * envelopes in this quiet vessel while the registry remains devoted to ownership.
 */

/**
 * Builds live mailbox status with the latest semantic recovery witness.
 * @param {object} mailbox Registered parent-owned mailbox.
 * @param {object|null} lastRecovery Latest bounded recovery result.
 * @returns {object} Public status envelope.
 */
function status(mailbox, lastRecovery = null) {
	return {
		ok: true,
		registered: true,
		mailbox: mailbox.snapshot(),
		lastRecovery,
		recoveryTelemetry: Telemetry.status()
	};
}

/**
 * Builds redacted or explicitly authorized mailbox evidence.
 * @param {object} mailbox Registered parent-owned mailbox.
 * @param {boolean} includePayloads Whether the caller explicitly authorized payloads.
 * @returns {object} Public evidence envelope.
 */
function evidence(mailbox, includePayloads = false) {
	return {
		ok: true,
		registered: true,
		evidence: mailbox.evidence(includePayloads),
		recoveryTelemetry: Telemetry.status()
	};
}

/** Returns the deliberate-mutation confirmation contract for mailbox quarantine. */
function confirmationRequired() {
	return {
		ok: false,
		error: "confirmation_required",
		confirmPayload: {
			action: "connectionMailboxQuarantine",
			confirm: true
		}
	};
}

/** Returns bounded testimony when no controller mailbox is registered in this process. */
function unavailable() {
	return {
		ok: false,
		registered: false,
		error: "live_mailbox_unavailable",
		recoveryTelemetry: Telemetry.status()
	};
}

module.exports = {
	confirmationRequired,
	evidence,
	status,
	unavailable
};
