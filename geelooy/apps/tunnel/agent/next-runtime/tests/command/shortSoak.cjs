// B"H
const assert = require("node:assert/strict");
const Command = require("../../command/index.js");

async function main() {
	const durationMs = Number(process.env.AWTSMOOS_SOAK_MS || 15000);
	const runtime = Command.createCommandRunner({
		maxActive: 12,
		maxQueued: 200,
		maxPerOwner: 50,
		maxRetained: 128,
		maxOutputBytes: 512,
		cleanup: { graceMs: 60, pollMs: 5 }
	});
	const startedAt = Date.now();
	const samples = [];
	let sequence = 0;
	let completed = 0;
	let failed = 0;
	while (Date.now() - startedAt < durationMs) {
		const jobs = [];
		for (let index = 0; index < 20; index += 1) {
			const shouldFail = sequence % 7 === 0;
			const started = runtime.start({
				command: shouldFail ? "exit 3" : "printf soak",
				ownerId: `agent-${sequence % 40}`
			});
			jobs.push(runtime.wait(started.job.jobId));
			sequence += 1;
		}
		const results = await Promise.all(jobs);
		completed += results.filter(result => result.status === "completed").length;
		failed += results.filter(result => result.status === "failed").length;
		const snapshot = runtime.snapshot();
		assert.equal(snapshot.admission.active, 0);
		assert.equal(snapshot.registry.active, 0);
		samples.push({
			atMs: Date.now() - startedAt,
			rss: process.memoryUsage().rss,
			heapUsed: process.memoryUsage().heapUsed,
			handles: process._getActiveHandles().length,
			jobs: snapshot.jobs
		});
		await new Promise(resolve => setTimeout(resolve, 25));
	}
	console.log(JSON.stringify({ ok: true, durationMs: Date.now() - startedAt, completed, failed, samples }));
}
main().catch(error => { console.error(error.stack || error); process.exitCode = 1; });
