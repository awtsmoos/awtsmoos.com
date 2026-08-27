// B"H
const LANE_ORDER = Object.freeze(["P0", "P1", "P2", "P3", "P4", "P5"]);
const DEFAULT_WEIGHTS = Object.freeze({ P0: 1000, P1: 100, P2: 50, P3: 20, P4: 10, P5: 1 });

/**
 * B"H — Human restraint receives an open road through the heaviest storm.
 * Lower lanes still age toward service, so safety is immediate without turning
 * maintenance into an eternal exile.
 */
function createPriorityLanes(options = {}) {
	const queues = Object.fromEntries(LANE_ORDER.map(lane => [lane, []]));
	const inflight = Object.fromEntries(LANE_ORDER.map(lane => [lane, 0]));
	const limits = { ...defaultLimits(), ...(options.limits || {}) };
	const weights = { ...DEFAULT_WEIGHTS, ...(options.weights || {}) };
	const ageMs = positive(options.ageMs, 1000);
	let sequence = 0;

	function submit(lane, operation) {
		if (!queues[lane]) return Promise.reject(failure("unknown_lane"));
		if (queues[lane].length >= limits.queue[lane]) return Promise.reject(failure("lane_overloaded"));
		return new Promise((resolve, reject) => {
			queues[lane].push({ operation, resolve, reject, enqueuedAt: Date.now(), sequence: ++sequence });
			pump();
		});
	}

	function pump() {
		while (true) {
			const lane = nextLane();
			if (!lane) return;
			const item = queues[lane].shift();
			inflight[lane] += 1;
			Promise.resolve().then(item.operation).then(
				result => finish(lane, item, null, result),
				error => finish(lane, item, error)
			);
		}
	}

	function finish(lane, item, error, result) {
		inflight[lane] -= 1;
		if (error) item.reject(error);
		else item.resolve(result);
		pump();
	}

	function nextLane() {
		const now = Date.now();
		const candidates = LANE_ORDER.filter(canStart);
		if (!candidates.length) return "";
		return candidates.sort((left, right) => score(right, now) - score(left, now))[0];
	}

	function canStart(lane) {
		if (!queues[lane].length || inflight[lane] >= limits.inflight[lane]) return false;
		if (lane === "P0" || lane === "P1") return true;
		return totalInflight() < limits.totalInflight;
	}

	function score(lane, now) {
		const oldest = queues[lane][0];
		return weights[lane] + Math.floor((now - oldest.enqueuedAt) / ageMs);
	}

	function totalInflight() {
		return Object.values(inflight).reduce((sum, count) => sum + count, 0);
	}

	function snapshot() {
		return {
			queued: Object.fromEntries(LANE_ORDER.map(lane => [lane, queues[lane].length])),
			inflight: { ...inflight },
			totalInflight: totalInflight(),
			limits: structuredClone(limits)
		};
	}

	return { snapshot, submit };
}

function defaultLimits() {
	return {
		totalInflight: 16,
		inflight: { P0: 4, P1: 4, P2: 4, P3: 8, P4: 4, P5: 2 },
		queue: { P0: 256, P1: 512, P2: 1024, P3: 2048, P4: 1024, P5: 512 }
	};
}

function positive(value, fallback) {
	const number = Number(value);
	return Number.isFinite(number) && number > 0 ? Math.floor(number) : fallback;
}

function failure(code) {
	const error = new Error(code);
	error.code = code;
	return error;
}

module.exports = { DEFAULT_WEIGHTS, LANE_ORDER, createPriorityLanes };
