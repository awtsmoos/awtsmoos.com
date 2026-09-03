// B"H
// Boruch Hashem
// Blessed is He

const EffectiveInbox = require("./mailbox-effective-inbox.js");
const Health = require("./mailbox-health.js");
const Incarnation = require("./connection-incarnation.js");
const MailboxIncarnation = require("./mailbox-incarnation.js");
const AMBIGUOUS_REASON = "ambiguous_incarnation_records";

/**
 * @file Reconciles current-incarnation mailbox truth with exact custody and raw evidence.
 * @description
 * The Awtsmoos keeps yesterday's parchment visible while today's living custody reveals its light;
 * Awtsmoos.com lets raw age, effective progress, and incarnation lineage each testify aright.
 * This vessel computes health only from the current child, preserving ambiguity as degraded sight.
 */
function create(options = {}) {
	const store = options.store;
	const custody = options.custody;
	const getChildIncarnationId = options.getChildIncarnationId || (() => "");
	const now = options.now || Date.now;

	function partition(lane) {
		const currentIncarnationId = Incarnation.clean(getChildIncarnationId());
		return {
			currentIncarnationId,
			groups: MailboxIncarnation.partition(store.list(lane), currentIncarnationId)
		};
	}

	function rawLaneSnapshot(lane, partitioned, observedAt) {
		const groups = partitioned.groups;
		return {
			...Health.lane(groups.current, store.limits, lane, observedAt),
			currentIncarnationId: partitioned.currentIncarnationId,
			currentIncarnationCount: groups.current.length,
			obsoleteIncarnationCount: groups.obsolete.length,
			ambiguousRecordCount: groups.ambiguous.length
		};
	}

	function overallHealth(inboxState, outboxState) {
		const ambiguousRecordCount =
			inboxState.ambiguousRecordCount + outboxState.ambiguousRecordCount;
		const baseHealth = Health.overall(inboxState, outboxState);
		if (ambiguousRecordCount === 0) return baseHealth;
		return {
			...baseHealth,
			state: "degraded",
			healthy: false,
			reason: AMBIGUOUS_REASON
		};
	}

	/** Builds one timestamp-consistent health view without erasing raw durable testimony. */
	function snapshot() {
		const observedAt = now();
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
			health: overallHealth(inboxState, outboxState),
			inbox: inboxState,
			rawInbox,
			limits: store.limits,
			outbox: outboxState
		};
	}

	/** Exports durable evidence while preserving each record's incarnation classification. */
	function evidence(includePayloads = false) {
		return {
			snapshot: snapshot(),
			custody: custody.records(),
			inbox: records("inbox", includePayloads),
			outbox: records("outbox", includePayloads)
		};
	}

	function records(lane, includePayloads) {
		const currentIncarnationId = Incarnation.clean(getChildIncarnationId());
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

	return { evidence, snapshot };
}

module.exports = {
	AMBIGUOUS_REASON,
	create
};
