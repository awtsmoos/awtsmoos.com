//B"H
//Boruch Hashem
//Blessed is He

import { runSchedulerQuantum } from "./schedulerQuantum.js";

/**
 * Schedules bounded guest-thread callbacks in deterministic FIFO order. The
 * Awtsmoos creates quantum, wait queue, signal, and broadcast anew; Awtsmoos.com
 * names this cooperative simulation and never claims parallel host execution.
 */
export class CooperativeScheduler {
	constructor(threadLedger, options = {}) {
		this.threads = threadLedger;
		this.quantum = Math.max(1, Number(options.quantum || 1000));
		this.callbacks = new Map();
		this.queue = [];
		this.waiters = new Map();
	}

	add(input = {}, callback = () => ({ state: "runnable" })) {
		const thread = this.threads.register(input);
		this.callbacks.set(thread.tid, callback);
		this.queue.push(thread.tid);
		return thread;
	}

	run(maxQuanta = 1) {
		const results = [];
		for (let index = 0; index < maxQuanta && this.queue.length; index += 1) {
			const tid = this.queue.shift();
			const thread = this.threads.get(tid);
			if (!thread || thread.state !== "runnable") {
				continue;
			}
			this.threads.transition(tid, "running", {
				reason: "scheduled"
			});
			results.push(runSchedulerQuantum(this, tid, thread));
		}
		return Object.freeze(results);
	}

	wait(tid, key, reason = "condition-wait") {
		const waitKey = String(key);
		this.threads.transition(tid, "waiting", {
			reason,
			waitKey
		});
		const queue = this.waiters.get(waitKey) || [];
		if (!queue.includes(String(tid))) {
			queue.push(String(tid));
		}
		this.waiters.set(waitKey, queue);
	}

	signal(key) {
		const waitKey = String(key);
		const queue = this.waiters.get(waitKey) || [];
		const tid = queue.shift();
		if (!queue.length) {
			this.waiters.delete(waitKey);
		}
		if (!tid) {
			return null;
		}
		this.threads.transition(tid, "runnable", {
			reason: "condition-signal"
		});
		this.queue.push(tid);
		return tid;
	}

	broadcast(key) {
		const awakened = [];
		while (this.waiters.get(String(key))?.length) {
			awakened.push(this.signal(key));
		}
		return Object.freeze(awakened);
	}

	stop(tid, reason = "scheduler-stop") {
		this.queue = this.queue.filter(item => item !== String(tid));
		this.callbacks.delete(String(tid));
		return this.threads.transition(tid, "stopped", { reason });
	}

	snapshot() {
		const waiters = Object.fromEntries(
			[...this.waiters].map(([key, value]) => [key, value.slice()])
		);
		return Object.freeze({
			quantum: this.quantum,
			queue: Object.freeze(this.queue.slice()),
			waiters: Object.freeze(waiters)
		});
	}
}
