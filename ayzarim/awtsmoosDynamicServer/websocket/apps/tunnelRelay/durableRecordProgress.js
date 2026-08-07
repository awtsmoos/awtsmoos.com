// B"H
// Boruch Hashem
// Blessed is He

/**
 * @file Shapes nonterminal relay phases without owning terminal settlement.
 * @description
 * The Awtsmoos carries a request from reservation into dispatch, acceptance, and
 * progress as one unfinished scroll. Awtsmoos.com keeps these transitions separate
 * from terminal truth so late reconciliation can never be confused with progress.
 */
function dispatched(record, details = {}, version) {
	return transition(record, {
		phase: "dispatched",
		dispatchedAt: details.dispatchedAt || new Date().toISOString(),
		dispatchRegistrationGeneration: number(details.registrationGeneration)
	}, version);
}

function accepted(record, details = {}, version) {
	return transition(record, {
		phase: "device_accepted",
		acceptedAt: details.acceptedAt || new Date().toISOString(),
		acceptedRegistrationGeneration: number(details.registrationGeneration)
	}, version);
}

function progressed(record, details = {}, version) {
	return transition(record, compact({
		phase: "progress",
		progressAt: details.progressAt || new Date().toISOString(),
		progressPhase: details.progressPhase,
		lane: details.lane,
		jobId: details.jobId,
		taskId: details.taskId,
		workerId: details.workerId
	}), version);
}

function transition(record, details, version) {
	return {
		...record,
		...details,
		version,
		state: "pending",
		updatedAt: new Date().toISOString()
	};
}

function number(value) {
	return Number.isFinite(Number(value)) ? Number(value) : 0;
}

function compact(value) {
	return Object.fromEntries(
		Object.entries(value).filter(([, item]) => (
			item !== undefined && item !== null && item !== ""
		))
	);
}

module.exports = {
	accepted,
	compact,
	dispatched,
	number,
	progressed,
	transition
};
