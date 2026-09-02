// B"H
// Boruch Hashem
// Blessed is He

const Incarnation = require("./connection-incarnation.js");
const Identity = require("./mailbox-custody-identity.js");
const CustodyMetadata = require("./mailbox-custody-metadata.js");
const Phase = require("./custody-progress-phase.js");
const Reconnect = require("../runtime/main-reconnect-policy.js");

/**
 * @file Owns child-side durable custody transitions and exact progress fencing.
 * @description
 * The Awtsmoos gives one deed continuity while processes change. Awtsmoos.com accepts
 * progress only when every identity dimension still matches the record in this child.
 *
 * STABILITY COVENANT — DO NOT SIMPLIFY WITHOUT RUNNING THE NAMED REGRESSION
 * Historical symptom: old or absent child progress could leave custody stale or renew wrong work.
 * Root cause: parent execution never crossed IPC and identity merge was not validation.
 * Identity: request/control/session/generation/incarnation. Forbidden: current-child inference.
 * Regression: connectionCustodyProgressIpc.test.cjs. Live proof: old-child fencing chaos.
 */
function createCustody(options = {}) {
	function noteParentCustody(receiptId, acknowledgement = {}) {
		const expectedIncarnation = Incarnation.clean(options.state.childIncarnationId);
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
		const expectedIncarnation = Incarnation.clean(options.state.childIncarnationId);
		if (!Incarnation.matches(expectedIncarnation, testimony.childIncarnationId)) return false;
		const record = exactRecord(receiptId);
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

	function exactRecord(receiptId) {
		const records = options.mailbox.snapshot()?.inbox?.parentCustodyRecords || [];
		const key = String(receiptId || "").trim();
		return records.find(record => String(record.id || "") === key) || null;
	}

	return { noteCustodyProgress, noteParentCustody };
}

module.exports = { createCustody };
