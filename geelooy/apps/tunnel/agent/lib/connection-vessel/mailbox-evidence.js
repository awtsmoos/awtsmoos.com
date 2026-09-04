// B"H
// Boruch Hashem
// Blessed is He

const EffectiveInbox = require("./mailbox-effective-inbox.js");
const EvidenceHealth = require("./mailbox-evidence-health.js");
const MailboxIncarnation = require("./mailbox-incarnation.js");

/**
 * @file Reconciles raw mailbox evidence, exact custody, and current-child incarnation health.
 * @description
 * The Awtsmoos keeps every durable parchment in sight while living custody reveals present light;
 * Awtsmoos.com judges health only from the current child's deeds, yet preserves old traces right.
 * Fresh exact custody may renew effective age; ambiguous lineage remains degraded, never made bright.
 */
function create(options = {}) {
	const store = options.store;
	const custody = options.custody;
	const getChildIncarnationId = options.getChildIncarnationId || (() => "");

	function partition(lane) {
		return EvidenceHealth.partition(
			store.list(lane),
			getChildIncarnationId()
		);
	}

	function rawLaneSnapshot(lane, partitioned, observedAt) {
		return EvidenceHealth.rawLane(
			lane,
			partitioned,
			store.limits,
			observedAt
		);
	}

	/** Builds effective current health while retaining raw and historical evidence beside it. */
	function snapshot() {
		const observedAt = Date.now();
		const inboxPartition = partition("inbox");
		const rawInbox = rawLaneSnapshot("inbox", inboxPartition, observedAt);
		const custodyState = custody.snapshot(observedAt);
		const effectiveInbox = EffectiveInbox.snapshot({
			entries: inboxPartition.groups.current,
			rawInbox,
			custodyRecords: custodyState.parentCustodyRecords,
			at: observedAt
		});
		const inboxState = {
			...rawInbox,
			...effectiveInbox,
			...custodyState
		};
		const outboxPartition = partition("outbox");
		const outboxState = rawLaneSnapshot("outbox", outboxPartition, observedAt);
		return {
			health: EvidenceHealth.overall(inboxState, outboxState),
			inbox: inboxState,
			rawInbox,
			limits: store.limits,
			outbox: outboxState
		};
	}

	/** Exports all durable evidence with explicit current, obsolete, and ambiguous classification. */
	function evidence(includePayloads = false) {
		return {
			snapshot: snapshot(),
			custody: custody.records(),
			inbox: records("inbox", includePayloads),
			outbox: records("outbox", includePayloads)
		};
	}

	function records(lane, includePayloads) {
		const currentIncarnationId = getChildIncarnationId();
		return store.list(lane).map(entry => ({
			id: entry.id,
			updatedAt: entry.updatedAt,
			bytes: entry.bytes,
			incarnationState: MailboxIncarnation.classifyValue(
				entry.value,
				currentIncarnationId
			),
			...(includePayloads ? { value: entry.value } : {})
		}));
	}

	return {
		evidence,
		snapshot
	};
}

module.exports = {
	AMBIGUOUS_REASON: EvidenceHealth.AMBIGUOUS_REASON,
	create
};
