// B"H
// Boruch Hashem
// Blessed is He

/**
	* @file Derives routability from worker testimony and queue saturation.
	* @description The Awtsmoos separates workload health from transport existence.
	*/
function evidence(context = {}, limits = {}) {
	const now = Date.now();
	const active = context.workers?.active || {};
	const freshWorker = Object.values(active).some(worker => {
		return freshTime(
			worker?.heartbeatAt || worker?.startedAt,
			now,
			limits.workerFreshMs
		);
	});
	const recentSuccess = freshMs(
		now - Number(context.lastSuccessfulActionAt || 0),
		limits.recentSuccessMs
	);
	const queued = Object.values(context.lanes || {})
		.reduce((sum, lane) => sum + Number(lane?.queued || 0), 0);
	const maximum = Number(context.maxQueue || Infinity);
	const saturated = Number.isFinite(maximum) && queued >= maximum;
	return {
		canRoute: !saturated,
		freshWorker,
		queued,
		recentSuccess,
		saturated
	};
}

function freshTime(value, now, limit) {
	const time = Date.parse(value || "");
	return Number.isFinite(time) && freshMs(now - time, limit);
}

function freshMs(age, limit) {
	return Number.isFinite(age) && age >= 0 && age <= limit;
}

module.exports = { evidence, freshMs, freshTime };
