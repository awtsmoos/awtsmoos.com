// B"H

const assert = require("assert");
const fs = require("fs");
const os = require("os");
const path = require("path");
const Mission = require("../../mission/index.js");
const Scheduler = require("../../mission/daemon/scheduler.js");
const Store = require("../../mission/continuationControl/store.js");

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

function mission(id) {
	const now = new Date().toISOString();
	return { id, goal: `Mission ${id}`, createdAt: now, updatedAt: now };
}

function emptySnapshot() {
	return {
		count: 0,
		running: 0,
		inFlight: 0,
		timers: 0,
		keys: []
	};
}

(async () => {
	Scheduler.resetForTests();
	const root = fs.mkdtempSync(path.join(os.tmpdir(), "awt-turn-scheduler-"));
	const config = { root, metadataRoot: path.join(root, ".metadata") };
	const counts = new Map();
	const fakeTick = async (_config, payload) => {
		counts.set(payload.missionId, (counts.get(payload.missionId) || 0) + 1);
		return { ok: true, action: "missionNext", missionId: payload.missionId };
	};
	try {
		await Mission.save(config, mission("alpha"));
		await Mission.save(config, mission("beta"));
		Scheduler.start(config, { missionId: "alpha", intervalMs: 250 }, () => ({}), fakeTick);
		Scheduler.start(config, { missionId: "beta", intervalMs: 250 }, () => ({}), fakeTick);
		await waitUntil(() => counts.get("alpha") >= 1 && counts.get("beta") >= 1);
		assert.equal(Scheduler.snapshot().count, 2, "each mission must own its scheduler lane");
		Scheduler.stop(config, { missionId: "alpha" });
		Scheduler.stop(config, { missionId: "beta" });
		await waitUntil(() => Scheduler.snapshot().count === 0);
		assert.deepEqual(Scheduler.snapshot(), emptySnapshot());

		for (let index = 0; index < 1000; index += 1) {
			const missionId = `cycle-${index}`;
			Scheduler.start(config, { missionId, intervalMs: 250 }, () => ({}), fakeTick);
			Scheduler.stop(config, { missionId });
		}
		await waitUntil(() => Scheduler.snapshot().count === 0);
		assert.equal(
			Scheduler.snapshot().count,
			0,
			"1,000 start-stop cycles must leak no scheduler entries"
		);

		await Mission.save(config, mission("single-turn"));
		await Store.mutate(config, { missionId: "single-turn" }, control => ({
			...control,
			desiredState: "paused",
			oneTurnCredits: 1
		}));
		Scheduler.start(
			config,
			{ missionId: "single-turn", intervalMs: 250 },
			() => ({}),
			fakeTick
		);
		await waitUntil(() => counts.get("single-turn") === 1);
		await sleep(400);
		assert.equal(
			counts.get("single-turn"),
			1,
			"one-turn credit must execute exactly one turn"
		);
		const single = await Store.read(config, { missionId: "single-turn" });
		assert.equal(single.control.completedTurns, 1);
		assert.equal(single.control.observedState, "paused");
		Scheduler.stop(config, { missionId: "single-turn" });
		await waitUntil(() => Scheduler.snapshot().count === 0);
		assert.deepEqual(Scheduler.snapshot(), emptySnapshot());
		console.log(JSON.stringify({
			ok: true,
			counts: Object.fromEntries(counts),
			snapshot: Scheduler.snapshot()
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
