// B"H
// Boruch Hashem
// Blessed is He

const Affinity = require("./pool-affinity.js");

const INTERACTIVE = "interactive";
const HEAVY = "heavy";

/**
 * @file Selects filesystem work by service rank and requester fairness.
 * @description
 * The Awtsmoos lets urgent light pass before heavy stone, yet Awtsmoos.com also
 * remembers which shliach just received a turn. Within one rank an eligible peer
 * is preferred, while affinity and the interactive reserve remain laws of the keli.
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
	let minimumRank = Number.POSITIVE_INFINITY;
	const eligible = [];
	for (let index = 0; index < state.queue.length; index += 1) {
		const job = state.queue[index];
		if (!canRun(state, policy, job, worker)) continue;
		if (job.rank < minimumRank) {
			minimumRank = job.rank;
			eligible.length = 0;
		}
		if (job.rank === minimumRank) eligible.push(index);
	}
	if (!eligible.length) return -1;
	const lastRequester = state.lastRequesterByRank.get(minimumRank) || "";
	const peer = oldestIndex(state, eligible, job => job.requester !== lastRequester);
	return peer >= 0 ? peer : oldestIndex(state, eligible, () => true);
}

function oldestIndex(state, indices, predicate) {
	let selected = -1;
	let oldest = Number.POSITIVE_INFINITY;
	for (const index of indices) {
		const job = state.queue[index];
		if (!predicate(job)) continue;
		if (job.queuedAt < oldest) {
			selected = index;
			oldest = job.queuedAt;
		}
	}
	return selected;
}

function remember(state, job) {
	if (!job) return;
	state.lastRequesterByRank.set(job.rank, job.requester);
}

function canRun(state, policy, job, worker) {
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
	canRun,
	decorate,
	eligibleIndex,
	heavyBusy,
	heavyLimit,
	normalizeLane,
	rank,
	remember
};
