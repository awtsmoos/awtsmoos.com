// B"H
const assert = require("node:assert/strict");
const Command = require("../../command/index.js");

async function main() {
	const total = Number(process.env.AWTSMOOS_STRESS_TOTAL || 1000);
	const maxRetained = 128;
	const runtime = Command.createCommandRunner({
		maxActive: 24,
		maxQueued: total + 50,
		maxPerOwner: total,
		maxRetained,
		maxOutputBytes: 256,
		cleanup: { graceMs: 100, pollMs: 10 }
	});
	const handlesBefore = process._getActiveHandles().length;
	const startedAt = Date.now();
	const jobs = [];
	for (let index = 0; index < total; index += 1) {
		const started = runtime.start({
			command: `printf '${index}\\n'`,
			ownerId: `agent-${index % 100}`,
			idempotencyKey: `stress-${index}`
		});
		assert.equal(started.ok, true);
		jobs.push({ jobId: started.job.jobId, result: runtime.wait(started.job.jobId) });
	}
	const results = await Promise.all(jobs.map(job => job.result));
	const durationMs = Date.now() - startedAt;
	assert.ok(results.every(result => result.status === "completed"));
	assert.ok(results.every(result => result.output.stdout.totalBytes > 0));
	const snapshot = runtime.snapshot();
	assert.equal(snapshot.admission.active, 0);
	assert.equal(snapshot.registry.active, 0);
	assert.equal(snapshot.queue.queued, 0);
	assert.ok(snapshot.jobs <= maxRetained);
	assert.equal(runtime.output(jobs.at(-1).jobId, "stdout"), `${total - 1}\n`);
	await new Promise(resolve => setTimeout(resolve, 50));
	console.log(JSON.stringify({
		ok: true,
		total,
		durationMs,
		throughputPerSecond: Number((total / (durationMs / 1000)).toFixed(2)),
		handlesBefore,
		handlesAfter: process._getActiveHandles().length,
		maxRetained,
		snapshot
	}));
}
main().catch(error => { console.error(error.stack || error); process.exitCode = 1; });
