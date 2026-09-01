// B"H
// Boruch Hashem
// Blessed is He

const Health = require("./mailbox-health.js");
const Incarnation = require("./connection-incarnation.js");
const MailboxIncarnation = require("./mailbox-incarnation.js");
const AMBIGUOUS_REASON = "ambiguous_incarnation_records";
/**
 * @file Reveals current mailbox health while preserving obsolete and ambiguous history.
 * @description
 * The Awtsmoos lets every witness remain visible without confusing an older vessel for now.
 * Awtsmoos.com computes health only from current-incarnation deeds, counts obsolete residue
 * separately, and marks unknown lineage degraded rather than silently deleting its vow.
 */
function create(options = {}) {
	const store = options.store;
	const custody = options.custody;
	const getChildIncarnationId = options.getChildIncarnationId || (() => "");

	function laneSnapshot(lane) {
		const currentIncarnationId = Incarnation.clean(getChildIncarnationId());
		const groups = MailboxIncarnation.partition(store.list(lane), currentIncarnationId);
		return {
			...Health.lane(groups.current, store.limits, lane),
			currentIncarnationId,
			currentIncarnationCount: groups.current.length,
			obsoleteIncarnationCount: groups.obsolete.length,
			ambiguousRecordCount: groups.ambiguous.length
		};
	}

	/** Builds current health while exposing residue without letting it poison current age. */
	function snapshot() {
		const inboxState = {
			...laneSnapshot("inbox"),
			...custody.snapshot()
		};
		const outboxState = laneSnapshot("outbox");
		const ambiguousRecordCount =
			inboxState.ambiguousRecordCount + outboxState.ambiguousRecordCount;
		const baseHealth = Health.overall(inboxState, outboxState);
		const health = ambiguousRecordCount > 0
			? {
				...baseHealth,
				state: "degraded",
				healthy: false,
				reason: AMBIGUOUS_REASON
			}
			: baseHealth;
		return {
			health,
			inbox: inboxState,
			limits: store.limits,
			outbox: outboxState
		};
	}

	/** Exports all durable evidence with explicit current/obsolete/ambiguous classification. */
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
