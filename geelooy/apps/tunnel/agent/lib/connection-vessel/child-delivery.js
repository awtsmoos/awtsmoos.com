// B"H
// Boruch Hashem
// Blessed is He

const fs = require("node:fs");
const path = require("node:path");
const Incarnation = require("./connection-incarnation.js");
const MailboxIncarnation = require("./mailbox-incarnation.js");
const Protocol = require("./protocol.js");
const Replay = require("./child-delivery-replay.js");
const RequestLifecycle = require("./request-lifecycle.js");
const DeviceState = require("../../tools/fs/deviceStateRoot.js");
/**
 * @file Keeps current-incarnation inbound custody durable until terminal testimony exists.
 * @description
 * The Awtsmoos preserves old deeds as evidence without lending them a newborn child's hand.
 * Awtsmoos.com redelivers current-incarnation records directly, and replays
 * obsolete-incarnation records only behind an incarnation fence: deterministic
 * idempotency keys dedupe retries, terminal testimony suppresses the finished,
 * safe reads retry once, and uncertain writes surface visibly instead of
 * executing blindly — so no accepted work is silently lost and no uncertain
 * write is ever executed twice.
 *
 * Delivery layers (each independent):
 * - Incarnation fencing (mailbox-incarnation): only fencing-deliverable records
 *   reach a drain; the fencing filter always runs BEFORE ordering/continuation.
 * - Replay continuation (child-delivery-replay): one failed send is recorded and
 *   skipped so a poison head cannot starve the lane; per-entry outcomes are
 *   reported back here for failure accounting.
 * - Bounded dedup (this file, C18): a FIFO-capped cache keyed by the FULL fencing
 *   tuple (requestId, controlRequestId, generation, childIncarnationId) suppresses
 *   duplicate sends on inbox, fenced, and outbox paths. Keys are inserted only on
 *   successful send and pruned when terminal testimony appears. This layer is
 *   additive to the fenced path's own idempotency-key dedup, which it never
 *   disturbs.
 * - Poison quarantine (this file, C20): envelopes whose consecutive send failures
 *   reach the poison threshold are moved aside to semantic quarantine with reason
 *   + evidence, so one deterministically-failing envelope can never wedge a lane.
 */
function createDelivery(options = {}) {
	let parentReady = false;
	let inboxReplayScheduled = false;
	let outboxReplayScheduled = false;
	let recoveredGeneration = null;
	const replay = Replay.create({
		batchSize: options.replayBatchSize,
		schedule: options.schedule
	});
	const lifecycle = RequestLifecycle.createRequestLifecycle({
		state: options.state,
		transmit
	});
	const recordLifecycle = typeof options.recordLifecycle === "function"
		? options.recordLifecycle
		: () => false;

	// --- Incarnation-fenced redelivery: no lost work, no blind replay ---
	// (sibling C17 area — preserved exactly as landed)
	const SEEN_IDEMPOTENCY_LIMIT = 1000;
	const UNRESOLVED_WRITES_LIMIT = 256;
	const FENCED_CANDIDATE_CAP = 64;
	const seenIdempotencyKeys = new Map();
	const unresolvedWrites = [];
	const fencedCounts = {
		redelivered: 0,
		droppedTerminal: 0,
		dedupedDuplicate: 0,
		unresolved: 0
	};

	// --- C18: bounded full-tuple dedup cache (independent additive layer) ---
	const DEDUP_LIMIT = boundedCount(options.dedupLimit, 4096);
	const dedupCache = new Map();
	const dedupCounts = { duplicate: 0, outboxDuplicate: 0 };

	// --- C20: poison-message failure accounting ---
	const POISON_THRESHOLD = boundedCount(options.poisonThreshold, 10);
	const DELIVERY_FAILURE_LIMIT = 1024;
	const deliveryFailures = new Map();
	const poisonCounts = { quarantined: 0, quarantineFailed: 0 };

	function enqueueRequest(ws, envelope) {
		options.mailbox.putInbox(envelope);
		lifecycle.accept(envelope, ws);
		const receiptId = Protocol.requestId(envelope);
		if (hasTerminal(receiptId)) return flush(receiptId);
		if (parentReady) deliver(envelope);
	}

	function parentDidBecomeReady() {
		parentReady = true;
		redeliver();
		flush();
	}
	function redeliver() {
		if (!parentReady || inboxReplayScheduled) return 0;
		const entries = unsettledInbox();
		pruneDedupForTerminal();
		inboxReplayScheduled = true;
		replay.drain(entries, guardedDeliver, outcomes => {
			inboxReplayScheduled = false;
			noteInboxOutcomes(outcomes, false);
			drainFencedReplay();
		});
		return entries.length;
	}

	// Obsolete-incarnation records replay only after the current-incarnation
	// drain completes, through the same bounded drain and guarded sender, so the
	// existing replay-flag semantics are preserved.
	function drainFencedReplay() {
		const fenced = unsettledFencedInbox();
		if (fenced.length === 0) return 0;
		replay.drain(fenced, guardedDeliverFenced, outcomes => {
			noteInboxOutcomes(outcomes, true);
		});
		return fenced.length;
	}

	// A throwing sender must surface as a failed per-entry outcome (false),
	// never as an escaping exception: the replay flag is reset only by drain's
	// completion path, so an uncaught throw here would permanently disable
	// future inbox redelivery for the life of this child.
	function guardedDeliver(envelope) {
		try {
			return deliver(envelope);
		} catch {
			return false;
		}
	}

	// A throwing fenced gate must likewise surface as a failed per-entry
	// outcome, never as an escaping exception.
	function guardedDeliverFenced(wrapped) {
		try {
			return deliverFenced(wrapped);
		} catch {
			return false;
		}
	}

	/**
	 * C19/C20: consumes per-entry drain outcomes. Successful sends clear the
	 * failure counter for that fencing tuple; failures increment it, and a
	 * tuple whose consecutive failures reach the poison threshold is moved to
	 * poison quarantine. Only fencing-deliverable records ever reach a drain,
	 * so only they are poison-eligible here.
	 */
	function noteInboxOutcomes(outcomes = [], fenced = false) {
		for (const outcome of outcomes) {
			const envelope = fenced
				? MailboxIncarnation.unfence(outcome?.entry)
				: outcome?.entry;
			if (!envelope || typeof envelope !== "object") continue;
			const recordIncarnation = fenced
				? outcome?.entry?.fence?.recordIncarnation
				: "";
			const key = dedupKey(envelope, recordIncarnation);
			if (!key) continue;
			if (outcome?.delivered === true) {
				deliveryFailures.delete(key);
				continue;
			}
			const receiptId = Protocol.requestId(envelope);
			// A record that gained terminal testimony mid-drain is settled, not
			// poison: clear its counter instead of counting a stale failure.
			if (receiptId && hasTerminal(receiptId)) {
				deliveryFailures.delete(key);
				continue;
			}
			const failures = (deliveryFailures.get(key)?.count || 0) + 1;
			rememberFailure(key, receiptId, failures);
			if (failures >= POISON_THRESHOLD) {
				quarantinePoison(envelope, key, receiptId, failures);
			}
		}
	}

	function rememberFailure(key, receiptId, count) {
		if (!deliveryFailures.has(key) && deliveryFailures.size >= DELIVERY_FAILURE_LIMIT) {
			const oldest = deliveryFailures.keys().next();
			if (!oldest.done) deliveryFailures.delete(oldest.value);
		}
		deliveryFailures.set(key, {
			count,
			receiptId: receiptId || "",
			lastAt: new Date().toISOString()
		});
	}

	/**
	 * C20: moves a deterministically-failing envelope aside so it can never
	 * wedge the lane. The durable record is preserved byte-identical in semantic
	 * quarantine with reason + evidence (restorable by hash); custody is settled
	 * so stall detectors stop seeing it as unsettled; a lifecycle event links
	 * the quarantine to the delivery failures for forensics (D24).
	 */
	function quarantinePoison(envelope, key, receiptId, failures) {
		deliveryFailures.delete(key);
		const evidence = {
			reason: "poison_delivery_attempts_exhausted",
			receiptId: receiptId || "",
			consecutiveFailures: failures,
			poisonThreshold: POISON_THRESHOLD,
			childIncarnationId: Incarnation.clean(
				envelope?.childIncarnationId || options.state?.childIncarnationId
			),
			generation: Number(options.state?.generation || 0),
			at: new Date().toISOString()
		};
		let moved = false;
		try {
			if (typeof options.mailbox?.quarantinePoisonInbox === "function") {
				moved = Boolean(
					options.mailbox.quarantinePoisonInbox(receiptId, evidence)?.moved
				);
			} else if (typeof options.quarantinePoison === "function") {
				moved = Boolean(options.quarantinePoison(envelope, evidence)?.moved);
			} else {
				// Graceful degradation without a quarantine sink: at minimum stop
				// the record tripping stall detectors as unsettled custody.
				options.mailbox?.settleCustody?.(receiptId);
			}
		} catch {
			moved = false;
		}
		if (moved) poisonCounts.quarantined += 1;
		else poisonCounts.quarantineFailed += 1;
		recordLifecycle("mailbox_poison_quarantined", {
			receiptId: evidence.receiptId,
			moved,
			consecutiveFailures: failures,
			reason: evidence.reason
		});
		return moved;
	}

	// --- C18: full-fencing-tuple dedup -------------------------------------
	/**
	 * Builds the bounded-dedup key from the FULL fencing tuple
	 * (requestId, controlRequestId, generation, childIncarnationId).
	 * Never requestId alone: the same requestId re-issued under a new
	 * incarnation or generation is a new deed, not a duplicate.
	 */
	function dedupKey(envelope = {}, recordIncarnation = "") {
		const requestId = Protocol.requestId(envelope);
		if (!requestId) return "";
		const controlRequestId = String(envelope?.controlRequestId || "").trim();
		const incarnation = Incarnation.clean(recordIncarnation) ||
			Incarnation.clean(envelope?.childIncarnationId) ||
			Incarnation.clean(options.state?.childIncarnationId);
		const generation = Incarnation.generationKey(
			incarnation,
			options.state?.generation
		);
		// JSON array encoding keeps the tuple unambiguous even if a component
		// contains the separator.
		return JSON.stringify([requestId, controlRequestId, generation]);
	}

	function rememberDedup(key, receiptId) {
		if (!key) return;
		if (!dedupCache.has(key) && dedupCache.size >= DEDUP_LIMIT) {
			const oldest = dedupCache.keys().next();
			if (!oldest.done) dedupCache.delete(oldest.value);
		}
		dedupCache.set(key, receiptId || "");
	}

	function pruneDedupForTerminal() {
		if (dedupCache.size === 0 || typeof options.mailbox?.outboxOne !== "function") return;
		for (const [key, receiptId] of dedupCache) {
			if (receiptId && hasTerminal(receiptId)) {
				dedupCache.delete(key);
				deliveryFailures.delete(key);
			}
		}
	}

	function unsettledInbox() {
		const current = MailboxIncarnation.currentValues(
			options.mailbox.inbox(),
			options.state.childIncarnationId
		);
		return current.filter(envelope =>
			!hasTerminal(Protocol.requestId(envelope))
		);
	}

	// Obsolete records keep their terminal filter inside the fenced gate (not
	// here): the drop must be counted, and terminal testimony may arrive
	// between listing and sending.
	function unsettledFencedInbox() {
		return MailboxIncarnation.fencedValues(
			obsoleteInboxCandidates(),
			options.state.childIncarnationId
		).slice(0, FENCED_CANDIDATE_CAP);
	}

	function obsoleteInboxCandidates() {
		if (typeof options.fencedReplaySource === "function") {
			try {
				const supplied = options.fencedReplaySource();
				return Array.isArray(supplied) ? supplied : [];
			} catch {
				return [];
			}
		}
		return readQuarantinedObsoleteInbox();
	}

	function quarantinedObsoleteInboxDir() {
		if (options.fencedReplayQuarantineDir) {
			return String(options.fencedReplayQuarantineDir);
		}
		const root = DeviceState.awtsmoosRoot({
			tunnelName: options.state?.tunnelName
		});
		return path.join(
			root,
			"connection-mailbox",
			"quarantine",
			"semantic",
			"inbox"
		);
	}

	// Production source: obsolete records the startup sweep preserved under
	// quarantine/semantic/inbox with an "obsolete_child_incarnation" audit note.
	// Anything unreadable, mis-reasoned, or malformed is skipped, never thrown.
	function readQuarantinedObsoleteInbox() {
		const directory = quarantinedObsoleteInboxDir();
		let names;
		try {
			names = fs.readdirSync(directory);
		} catch {
			return [];
		}
		const records = [];
		for (const name of names) {
			if (records.length >= FENCED_CANDIDATE_CAP) break;
			if (!name.endsWith(".json") || name.endsWith(".audit.json")) continue;
			const recordPath = path.join(directory, name);
			if (!obsoleteQuarantineAudit(recordPath)) continue;
			const value = quarantinedRecordValue(recordPath);
			if (value) records.push(value);
		}
		return records;
	}

	function obsoleteQuarantineAudit(recordPath) {
		try {
			const audit = JSON.parse(
				fs.readFileSync(`${recordPath}.audit.json`, "utf8")
			);
			return Boolean(audit) && audit.reason === "obsolete_child_incarnation";
		} catch {
			return false;
		}
	}

	function quarantinedRecordValue(recordPath) {
		try {
			const record = JSON.parse(fs.readFileSync(recordPath, "utf8"));
			const value = record && record.value;
			return value && typeof value === "object" ? value : null;
		} catch {
			return null;
		}
	}

	function hasTerminal(receiptId) {
		return Boolean(
			receiptId &&
			typeof options.mailbox.outboxOne === "function" &&
			options.mailbox.outboxOne(receiptId)
		);
	}

	function fencingKey(envelope) {
		return MailboxIncarnation.idempotencyKey(
			envelope,
			envelope?.childIncarnationId || options.state.childIncarnationId
		);
	}

	function rememberFencingKey(key) {
		if (!key) return;
		if (seenIdempotencyKeys.has(key)) seenIdempotencyKeys.delete(key);
		seenIdempotencyKeys.set(key, true);
		while (seenIdempotencyKeys.size > SEEN_IDEMPOTENCY_LIMIT) {
			const oldest = seenIdempotencyKeys.keys().next();
			if (oldest.done) break;
			seenIdempotencyKeys.delete(oldest.value);
		}
	}

	// Safe to retry once: reads/queries declared non-mutating (the codebase's
	// sideEffectProof vocabulary) or deeds carrying an explicit idempotent mark.
	function isSafeToRetryOnce(envelope = {}) {
		if (envelope?.idempotent === true) return true;
		const proof =
			envelope?.sideEffectProof ??
			envelope?.requestSemantics?.sideEffectProof;
		return proof === "not_a_mutation_request" || proof === "read_only";
	}

	function recordUnresolvedWrite(receiptId, fence, envelope) {
		const key = fence?.idempotencyKey || "";
		if (key && unresolvedWrites.some(entry => entry.idempotencyKey === key)) {
			return;
		}
		if (unresolvedWrites.length >= UNRESOLVED_WRITES_LIMIT) {
			unresolvedWrites.shift();
		}
		const proof =
			envelope?.sideEffectProof ??
			envelope?.requestSemantics?.sideEffectProof;
		unresolvedWrites.push({
			requestId: receiptId || "",
			idempotencyKey: key,
			recordIncarnation: fence?.recordIncarnation || "",
			currentIncarnation: fence?.currentIncarnation || "",
			replayedAt: fence?.replayedAt || new Date().toISOString(),
			reason: "uncertain_write_without_terminal_testimony",
			sideEffectProof: proof || ""
		});
		fencedCounts.unresolved += 1;
		// Custody evidence carries the visible marker alongside the list below,
		// so mailbox health snapshots show the unresolved deed.
		options.mailbox.noteDeliveryAttempt?.(receiptId, {
			fencedReplay: "unresolved_write",
			idempotencyKey: key,
			recordIncarnation: fence?.recordIncarnation || "",
			reason: "uncertain_write_without_terminal_testimony"
		});
	}

	// The fenced gate: (a) terminal testimony drops, (b) duplicate keys drop,
	// (d) uncertain writes surface visibly instead of executing, (c) safe deeds
	// send once. The original envelope crosses the wire unwrapped so the parent
	// contract and wire format never change.
	function deliverFenced(wrapped) {
		const envelope = MailboxIncarnation.unfence(wrapped);
		const fence = wrapped?.fenced === true ? wrapped.fence : null;
		const receiptId = Protocol.requestId(envelope);
		const key = fence?.idempotencyKey || fencingKey(envelope);
		const canDedupe = Boolean(receiptId && key);
		if (hasTerminal(receiptId)) {
			fencedCounts.droppedTerminal += 1;
			return true;
		}
		if (canDedupe && seenIdempotencyKeys.has(key)) {
			fencedCounts.dedupedDuplicate += 1;
			return true;
		}
		if (fence && !isSafeToRetryOnce(envelope)) {
			recordUnresolvedWrite(receiptId, fence, envelope);
			if (canDedupe) rememberFencingKey(key);
			return true;
		}
		const sent = sendRequestOnce(envelope, receiptId, key, canDedupe, fence);
		if (fence && sent) fencedCounts.redelivered += 1;
		return sent;
	}

	// One send per idempotency key per child life: a current-incarnation
	// duplicate (replay + live arrival of the same requestId) collapses to a
	// single execution. The key is recorded only on a successful send so a
	// failed attempt remains retryable.
	function sendRequestOnce(envelope, receiptId, key, canDedupe, fence) {
		if (canDedupe && seenIdempotencyKeys.has(key)) return true;
		options.mailbox.noteDeliveryAttempt?.(
			receiptId,
			fence
				? {
						fencedReplay: true,
						idempotencyKey: key,
						recordIncarnation: fence.recordIncarnation || ""
					}
				: undefined
		);
		const sent = options.send(
			Protocol.message(Protocol.TYPES.REQUEST, { envelope })
		);
		if (sent && canDedupe) rememberFencingKey(key);
		return sent;
	}

	function deliver(envelope) {
		const tupleKey = dedupKey(envelope);
		if (tupleKey && dedupCache.has(tupleKey)) {
			dedupCounts.duplicate += 1;
			return true;
		}
		const receiptId = Protocol.requestId(envelope);
		const key = fencingKey(envelope);
		const sent = sendRequestOnce(envelope, receiptId, key, Boolean(receiptId && key), null);
		if (sent && tupleKey) rememberDedup(tupleKey, receiptId);
		return sent;
	}
	function flush(id = "") {
		const ws = options.state.activeWs;
		if (!options.state.registrationConfirmed || !ws?.opened) return 0;
		recoverGeneration(ws);
		lifecycle.flush(ws);
		if (id && typeof options.mailbox.outboxOne === "function") {
			const envelope = options.mailbox.outboxOne(id);
			return envelope && options.Send.safeSend(ws, envelope) ? 1 : 0;
		}
		if (outboxReplayScheduled) return 0;
		const entries = options.mailbox.outbox();
		outboxReplayScheduled = true;
		replay.drain(
			entries,
			envelope => {
				try {
					// C18: the outbox replay path gets the same bounded full-tuple
					// dedup as inbox redelivery; a result already accepted by the
					// wire is not re-spoken on the next flush cycle.
					const tupleKey = dedupKey(envelope);
					if (tupleKey && dedupCache.has(tupleKey)) {
						dedupCounts.outboxDuplicate += 1;
						return true;
					}
					const sent = options.Send.safeSend(ws, envelope);
					if (sent && tupleKey) rememberDedup(tupleKey, Protocol.requestId(envelope));
					return sent;
				} catch {
					return false;
				}
			},
			() => {
				outboxReplayScheduled = false;
			}
		);
		return entries.length;
	}
	function recoverGeneration(ws) {
		const generation = Incarnation.generationKey(
			options.state.childIncarnationId,
			options.state.generation
		);
		if (generation === recoveredGeneration) return 0;
		recoveredGeneration = generation;
		return lifecycle.recover(unsettledInbox(), ws);
	}

	function transmit(envelope, socket = options.state.activeWs) {
		if (!options.state.registrationConfirmed || !socket?.opened) return false;
		// Acceptance/progress testimony must never throw out of generation recovery:
		// a throwing sender reports "not sent" so the next cycle retries instead
		// of breaking reconnect recovery.
		try {
			return options.Send.safeSend(socket, envelope);
		} catch {
			return false;
		}
	}

	// Visible fenced-replay evidence for health publishers: every unresolved
	// uncertain write with its fencing key, plus dedupe counters. Wire this into
	// the mailbox health snapshot to surface unresolved deeds to operators.
	function fencedReplayEvidence() {
		return {
			unresolvedWrites: unresolvedWrites.map(entry => ({ ...entry })),
			seenIdempotencyKeys: seenIdempotencyKeys.size,
			dedupCacheSize: dedupCache.size,
			dedupDuplicates: dedupCounts.duplicate + dedupCounts.outboxDuplicate,
			poisonQuarantined: poisonCounts.quarantined,
			poisonQuarantineFailed: poisonCounts.quarantineFailed,
			pendingPoisonFailures: deliveryFailures.size,
			counts: { ...fencedCounts }
		};
	}

	return {
		dedupKeyForEnvelope: dedupKey,
		enqueueRequest,
		fencedReplayEvidence,
		flush,
		parentDidBecomeReady,
		pendingAcceptances: lifecycle.pendingAcceptances,
		pendingProgress: lifecycle.pendingProgress,
		recoverGeneration,
		redeliver,
		transmit,
		unsettledInbox
	};
}

function boundedCount(value, fallback) {
	const number = Number(value);
	return Number.isFinite(number)
		? Math.max(1, Math.min(65536, Math.floor(number)))
		: fallback;
}

module.exports = { createDelivery };
