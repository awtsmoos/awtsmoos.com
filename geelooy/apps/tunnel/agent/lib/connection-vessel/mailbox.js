// B"H
// Boruch Hashem
// Blessed is He

const fs = require("node:fs");
const Custody = require("./mailbox-custody.js");
const Evidence = require("./mailbox-evidence.js");
const Incarnation = require("./connection-incarnation.js");
const ObsoleteQuarantine = require("./mailbox-obsolete-quarantine.js");
const QuarantineGuard = require("./mailbox-quarantine-guard.js");
const PoisonQuarantine = require("./mailbox-quarantine.js");
const Store = require("./mailbox-store.js");
const Writer = require("./mailbox-writer.js");

/**
 * @file Joins durable mailbox truth to exact living custody and rejection settlement.
 * @description
 * The Awtsmoos preserves each witness while authority changes from vessel unto vessel.
 * Awtsmoos.com retires rejected ingress without erasing its terminal outbox; only a relay
 * response acknowledgement may destroy both halves of a completed transport testimony.
 */
function createMailbox(config = {}, options = {}) {
	let childIncarnationId = Incarnation.clean(options.childIncarnationId);
	const store = Store.createStore(config, options);
	const custody = Custody.create(options);
	const getChildIncarnationId = () => childIncarnationId;
	const evidence = Evidence.create({ custody, getChildIncarnationId, now: options.now, store });
	const obsoleteQuarantine = ObsoleteQuarantine.create({ getChildIncarnationId, store });
	const quarantine = QuarantineGuard.create({ store });
	const writer = Writer.create({ custody, getChildIncarnationId, store });
	obsoleteQuarantine.sweep();

	function setCurrentIncarnation(value) {
		childIncarnationId = Incarnation.clean(value);
		obsoleteQuarantine.sweep();
		return childIncarnationId;
	}

	function noteDeliveryAttempt(id, metadata = {}) {
		return custody.noteAttempt(id, metadata);
	}

	function noteParentCustody(id, metadata = {}) {
		return custody.noteParent(id, metadata);
	}

	function noteCustodyProgress(id, metadata = {}) {
		return custody.progress(id, metadata);
	}

	function settleCustody(id) {
		return custody.settle(id);
	}

	/** Retires only rejected ingress; terminal outbox survives until relay response ACK. */
	function retireRejectedInbox(id) {
		custody.settle(id);
		return store.remove("inbox", id);
	}

	/** Relay response acknowledgement is the only full destructive settlement boundary. */
	function acknowledge(id) {
		custody.settle(id);
		return {
			inbox: store.remove("inbox", id),
			outbox: store.remove("outbox", id)
		};
	}

	function quarantineExact(id, reason = "semantic_stale_custody") {
		return quarantine.quarantineExact(id, reason);
	}

	/**
	 * C20 poison-message quarantine: moves a deterministically-failing inbox
	 * record aside to semantic quarantine with reason + evidence. Unlike
	 * quarantineExact (whose guard intentionally refuses live records), this is
	 * an explicit, audited path: custody is settled first so the record stops
	 * tripping stall detectors as unsettled, then the durable bytes are moved
	 * byte-identical (restorable) with an audit note carrying the poison
	 * evidence. Only fencing-deliverable records may arrive here; callers must
	 * enforce that before invoking.
	 */
	function quarantinePoisonInbox(id, evidence = {}) {
		const key = String(id || "").trim();
		if (!key) {
			return { moved: false, id: key, reason: "mailbox_id_required" };
		}
		custody.settle(key);
		let moved;
		try {
			moved = PoisonQuarantine.move(
				config,
				"inbox",
				key,
				"poison_delivery_attempts_exhausted"
			);
		} catch (error) {
			return { moved: false, id: key, reason: String(error?.message || error) };
		}
		if (moved && moved.moved === true) {
			appendPoisonEvidence(moved.destination, evidence);
		}
		return { ...moved, id: key, evidence: { ...evidence } };
	}

	/**
	 * Appends the poison evidence to the quarantine audit note written by
	 * mailbox-quarantine.js#move, so forensics can join the quarantine to the
	 * delivery failures that caused it. Best-effort: never throws.
	 */
	function appendPoisonEvidence(destination, evidence) {
		try {
			const auditPath = `${destination}.audit.json`;
			const existing = JSON.parse(fs.readFileSync(auditPath, "utf8"));
			existing.poisonEvidence = { ...evidence };
			fs.writeFileSync(auditPath, `${JSON.stringify(existing, null, 2)}
`, {
				encoding: "utf8",
				mode: 0o600
			});
		} catch {}
	}

	function inbox() {
		return store.list("inbox").map(entry => entry.value);
	}

	function outbox() {
		return store.list("outbox").map(entry => entry.value);
	}

	function outboxOne(id) {
		return store.get("outbox", id)?.value || null;
	}

	function quarantineInvalid() {
		return {
			inbox: store.quarantineInvalid("inbox"),
			outbox: store.quarantineInvalid("outbox")
		};
	}

	return {
		acknowledge,
		evidence: evidence.evidence,
		inbox,
		noteCustodyProgress,
		noteDeliveryAttempt,
		noteParentCustody,
		outbox,
		outboxOne,
		putInbox: writer.putInbox,
		putOutbox: writer.putOutbox,
		quarantineExact,
		quarantineInvalid,
		quarantinePoisonInbox,
		retireRejectedInbox,
		setCurrentIncarnation,
		settleCustody,
		snapshot: evidence.snapshot
	};
}

module.exports = { createMailbox };
