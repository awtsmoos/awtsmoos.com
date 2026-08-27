// B"H
const assert = require("node:assert/strict");
const Command = require("../../command/index.js");

async function main() {
	const total = 500;
	const runtime = Command.createCommandRunner({
		maxActive: 20,
		maxQueued: total + 20,
		maxPerOwner: 20,
		maxRetained: 128,
		cleanup: { graceMs: 80, pollMs: 5 }
	});
	const jobs = [];
	for (let index = 0; index < total; index += 1) {
		const started = runtime.start({
			command: "sleep 1",
			ownerId: `agent-${index % 100}`
		});
		assert.equal(started.ok, true);
		jobs.push({ jobId: started.job.jobId, result: runtime.wait(started.job.jobId) });
	}
	await new Promise(resolve => setTimeout(resolve, 50));
	const statusLatencies = [];
	for (let index = 0; index < 1000; index += 1) {
		const startedAt = performance.now();
		runtime.snapshot();
		statusLatencies.push(performance.now() - startedAt);
	}
	const queuedTargets = jobs.slice(-100);
	const cancelStartedAt = performance.now();
	await Promise.all(queuedTargets.map(job => runtime.cancel(job.jobId)));
	const queuedCancelMs = performance.now() - cancelStartedAt;
	await Promise.all(jobs.slice(0, -100).map(job => runtime.cancel(job.jobId)));
	const results = await Promise.all(jobs.map(job => job.result));
	await new Promise(resolve => setTimeout(resolve, 50));
	const snapshot = runtime.snapshot();
	const sorted = statusLatencies.sort((left, right) => left - right);
	const report = {
		ok: true,
		total,
		agents: 100,
		queuedCancelMs,
		statusP50Ms: percentile(sorted, 0.5),
		statusP95Ms: percentile(sorted, 0.95),
		statusP99Ms: percentile(sorted, 0.99),
		terminalCounts: countBy(results, "status"),
		cleanupCounts: countBy(results.map(result => result.cleanup || { state: "none" }), "state"),
		snapshot
	};
	assert.equal(snapshot.activeJobs, 0);
	assert.equal(snapshot.admission.active, 0);
	assert.equal(snapshot.registry.active, 0);
	assert.equal(snapshot.queue.queued, 0);
	assert.ok(report.statusP99Ms < 10);
	assert.ok(queuedCancelMs < 1000);
	console.log(JSON.stringify(report));
}

function percentile(sorted, fraction) {
	const index = Math.min(sorted.length - 1, Math.floor(sorted.length * fraction));
	return Number(sorted[index].toFixed(3));
}
function countBy(records, field) {
	return records.reduce((counts, record) => {
		const value = String(record?.[field] || "unknown");
		counts[value] = (counts[value] || 0) + 1;
		return counts;
	}, {});
}

main().catch(error => { console.error(error.stack || error); process.exitCode = 1; });
