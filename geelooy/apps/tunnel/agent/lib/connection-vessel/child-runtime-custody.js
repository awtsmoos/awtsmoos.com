// B"H
// Boruch Hashem
// Blessed is He

const Incarnation = require("./connection-incarnation.js");
const MailboxIncarnation = require("./mailbox-incarnation.js");
const Identity = require("./mailbox-custody-identity.js");
const CustodyMetadata = require("./mailbox-custody-metadata.js");
const Phase = require("./custody-progress-phase.js");
const Protocol = require("./protocol.js");
const Reconnect = require("../runtime/main-reconnect-policy.js");

/**
 * @file Owns child-side durable custody transitions, rejection retirement, and exact fencing.
 * @description
 * The Awtsmoos gives one deed continuity while processes change. Awtsmoos.com accepts
 * custody only under exact identity, and retires rejection only in the very child that owns it.
 */
function createCustody(options = {}) {
	function noteParentCustody(receiptId, acknowledgement = {}) {
		const expectedIncarnation = currentIncarnation();
		if (!Incarnation.matches(expectedIncarnation, acknowledgement.childIncarnationId)) {
			return false;
		}
		const metadata = CustodyMetadata.fromAcknowledgement(
			acknowledgement,
			options.state.generation,
			expectedIncarnation
		);
		if (!options.mailbox.noteParentCustody(receiptId, metadata)) return false;
		Reconnect.markAccepted(options.state);
		return options.parent.noteCustody(receiptId);
	}

	function noteCustodyProgress(receiptId, testimony = {}) {
		const expectedIncarnation = currentIncarnation();
		if (!Incarnation.matches(expectedIncarnation, testimony.childIncarnationId)) return false;
		const record = exactCustodyRecord(receiptId);
		if (!record) return false;
		const metadata = {
			...CustodyMetadata.fromEnvelope(testimony),
			childIncarnationId: Incarnation.clean(testimony.childIncarnationId),
			generation: CustodyMetadata.positiveGeneration(testimony.generation),
			phase: Phase.clean(testimony.phase),
			resultState: String(testimony.resultState || "").trim(),
			workerId: String(testimony.workerId || "").trim()
		};
		if (metadata.generation !== Number(options.state.generation || 0)) return false;
		if (!Identity.matches(record, metadata)) return false;
		if (!Phase.canAdvance(record.phase, metadata.phase)) return false;
		return options.mailbox.noteCustodyProgress(receiptId, metadata);
	}

	/** Retires exactly one current-child inbox record that the parent explicitly did not admit. */
	function rejectRequest(receiptId, testimony = {}) {
		const expectedIncarnation = currentIncarnation();
		if (!Incarnation.matches(expectedIncarnation, testimony.childIncarnationId)) return false;
		const generation = CustodyMetadata.positiveGeneration(testimony.generation);
		if (generation !== Number(options.state.generation || 0)) return false;
		const record = exactInboxRecord(receiptId, expectedIncarnation);
		if (!record) return false;
		const settlement = options.mailbox.acknowledge(receiptId);
		return Boolean(settlement?.inbox);
	}

	function currentIncarnation() {
		return Incarnation.clean(options.state.childIncarnationId);
	}

	function exactCustodyRecord(receiptId) {
		const records = options.mailbox.snapshot()?.inbox?.parentCustodyRecords || [];
		const key = String(receiptId || "").trim();
		return records.find(record => String(record.id || "") === key) || null;
	}

	function exactInboxRecord(receiptId, expectedIncarnation) {
		const key = String(receiptId || "").trim();
		return MailboxIncarnation.currentValues(
			options.mailbox.inbox?.() || [], expectedIncarnation
		).find(record => Protocol.requestId(record) === key) || null;
	}

	return { noteCustodyProgress, noteParentCustody, rejectRequest };
}

module.exports = { createCustody };
