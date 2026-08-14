// B"H

const assert = require("node:assert/strict");
const fs = require("node:fs");
const os = require("node:os");
const path = require("node:path");
const stateRoot = fs.mkdtempSync(path.join(os.tmpdir(), "awtsmoos-server-state-"));
process.env.AWTSMOOS_FS_EXECUTOR_TEST_MODE = "1";
process.env.AWTSMOOS_PRIVATE_STATE_ROOT = path.join(stateRoot, "private");
process.env.AWTSMOOS_TUNNEL_STATE_ROOT = path.join(stateRoot, "device");
const Pool = require("../tools/fs/executor/pool.js");

async function run() {
	const root = await fs.promises.mkdtemp(path.join(os.tmpdir(), "awtsmoos-server-affinity-"));
	await fs.promises.writeFile(path.join(root, "index.html"), "<h1 id=\"proof\">B'H affinity</h1>");
	const pool = Pool.createPool({
		IDLE_SHUTDOWN_MS: 0,
		JOB_TIMEOUT_MS: 10000,
		MAX_PER_REQUESTER: 2,
		MAX_QUEUE: 32,
		MIN_WORKERS: 2,
		READY_TIMEOUT_MS: 30000,
		WORKERS: 4
	});
	try {
		pool.warm();
		const started = await pool.execute({
			action: "staticServerStart",
			projectRoot: root,
			path: ".",
			port: 0,
			logicalAgentId: "server-owner",
			noMission: true
		});
		assert.equal(started.ok, true, JSON.stringify(started));
		assert.ok(started.serverId);
		assert.equal(started.listening, true);
		assert.equal(pool.stats().resourceAffinities, 1);

		const response = await fetch(started.url);
		assert.equal(response.status, 200);
		assert.match(await response.text(), /B'H affinity/);

		const pressure = Array.from({ length: 3 }, (_, index) => pool.execute({
			action: "executorTestBlock",
			blockMs: 350,
			logicalAgentId: `server-pressure-${index}`
		}));
		const logs = await pool.execute({
			action: "staticServerLogs",
			serverId: started.serverId,
			logicalAgentId: "server-observer",
			noMission: true
		});
		assert.equal(logs.ok, true);
		assert.equal(logs.serverId, started.serverId);
		assert.ok(logs.logs.some(entry => entry.status === 200));

		const stopped = await pool.execute({
			action: "staticServerStop",
			serverId: started.serverId,
			logicalAgentId: "server-cleanup",
			noMission: true
		});
		await Promise.all(pressure);
		assert.equal(stopped.stopped, true, JSON.stringify(stopped));
		assert.notEqual(stopped.alreadyStopped, true);
		assert.equal(pool.stats().resourceAffinities, 0);
		await assert.rejects(fetch(started.url));

		console.log(JSON.stringify({
			ok: true,
			suite: "fs-executor-server-affinity",
			serverId: started.serverId,
			isolatedState: true,
			stopRoutedToOwner: true
		}, null, 2));
	} finally {
		pool.shutdown();
		await fs.promises.rm(root, { recursive: true, force: true });
		await fs.promises.rm(stateRoot, { recursive: true, force: true });
	}
}

run().catch(error => {
	console.error(error);
	process.exit(1);
});
