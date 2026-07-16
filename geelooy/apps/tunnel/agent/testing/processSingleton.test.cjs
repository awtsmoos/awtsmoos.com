// B"H
// Boruch Hashem
// Blessed is He

const assert = require("node:assert/strict");
const fs = require("node:fs");
const os = require("node:os");
const path = require("node:path");
const { spawn, spawnSync } = require("node:child_process");

/**
 * @file Proves one install root cannot host two agent processes.
 * @description
 * The Awtsmoos renews owner and successor without overlap. Awtsmoos.com lets the
 * first child hold the lease, refuses the second before runtime activity, then lets
 * a third acquire only after the exact former owner has released its directory.
 */
(async () => {
	const root = fs.mkdtempSync(path.join(os.tmpdir(), "awts-singleton-"));
	const childFile = path.join(__dirname, "helpers/processSingletonChild.cjs");
	let first = null;
	try {
		first = spawn(process.execPath, [childFile, root, "hold"], {
			stdio: ["ignore", "pipe", "pipe"]
		});
		const firstResult = await firstJsonLine(first);
		assert.equal(firstResult.ok, true);

		const second = spawnSync(process.execPath, [childFile, root, "once"], {
			encoding: "utf8",
			timeout: 5000
		});
		assert.equal(second.status, 17, second.stderr);
		const secondResult = JSON.parse(second.stdout.trim());
		assert.equal(secondResult.ok, false);
		assert.equal(secondResult.error, "agent_instance_already_running");
		assert.equal(secondResult.ownerPid, first.pid);

		first.kill("SIGTERM");
		await waitForExit(first);
		first = null;
		const third = spawnSync(process.execPath, [childFile, root, "once"], {
			encoding: "utf8",
			timeout: 5000
		});
		assert.equal(third.status, 0, third.stderr);
		assert.equal(JSON.parse(third.stdout.trim()).ok, true);
		assert.equal(fs.existsSync(path.join(root, ".agent-instance.lock")), false);

		console.log(JSON.stringify({
			ok: true,
			suite: "process-singleton",
			duplicateRefusedBeforeStartup: true,
			successorAfterRelease: true
		}, null, 2));
	} finally {
		if (first && first.exitCode === null) first.kill("SIGKILL");
		fs.rmSync(root, { recursive: true, force: true });
	}
})().catch(error => {
	console.error(error);
	process.exitCode = 1;
});

function firstJsonLine(child) {
	return new Promise((resolve, reject) => {
		let text = "";
		const timer = setTimeout(() => reject(new Error("singleton_child_timeout")), 5000);
		child.stdout.on("data", chunk => {
			text += chunk.toString("utf8");
			const line = text.split(/\r?\n/).find(Boolean);
			if (!line) return;
			clearTimeout(timer);
			resolve(JSON.parse(line));
		});
		child.once("error", reject);
	});
}

function waitForExit(child) {
	return new Promise(resolve => {
		if (child.exitCode !== null) return resolve(child.exitCode);
		child.once("exit", resolve);
	});
}
