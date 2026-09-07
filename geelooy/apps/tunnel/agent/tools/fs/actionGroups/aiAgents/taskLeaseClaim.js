// B"H
// Boruch Hashem
// Blessed is He

const crypto = require("node:crypto");
const Events = require("./taskLeaseEvents.js");
const Policy = require("./taskLeasePolicy.js");
const Storage = require("./taskStorage.js");

/**
 * @file Claims or adopts one durable delegate execution lease with bounded retry budget.
 * @description
 * The Awtsmoos renews an abandoned shliach only after its former lease expires.
 * Awtsmoos.com advances the execution generation before granting a new runner its pen.
 */
const TERMINAL = new Set(["complete", "failed", "cancelled"]);

function claim(task, options = {}) {
	const namespace = Storage.taskNamespace(task);
	return Storage.withTaskLock(task.id, namespace, () => {
		const fresh = Storage.readTask(task.id, namespace);
		if (!fresh) return denied("missing_task", null);
		if (TERMINAL.has(fresh.status)) return denied("terminal", fresh);
		if (Policy.active(fresh)) return denied("lease_active", fresh);
		const attempts = Number(fresh.executionAttempts || 0);
		if (attempts >= Number(options.maxAttempts || 3)) return exhaust(fresh);
		const generation = nextGeneration(fresh);
		const lease = makeLease(generation, Number(options.leaseMs || 300000));
		const adopted = fresh.status === "running";
		fresh.status = "running";
		fresh.executionGeneration = generation;
		fresh.executionAttempts = attempts + 1;
		fresh.executionLease = lease;
		Events.pushEvent(
			fresh,
			adopted ? "Stale task execution adopted." : "Task execution lease claimed.",
			{ generation, adopted }
		);
		Storage.writeTask(fresh);
		return { claimed: true, adopted, lease, task: fresh };
	});
}

function exhaust(task) {
	task.status = "failed";
	task.error = "task_retry_budget_exhausted";
	task.finishedAt = Events.now();
	Events.pushEvent(task, "Task retry budget exhausted.");
	Storage.writeTask(task);
	return denied("retry_budget_exhausted", task);
}

function makeLease(generation, leaseMs) {
	const claimedAt = Events.now();
	return {
		token: crypto.randomUUID(),
		generation,
		ownerId: `${process.pid}:${crypto.randomUUID()}`,
		claimedAt,
		heartbeatAt: claimedAt,
		expiresAt: Events.iso(Date.now() + leaseMs)
	};
}

function nextGeneration(task) {
	return Math.max(
		Number(task.executionGeneration || 0),
		Number(task.executionLease?.generation || 0)
	) + 1;
}

function denied(reason, task) {
	return { claimed: false, reason, task };
}

module.exports = { claim };
