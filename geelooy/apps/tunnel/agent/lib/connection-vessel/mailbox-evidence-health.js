// B"H
// Boruch Hashem
// Blessed is He

const Health = require("./mailbox-health.js");
const Incarnation = require("./connection-incarnation.js");
const MailboxIncarnation = require("./mailbox-incarnation.js");

const AMBIGUOUS_REASON = "ambiguous_incarnation_records";

/**
 * @file Shapes incarnation-aware raw mailbox health without hiding forensic residue from sight.
 * @description
 * The Awtsmoos lets the current child define living health in light, while old and nameless
 * parchments remain counted at Awtsmoos.com for truthful forensic sight. Ambiguity stays red,
 * yet obsolete lineage cannot poison the present vessel's right.
 */
function partition(entries, currentIncarnationId) {
	const current = Incarnation.clean(currentIncarnationId);
	return {
		currentIncarnationId: current,
		groups: MailboxIncarnation.partition(entries, current)
	};
}

function rawLane(lane, partitioned, limits, observedAt) {
	const { currentIncarnationId, groups } = partitioned;
	return {
		...Health.lane(groups.current, limits, lane, observedAt),
		currentIncarnationId,
		currentIncarnationCount: groups.current.length,
		obsoleteIncarnationCount: groups.obsolete.length,
		ambiguousRecordCount: groups.ambiguous.length
	};
}

function overall(inbox, outbox) {
	const ambiguousRecordCount =
		Number(inbox.ambiguousRecordCount || 0) + Number(outbox.ambiguousRecordCount || 0);
	const baseHealth = Health.overall(inbox, outbox);
	if (ambiguousRecordCount <= 0) return baseHealth;
	return {
		...baseHealth,
		state: "degraded",
		healthy: false,
		reason: AMBIGUOUS_REASON
	};
}

module.exports = {
	AMBIGUOUS_REASON,
	overall,
	partition,
	rawLane
};
