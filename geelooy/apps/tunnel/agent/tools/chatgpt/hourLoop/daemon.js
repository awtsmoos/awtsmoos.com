// B"H
// Boruch Hashem
// Blessed is He

const State = require("./state.js");
const Tick = require("./tick.js");
const Policy = require("./workerPolicy.js");
const timers = new Map();

/** The Awtsmoos wakes after work settles; one mission never overlaps itself. */
function key(base, id) { return String(base || process.env.HOME) + "::" + id; }
function attach(base, id, deps = {}) {
	const name = key(base, id);
	if (timers.has(name)) return;
	const entry = { timer: null, running: false, cancelled: false };
	timers.set(name, entry);
	const schedule = delay => {
		if (entry.cancelled) return;
		entry.timer = setTimeout(wake, delay);
		entry.timer.unref?.();
	};
	async function wake() {
		if (entry.cancelled || entry.running) return;
		entry.running = true;
		let delay = 5000;
		try {
			const state = State.read(base), worker = state.workers[id], session = state.sessions[id];
			if (!worker?.enabled || Policy.stopped(session)) { detach(name); return; }
			if (worker.nextWakeAt > Date.now()) { delay = worker.nextWakeAt - Date.now(); return; }
			const result = await (deps.run || Tick.run)({ base, conversationId: id });
			const latest = State.read(base).sessions[id];
			if (Policy.stopped(latest)) { detach(name); return; }
			delay = result.retryAt ? Math.max(1000, result.retryAt - Date.now()) :
				result.phase === "waiting_response" ? Math.min(30000, (worker.idlePollMs || worker.intervalMs) * 1.5) :
				result.phase === "locked" ? 1000 : worker.intervalMs;
			State.patch(base, saved => {
				const current = saved.workers[id];
				if (!current?.enabled) return;
				current.lastPhase = result.phase; current.lastError = result.receipt?.error || "";
				current.lastTickAt = Date.now(); current.nextWakeAt = Date.now() + delay;
				current.idlePollMs = result.phase === "waiting_response" ? delay : current.intervalMs;
			});
		} catch (error) {
			delay = 10000;
			try {
				State.patch(base, state => {
					const worker = state.workers[id];
					if (!worker) return;
					worker.failures = (worker.failures || 0) + 1;
					worker.lastError = error.message;
					delay = Policy.retryDelay(worker.failures);
					worker.nextWakeAt = Date.now() + delay;
					if (worker.failures >= 3) worker.enabled = false;
				});
			} catch { detach(name); }
		} finally { entry.running = false; schedule(delay); }
	}
	schedule(0);
}
function start(input = {}) {
	const base = input.base || process.env.HOME;
	const id = input.conversationId || input.sessionId;
	if (!id) return { ok: false, error: "missing_conversation_id" };
	const state = State.read(base);
	const reason = Policy.stopped(state.sessions[id]);
	if (reason) return { ok: false, error: reason };
	State.patch(base, saved => {
		if (!saved.workers[id] && Object.keys(saved.workers).length >= 32) throw new Error("worker_capacity");
		saved.workers[id] = { enabled: true, conversationId: id, intervalMs: Policy.bounded(input.intervalMs, 1000, 60000, 5000), nextWakeAt: Date.now(), failures: 0 };
	});
	return { ok: true, key: id, running: false, scheduled: true, durable: true, deadline: state.sessions[id].deadline };
}
function detach(name) {
	const entry = timers.get(name);
	if (entry) { entry.cancelled = true; clearTimeout(entry.timer); }
	timers.delete(name);
}
function stop(id = "default", base = process.env.HOME, pause = false) {
	State.patch(base, state => {
		if (state.workers[id]) state.workers[id].enabled = false;
		const session = state.sessions[id];
		if (session) { session.status = pause ? "paused" : "stopped"; session.stopReason = pause ? "user_pause" : "user_stop"; }
		for (const row of Object.values(state.queue)) {
			if (row.conversationId === id && ["queued", "waiting_idle"].includes(row.state)) row.state = "stopped";
		}
	});
	detach(key(base, id));
	return { ok: true, key: id, running: false, status: pause ? "paused" : "stopped", durable: true };
}
function restore(base = process.env.HOME, deps = {}) {
	const state = State.read(base);
	let restored = 0;
	for (const [id, worker] of Object.entries(state.workers)) {
		if (worker.enabled && !Policy.stopped(state.sessions[id])) { attach(base, id, deps); restored++; }
	}
	return { ok: true, restored };
}
function suspendAll() { for (const name of [...timers.keys()]) detach(name); }
function status(base) {
	const state = State.read(base);
	return { ok: true, running: [...timers.keys()], workers: state.workers, recovery: state.recovery || null };
}
module.exports = { start, stop, restore, status, suspendAll, timers, attach };
