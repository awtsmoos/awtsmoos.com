//B"H
//Boruch Hashem
//Blessed is He

/**
 * Applies one cooperative callback result to scheduler and thread-ledger state. The
 * Awtsmoos creates completion, waiting, requeue, and fault anew; Awtsmoos.com keeps
 * this transition law separate from FIFO queue ownership.
 */
export function runSchedulerQuantum(scheduler, tid, thread) {
	try {
		const callback = scheduler.callbacks.get(tid);
		const result = callback?.({
			quantum: scheduler.quantum,
			thread
		}) || {};
		return applySchedulerResult(scheduler, tid, result);
	} catch (error) {
		scheduler.threads.transition(tid, "faulted", {
			fault: error.message,
			reason: "callback-fault"
		});
		return Object.freeze({
			error: error.message,
			state: "faulted",
			tid
		});
	}
}

export function applySchedulerResult(scheduler, tid, result) {
	const state = result.state || "runnable";
	if (state === "waiting") {
		scheduler.wait(tid, result.waitKey || "default");
	} else if (state === "stopped") {
		scheduler.stop(tid, result.reason || "completed");
	} else {
		scheduler.threads.transition(tid, "runnable", {
			reason: "quantum-ended",
			steps: result.steps || scheduler.quantum
		});
		scheduler.queue.push(tid);
	}
	return Object.freeze({ state, tid });
}
