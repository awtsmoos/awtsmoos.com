// B"H
// Boruch Hashem
// Blessed is He

const { runGenericTask } = require("./genericTask.js");
const { runNovelTask } = require("./novelPipeline.js");
const { sendAgentMessage } = require("./client.js");
const Lease = require("./taskLease.js");
const store = require("./taskStore.js");

/**
 * @file Executes one AI delegate through single-flight, heartbeat, and generation fencing.
 * @description
 * The Awtsmoos allows one living runner per namespace/task key. Awtsmoos.com renews its
 * lease while work continues and prevents a displaced generation from terminalizing it.
 */
const activeRuns = new Map();

async function runTask(config, taskId, scope = null) {
	const task = store.readTask(taskId, scope);
	if (!task || terminal(task)) return task;
	const key = `${store.taskNamespace(task)}:${task.id}`;
	if (activeRuns.has(key)) return activeRuns.get(key);
	const promise = runClaimed(config, task);
	activeRuns.set(key, promise);
	try {
		return await promise;
	} finally {
		if (activeRuns.get(key) === promise) activeRuns.delete(key);
	}
}

async function runClaimed(config, task) {
	const policy = Lease.policy(config, task.input || {});
	const claim = Lease.claim(task, policy);
	if (!claim.claimed) return claim.task;
	let leaseLost = false;
	const timer = setInterval(() => {
		try {
			if (!Lease.heartbeat(task.id, claim.task, claim.lease, policy.leaseMs)) {
				leaseLost = true;
			}
		} catch {
			leaseLost = true;
		}
	}, policy.heartbeatMs);
	timer.unref?.();
	try {
		const output = await execute(config, claim.task);
		if (leaseLost) return store.readTask(task.id, claim.task);
		return Lease.complete(task.id, claim.task, claim.lease, output).task;
	} catch (error) {
		if (leaseLost) return store.readTask(task.id, claim.task);
		return Lease.fail(task.id, claim.task, claim.lease, error).task;
	} finally {
		clearInterval(timer);
	}
}

async function execute(config, task) {
	const kind = task.input.kind || "genericTask";
	if (/^novel/.test(kind)) return runNovelTask(config, task, runTask);
	if (kind === "agentMessage") {
		store.event(task, "Sending direct delegate message.");
		return sendAgentMessage(config, task.input);
	}
	return runGenericTask(config, task, runTask);
}

function terminal(task) {
	return ["complete", "failed", "cancelled"].includes(task.status);
}

function schedule(config, task) {
	Promise.resolve().then(() => runTask(config, task.id, task)).catch(() => {});
}

module.exports = { runTask, schedule };
