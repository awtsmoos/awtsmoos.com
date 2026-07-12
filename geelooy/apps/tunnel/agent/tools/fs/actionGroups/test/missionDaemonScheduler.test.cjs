// B"H

const assert = require("assert");
const fs = require("fs");
const os = require("os");
const path = require("path");
const Mission = require("../../mission/index.js");
const Scheduler = require("../../mission/daemon/scheduler.js");
const Transaction = require("../../mission/transaction/index.js");

function sleep(milliseconds) {
	return new Promise(resolve => setTimeout(resolve, milliseconds));
}

async function waitUntil(predicate, timeoutMs = 5000) {
	const startedAt = Date.now();
	while (!predicate()) {
		if (Date.now() - startedAt >= timeoutMs) {
			throw new Error(`condition_timeout:${timeoutMs}`);
		}
		await sleep(25);
	}
}

(async () => {
	Scheduler.resetForTests();
	Transaction.resetForTests();
	const root = fs.mkdtempSync(path.join(os.tmpdir(), "awtsmoos-daemon-scheduler-"));
	const config = {
		root,
		metadataRoot: path.join(root, ".metadata")
	};
	const payload = { intervalMs: 250, missionId: "mission-one" };
	let activeTicks = 0;
	let maximumActiveTicks = 0;
	let completedTicks = 0;
	const fakeTick = async () => {
		activeTicks += 1;
		maximumActiveTicks = Math.max(maximumActiveTicks, activeTicks);
		await sleep(80);
		completedTicks += 1;
		activeTicks -= 1;
		return {
			ok: true,
			action: "missionDaemonTick",
			ranAction: "missionNext",
			missionId: "mission-one",
			nextSuggestedToolCall: {
				action: "missionNext",
				missionId: "mission-one"
			}
		};
	};
	try {
		const now = new Date().toISOString();
		await Mission.save(config, {
			id: "mission-one",
			goal: "Scheduler contract",
			createdAt: now,
			updatedAt: now
		});
		const firstStart = Scheduler.start(config, payload, () => ({}), fakeTick);
		const secondStart = Scheduler.start(config, payload, () => ({}), fakeTick);
		assert.equal(firstStart.running, true);
		assert.equal(secondStart.running, true);
		await sleep(20);
		await Promise.all([
			Scheduler.trigger(config, payload),
			Scheduler.trigger(config, payload),
			Scheduler.trigger(config, payload)
		]);
		await waitUntil(() => Scheduler.status(config, payload).tickCount >= 2);
		const running = Scheduler.status(config, payload);
		assert.equal(maximumActiveTicks, 1, "scheduler ticks must never overlap");
		assert(running.skippedOverlaps >= 1, "overlap attempts must be counted rather than executed");
		assert.equal(running.lastResult.missionId, "mission-one");
		const countBeforeStop = completedTicks;
		const stopped = Scheduler.stop(config, payload);
		assert.equal(stopped.running, false);
		await waitUntil(() => Scheduler.snapshot().count === 0);
		await sleep(350);
		assert.equal(completedTicks, countBeforeStop, "stop must prevent future ticks");
		assert.equal(Transaction.snapshot().keys, 0, "daemon transactions must leave no lock entries");
		console.log(JSON.stringify({
			ok: true,
			completedTicks,
			maximumActiveTicks,
			skippedOverlaps: running.skippedOverlaps,
			statusAfterStop: stopped,
			transactions: Transaction.snapshot(),
			schedulers: Scheduler.snapshot()
		}, null, 2));
	} finally {
		Scheduler.resetForTests();
		fs.rmSync(root, { recursive: true, force: true });
	}
})().catch(error => {
	Scheduler.resetForTests();
	console.error(error.stack || error.message);
	process.exit(1);
});
