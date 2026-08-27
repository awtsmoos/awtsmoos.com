// B"H
const assert = require("node:assert/strict");
const Command = require("../../command/index.js");

async function main() {
	const total = Number(process.env.AWTSMOOS_LEAK_TOTAL || 300);
	const maxRetained = 64;
	const runtime = Command.createCommandRunner({
		maxActive: 20,
		maxQueued: total + 20,
		maxPerOwner: total,
		maxRetained,
		cleanup: { graceMs: 60, pollMs: 5 }
	});
	const handlesBefore = process._getActiveHandles().length;
	const jobs = [];
	for (let index = 0; index < total; index += 1) {
		const mode = index % 3;
		const started = runtime.start({
			command: mode === 0 ? "printf done" : "sleep 1",
			timeoutMs: mode === 2 ? 30 : 5000,
			ownerId: `agent-${index % 30}`
		});
		jobs.push({ jobId: started.job.jobId, mode, result: runtime.wait(started.job.jobId) });
	}
	await new Promise(resolve => setTimeout(resolve, 100));
	await Promise.all(jobs.filter(job => job.mode === 1).map(job => runtime.cancel(job.jobId)));
	const results = await Promise.all(jobs.map(job => job.result));
	const counts = countBy(results, "status");
	const cleanupCounts = countBy(results.map(result => result.cleanup || { state: "none" }), "state");
	assert.equal(counts.completed, 100);
	assert.equal(counts.cancelled, 100);
	assert.equal(counts.timed_out, 100);
	assert.ok(results.filter(result => result.status === "timed_out").every(result => result.cleanup?.state === "cleaned"));
	assert.ok(results.filter(result => result.status === "cancelled").every(result => ["cleaned", "not_started"].includes(result.cleanup?.state)));
	await new Promise(resolve => setTimeout(resolve, 100));
	const snapshot = runtime.snapshot();
	assert.equal(snapshot.admission.active, 0);
	assert.equal(snapshot.registry.active, 0);
	assert.equal(snapshot.queue.queued, 0);
	assert.ok(snapshot.jobs <= maxRetained);
	console.log(JSON.stringify({ ok: true, total, counts, cleanupCounts, maxRetained, handlesBefore, handlesAfter: process._getActiveHandles().length, snapshot }));
}

function countBy(records, field) {
	return records.reduce((counts, record) => {
		const value = String(record?.[field] || "unknown");
		counts[value] = (counts[value] || 0) + 1;
		return counts;
	}, {});
}

main().catch(error => { console.error(error.stack || error); process.exitCode = 1; });
