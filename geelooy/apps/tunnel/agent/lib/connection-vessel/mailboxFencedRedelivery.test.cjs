// B"H
// Boruch Hashem
// Blessed is He

const assert = require("node:assert/strict");
const fs = require("node:fs");
const os = require("node:os");
const path = require("node:path");
const Delivery = require("./child-delivery.js");
const MailboxIncarnation = require("./mailbox-incarnation.js");

/**
 * @file Proves obsolete-incarnation mailbox records replay idempotently behind an incarnation fence.
 * @description
 * The Awtsmoos loses no accepted deed and executes no uncertain write twice.
 * Awtsmoos.com replays old-incarnation records with deterministic fencing keys:
 * safe reads retry exactly once, duplicates dedupe, terminal testimony drops,
 * uncertain writes surface visibly instead of executing, and ambiguous lineage
 * stays quarantined. Current-incarnation behavior is unchanged.
 */
const CHILD_NEW = "child-new";
const CHILD_OLD = "child-old";

function makeDelivery({
	inboxEntries = [],
	outboxEntries = [],
	fencedReplaySource,
	quarantineDir
} = {}) {
	const inbox = inboxEntries.map(entry => ({ ...entry }));
	const outbox = outboxEntries.map(entry => ({ ...entry }));
	const sentIpc = [];
	const deliveryAttempts = [];
	const state = {
		activeWs: { opened: true },
		childIncarnationId: CHILD_NEW,
		generation: 1,
		registrationConfirmed: true,
		tunnelName: "test-tunnel"
	};
	const mailbox = {
		inbox: () => inbox.map(entry => ({ ...entry })),
		outbox: () => outbox.map(entry => ({ ...entry })),
		outboxOne: id => outbox.find(entry => entry.id === id) || null,
		putInbox: envelope => {
			inbox.push({ ...envelope });
		},
		noteDeliveryAttempt: (id, metadata) => {
			deliveryAttempts.push({ id, metadata });
		}
	};
	const options = {
		Send: { safeSend: () => true },
		mailbox,
		send: message => {
			sentIpc.push(message);
			return true;
		},
		state,
		schedule: fn => fn()
	};
	if (fencedReplaySource) options.fencedReplaySource = fencedReplaySource;
	if (quarantineDir) options.fencedReplayQuarantineDir = quarantineDir;
	const runtime = Delivery.createDelivery(options);
	return { runtime, sentIpc, deliveryAttempts, mailbox };
}

function writeQuarantinedRecord(directory, name, value, reason = "obsolete_child_incarnation") {
	const recordPath = path.join(directory, `${Date.now()}-${name}.json`);
	fs.writeFileSync(
		recordPath,
		JSON.stringify({
			id: name,
			updatedAt: new Date().toISOString(),
			value
		})
	);
	fs.writeFileSync(
		`${recordPath}.audit.json`,
		JSON.stringify({ reason, at: new Date().toISOString() })
	);
}

// --- Fencing classification unit ---
{
	const fenced = MailboxIncarnation.fencedValues(
		[
			{ requestId: "r-old", childIncarnationId: CHILD_OLD },
			{ requestId: "r-new", childIncarnationId: CHILD_NEW },
			{ requestId: "r-legacy" }
		],
		CHILD_NEW
	);
	assert.equal(fenced.length, 1, "only obsolete records are fenced");
	assert.equal(fenced[0].fenced, true);
	assert.equal(fenced[0].fence.recordIncarnation, CHILD_OLD);
	assert.equal(fenced[0].fence.currentIncarnation, CHILD_NEW);
	assert.equal(fenced[0].fence.idempotencyKey, "r-old:child-old");
	assert.ok(fenced[0].fence.replayedAt);
	assert.deepEqual(MailboxIncarnation.unfence(fenced[0]), {
		requestId: "r-old",
		childIncarnationId: CHILD_OLD
	});
	assert.deepEqual(MailboxIncarnation.unfence({ plain: true }), { plain: true });
	console.log("ok - fenced classification wraps obsolete only, ambiguous excluded");
}

// --- Obsolete read: fenced redelivered exactly once, unwrapped on the wire ---
{
	const oldRead = {
		requestId: "old-read",
		childIncarnationId: CHILD_OLD,
		sideEffectProof: "not_a_mutation_request",
		payload: { op: "read" }
	};
	const { runtime, sentIpc, deliveryAttempts } = makeDelivery({
		fencedReplaySource: () => [oldRead]
	});
	runtime.parentDidBecomeReady();
	assert.equal(sentIpc.length, 1, "obsolete read redelivered once");
	assert.equal(sentIpc[0].type, "connection.request");
	assert.equal(sentIpc[0].envelope.requestId, "old-read");
	assert.equal(
		sentIpc[0].envelope.fenced,
		undefined,
		"wire envelope stays unwrapped for the parent"
	);
	const attempt = deliveryAttempts.find(entry => entry.id === "old-read");
	assert.equal(attempt.metadata.fencedReplay, true);
	assert.equal(attempt.metadata.idempotencyKey, "old-read:child-old");
	const evidence = runtime.fencedReplayEvidence();
	assert.equal(evidence.counts.redelivered, 1);
	assert.equal(evidence.unresolvedWrites.length, 0);
	console.log("ok - obsolete read fenced redelivered exactly once");
}

// --- Duplicate fenced delivery deduped ---
{
	const oldRead = {
		requestId: "old-read-dup",
		childIncarnationId: CHILD_OLD,
		sideEffectProof: "read_only"
	};
	const { runtime, sentIpc } = makeDelivery({
		fencedReplaySource: () => [oldRead]
	});
	runtime.parentDidBecomeReady();
	runtime.parentDidBecomeReady();
	assert.equal(sentIpc.length, 1, "second redelivery deduped by fencing key");
	const evidence = runtime.fencedReplayEvidence();
	assert.equal(evidence.counts.dedupedDuplicate, 1);
	assert.equal(evidence.seenIdempotencyKeys, 1);
	console.log("ok - duplicate fenced redelivery deduped");
}

// --- Terminal testimony: dropped, not executed ---
{
	const { runtime, sentIpc } = makeDelivery({
		fencedReplaySource: () => [
			{
				requestId: "done-old",
				childIncarnationId: CHILD_OLD,
				sideEffectProof: "not_a_mutation_request"
			}
		],
		outboxEntries: [{ id: "done-old" }]
	});
	runtime.parentDidBecomeReady();
	assert.equal(sentIpc.length, 0, "terminal testimony suppresses the retry");
	assert.equal(runtime.fencedReplayEvidence().counts.droppedTerminal, 1);
	console.log("ok - obsolete record with terminal testimony dropped");
}

// --- Uncertain write: never executed, visibly unresolved ---
{
	const { runtime, sentIpc, deliveryAttempts } = makeDelivery({
		fencedReplaySource: () => [
			{ requestId: "old-write", childIncarnationId: CHILD_OLD, payload: { op: "write" } }
		]
	});
	runtime.parentDidBecomeReady();
	assert.equal(sentIpc.length, 0, "uncertain write never auto-executes");
	const evidence = runtime.fencedReplayEvidence();
	assert.equal(evidence.unresolvedWrites.length, 1);
	assert.equal(evidence.unresolvedWrites[0].requestId, "old-write");
	assert.equal(evidence.unresolvedWrites[0].idempotencyKey, "old-write:child-old");
	assert.equal(evidence.unresolvedWrites[0].recordIncarnation, CHILD_OLD);
	assert.equal(
		evidence.unresolvedWrites[0].reason,
		"uncertain_write_without_terminal_testimony"
	);
	assert.equal(evidence.counts.unresolved, 1);
	const marker = deliveryAttempts.find(entry => entry.id === "old-write");
	assert.equal(marker.metadata.fencedReplay, "unresolved_write");
	// A repeat redelivery lists it once, never executes it.
	runtime.parentDidBecomeReady();
	assert.equal(sentIpc.length, 0);
	assert.equal(runtime.fencedReplayEvidence().unresolvedWrites.length, 1);
	console.log("ok - uncertain write surfaced unresolved, never executed");
}

// --- Explicitly idempotent write retries once ---
{
	const { runtime, sentIpc } = makeDelivery({
		fencedReplaySource: () => [
			{ requestId: "old-idem", childIncarnationId: CHILD_OLD, idempotent: true }
		]
	});
	runtime.parentDidBecomeReady();
	assert.equal(sentIpc.length, 1, "idempotent-marked deed retries once");
	assert.equal(runtime.fencedReplayEvidence().counts.redelivered, 1);
	console.log("ok - explicitly idempotent write retries once");
}

// --- Ambiguous lineage: excluded from all replay ---
{
	const { runtime, sentIpc } = makeDelivery({
		fencedReplaySource: () => [{ requestId: "legacy-no-stamp" }]
	});
	runtime.parentDidBecomeReady();
	assert.equal(sentIpc.length, 0, "ambiguous record never replayed");
	assert.equal(runtime.fencedReplayEvidence().unresolvedWrites.length, 0);
	assert.deepEqual(runtime.fencedReplayEvidence().counts, {
		redelivered: 0,
		droppedTerminal: 0,
		dedupedDuplicate: 0,
		unresolved: 0
	});
	console.log("ok - ambiguous records still excluded from all replay");
}

// --- Current-incarnation duplicate (replay + live) executes once ---
{
	const current = { requestId: "cur-1", childIncarnationId: CHILD_NEW };
	const { runtime, sentIpc } = makeDelivery({ inboxEntries: [current] });
	runtime.parentDidBecomeReady();
	assert.equal(sentIpc.length, 1, "current record redelivered");
	runtime.enqueueRequest({}, { ...current });
	assert.equal(sentIpc.length, 1, "live duplicate of same requestId executes once");
	console.log("ok - current-incarnation duplicate collapses to one execution");
}

// --- Production source: semantic quarantine directory ---
{
	const root = fs.mkdtempSync(path.join(os.tmpdir(), "awts-fenced-"));
	const inboxQ = path.join(root, "inbox");
	fs.mkdirSync(inboxQ, { recursive: true });
	writeQuarantinedRecord(inboxQ, "q-read", {
		requestId: "q-read",
		childIncarnationId: CHILD_OLD,
		sideEffectProof: "read_only"
	});
	writeQuarantinedRecord(inboxQ, "q-write", {
		requestId: "q-write",
		childIncarnationId: CHILD_OLD
	});
	writeQuarantinedRecord(
		inboxQ,
		"q-other-reason",
		{ requestId: "q-other", childIncarnationId: CHILD_OLD, sideEffectProof: "read_only" },
		"semantic_stale_custody"
	);
	writeQuarantinedRecord(inboxQ, "q-legacy", { requestId: "q-legacy" });
	fs.writeFileSync(path.join(inboxQ, "broken.json"), "{not json");
	try {
		const { runtime, sentIpc } = makeDelivery({ quarantineDir: inboxQ });
		runtime.parentDidBecomeReady();
		assert.equal(sentIpc.length, 1, "only the safe quarantined read replays");
		assert.equal(sentIpc[0].envelope.requestId, "q-read");
		const evidence = runtime.fencedReplayEvidence();
		assert.equal(evidence.unresolvedWrites.length, 1);
		assert.equal(evidence.unresolvedWrites[0].requestId, "q-write");
		assert.equal(evidence.counts.redelivered, 1);
		assert.equal(evidence.counts.unresolved, 1);
		console.log("ok - quarantine source replays safely, skips wrong-reason and malformed");
	} finally {
		fs.rmSync(root, { recursive: true, force: true });
	}
}

console.log("BHY fenced redelivery loses no work and executes no uncertain write twice");
