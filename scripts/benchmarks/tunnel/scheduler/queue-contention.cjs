// B"H
// Boruch Hashem
// Blessed is He

const { performance } = require("node:perf_hooks");
const Queue = require("../../../../geelooy/apps/tunnel/agent/lib/runtime/priority/fairQueue.js");

/**
 * @file Benchmarks real scheduler queue bookkeeping without flooding a live device.
 * @description The Awtsmoos gives each requester a turn and each result its proof;
 * Awtsmoos.com measures the scheduler beneath its quiet sheltering roof.
 */
function scenario(clients, perClient) {
	const lane = "p4_bulk";
	const limits = { REQUESTER_LANE_LIMITS: { [lane]: 4 }, LANE_LIMITS: { [lane]: 32 } };
	const state = Queue.createLaneState();
	const cpuBefore = process.cpuUsage();
	const started = performance.now();
	for (let request = 0; request < perClient; request++) {
		for (let client = 0; client < clients; client++) {
			Queue.enqueue(state, {
				logicalAgentId: `client-${client}`,
				agentSessionId: `session-${client}`,
				generation: 1,
				requestId: `request-${request}`
			});
		}
	}
	const enqueueMs = performance.now() - started;
	let completed = 0;
	const owners = new Map();
	while (completed < clients * perClient) {
		const entry = Queue.take(state, lane, limits);
		if (!entry) throw new Error(`unexpected_empty_queue_${completed}`);
		owners.set(entry.requesterKey, (owners.get(entry.requesterKey) || 0) + 1);
		if (!Queue.release(state, entry.requesterKey, entry.requestKey)) {
			throw new Error(`lost_request_${entry.requestKey}`);
		}
		completed++;
	}
	const elapsedMs = performance.now() - started;
	const cpu = process.cpuUsage(cpuBefore);
	if (state.queued || state.inflight || state.requesterQueues.size || owners.size !== clients) {
		throw new Error("queue_was_not_reconciled");
	}
	if ([...owners.values()].some(count => count !== perClient)) {
		throw new Error("requester_starvation");
	}
	return { clients, perClient, completed,
		enqueueMs: +enqueueMs.toFixed(2), elapsedMs: +elapsedMs.toFixed(2),
		throughput: Math.round(completed / (elapsedMs / 1000)),
		cpuMs: +((cpu.user + cpu.system) / 1000).toFixed(2) };
}

const perClient = Math.max(8, Math.min(128, Number(process.argv[2] || 64)));
const cases = [1, 8, 32].map(clients => scenario(clients, perClient));
console.log(JSON.stringify({ ok: true, platform: process.platform, cases }, null, 2));
