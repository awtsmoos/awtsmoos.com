// B"H
const Policy = require("./policy.js");
const State = require("./pool-state.js");
const Worker = require("./worker.js");
/** Creates a bounded, requester-fair pool of isolated filesystem executors. */
function createPool(options = {}) {
	const policy = { ...Policy, ...options };
	const state = { active: new Map(), idleTimer: null, queue: [], workers: [] };

	function execute(payload = {}) {
		if (state.queue.length >= policy.MAX_QUEUE) {
			return Promise.reject(State.failure("FS_EXECUTOR_BACKPRESSURE", "fs_executor_queue_full"));
		}
		return new Promise((resolve, reject) => {
			state.queue.push(State.createJob(payload, resolve, reject));
			pump();
		});
	}

	function pump() {
		clearTimeout(state.idleTimer);
		ensureWorkers();
		for (const worker of state.workers) {
			if (worker.busy || !worker.ready) continue;
			const index = State.eligibleIndex(state, policy.MAX_PER_REQUESTER);
			if (index < 0) break;
			assign(worker, state.queue.splice(index, 1)[0]);
		}
		scheduleIdle();
	}

	function assign(worker, job) {
		worker.busy = true;
		worker.job = job;
		State.increment(state.active, job.requester);
		worker.timer = setTimeout(() => expire(worker), policy.JOB_TIMEOUT_MS);
		worker.timer.unref?.();
		worker.child.send({ id: job.id, payload: job.payload, type: "execute" });
	}

	function complete(worker, message) {
		if (message?.type === "ready") {
			worker.ready = true;
			pump();
			return;
		}
		if (!worker.job || message?.id !== worker.job.id) return;
		const job = release(worker);
		if (message.ok) job.resolve(message.result);
		else job.reject(State.failure(message.code, message.error, message.stack));
		pump();
	}

	function exited(worker, code, signal) {
		const index = state.workers.indexOf(worker);
		if (index >= 0) state.workers.splice(index, 1);
		if (worker.job) {
			const job = release(worker);
			job.reject(State.failure("FS_EXECUTOR_EXITED", `fs_executor_exited:${code ?? signal}`));
		}
		if (state.queue.length) pump();
	}

	function expire(worker) {
		if (!worker.job) return;
		const job = release(worker);
		job.reject(State.failure("FS_EXECUTOR_TIMEOUT", "fs_executor_action_timed_out"));
		Worker.stop(worker);
	}

	function release(worker) {
		clearTimeout(worker.timer);
		const job = worker.job;
		worker.busy = false;
		worker.job = null;
		worker.timer = null;
		State.decrement(state.active, job.requester);
		return job;
	}

	function ensureWorkers(requested) {
		const busy = state.workers.filter(worker => worker.busy).length;
		const wanted = requested || Math.min(
			policy.WORKERS,
			Math.max(2, busy + state.queue.length)
		);
		while (state.workers.length < wanted) {
			state.workers.push(Worker.spawn(complete, exited));
		}
	}

	function scheduleIdle() {
		if (policy.IDLE_SHUTDOWN_MS <= 0) return;
		if (state.queue.length || state.workers.some(worker => worker.busy)) return;
		state.idleTimer = setTimeout(shutdown, policy.IDLE_SHUTDOWN_MS);
		state.idleTimer.unref?.();
	}

	function shutdown() {
		clearTimeout(state.idleTimer);
		for (const worker of state.workers.splice(0)) Worker.stop(worker);
		for (const job of state.queue.splice(0)) {
			job.reject(State.failure("FS_EXECUTOR_STOPPED", "fs_executor_stopped"));
		}
	}

	const stats = () => State.stats(state, policy);
	function warm() {
		ensureWorkers(policy.WORKERS);
		return stats();
	}

	return { execute, shutdown, state, stats, warm };
}

module.exports = {
	createPool,
	eligibleIndex: State.eligibleIndex,
	failure: State.failure
};
