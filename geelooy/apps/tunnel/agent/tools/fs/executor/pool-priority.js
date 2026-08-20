// B"H
// Boruch Hashem
// Blessed is He

const Affinity = require("./pool-affinity.js");

const INTERACTIVE = "interactive";
const HEAVY = "heavy";

/**
 * @file Selects the next filesystem job without allowing heavy work to consume every doorway.
 * @description
 * The Awtsmoos gives each lane its measure; Awtsmoos.com lets one requester
 * carry heavy and interactive work independently while preserving a warm interactive vessel.
 */
function decorate(job, metadata = {}) {
	job.lane = normalizeLane(metadata.lane);
	job.rank = rank(job.lane);
	job.bucket = bucket(job.lane);
	job.activeKey = `${job.requester}|${job.bucket}`;
	job.queuedAt = Date.now();
	job.metadata = { ...metadata, lane: job.lane };
	return job;
}

function eligibleIndex(state, policy, worker = null) {
	let chosen = -1;
	let chosenRank = Number.POSITIVE_INFINITY;
	let chosenAt = Number.POSITIVE_INFINITY;
	for (let index = 0; index < state.queue.length; index += 1) {
		const job = state.queue[index];
		if (!eligible(state, policy, job, worker)) continue;
		if (job.rank < chosenRank || (job.rank === chosenRank && job.queuedAt < chosenAt)) {
			chosen = index;
			chosenRank = job.rank;
			chosenAt = job.queuedAt;
		}
	}
	return chosen;
}

function eligible(state, policy, job, worker) {
	if (Number(state.active.get(job.activeKey) || 0) >= policy.MAX_PER_REQUESTER) return false;
	const owner = Affinity.ownerForPayload(state, job.payload);
	if (owner && worker && owner !== worker) return false;
	if (job.bucket !== HEAVY) return true;
	return heavyBusy(state) < heavyLimit(state, policy);
}

function heavyLimit(state, policy) {
	const workers = Math.max(1, state.workers.filter(worker => !worker.retiring).length);
	if (workers <= 1) return 1;
	return Math.max(1, workers - Math.min(policy.RESERVED_INTERACTIVE_WORKERS, workers - 1));
}

function heavyBusy(state) {
	return state.workers.filter(worker => worker.busy && worker.job?.bucket === HEAVY).length;
}

function normalizeLane(lane) {
	const value = String(lane || "p1_fs_light");
	return /^p[0-4]_/.test(value) ? value : "p1_fs_light";
}

function rank(lane) {
	if (/^p0_/.test(lane)) return 0;
	if (lane === "p1_fs_light") return 1;
	if (lane === "p2_chrome_light") return 2;
	if (lane === "p3_heavy") return 3;
	return 4;
}

function bucket(lane) {
	return rank(lane) <= 1 ? INTERACTIVE : HEAVY;
}

module.exports = {
	HEAVY,
	INTERACTIVE,
	bucket,
	decorate,
	eligible,
	eligibleIndex,
	heavyBusy,
	heavyLimit,
	normalizeLane,
	rank
};
