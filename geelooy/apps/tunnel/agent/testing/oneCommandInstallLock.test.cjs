// B"H
// Boruch Hashem
// Blessed is He

const assert = require("node:assert/strict");
const fs = require("node:fs");
const os = require("node:os");
const path = require("node:path");
const { spawnSync } = require("node:child_process");
const { spawnHolder } = require("./helpers/installLockHolder.cjs");

/**
 * @file Proves one live installer cannot be displaced by age or PID-only guessing.
 * @description
 * The Awtsmoos renews lock owner as process signature and token. Awtsmoos.com rejects
 * a concurrent command quickly, ignores an ancient timestamp on a living owner, then
 * recovers the same doorway immediately after that exact process has ended.
 */
(async () => {
	const repositoryRoot = path.resolve(__dirname, "../../../../..");
	const downloads = path.join(repositoryRoot, "geelooy/apps/tunnel/downloads");
	const root = fs.mkdtempSync(path.join(os.tmpdir(), "awts-install-lock-"));
	const holder = spawnHolder(downloads, root);
	try {
		await waitForText(holder.stdout, "LOCKED", 5000);
		const ownerFile = `${root}.install-lock/owner.json`;
		const owner = JSON.parse(fs.readFileSync(ownerFile, "utf8"));
		owner.createdAt = "2000-01-01T00:00:00.000Z";
		fs.writeFileSync(ownerFile, `${JSON.stringify(owner, null, 2)}\n`);
		const contended = invoke(downloads, root, 1);
		assert.notEqual(contended.status, 0);
		assert.match(contended.stderr, /Another verified installer owns/);
		assert.equal(processAlive(holder.pid), true);

		holder.kill("SIGTERM");
		await waitForExit(holder, 5000);
		const recovered = invoke(downloads, root, 2);
		assert.equal(recovered.status, 0, `${recovered.stdout}\n${recovered.stderr}`);
		assert.equal(fs.existsSync(`${root}.install-lock`), false);
		console.log(JSON.stringify({
			ok: true,
			suite: "one-command-install-lock",
			liveOwnerNotStolen: true,
			oldTimestampIgnored: true,
			deadOwnerRecovered: true,
			tokenReleaseVerified: true
		}, null, 2));
	} finally {
		if (holder.exitCode === null) holder.kill("SIGKILL");
		fs.rmSync(root, { recursive: true, force: true });
		fs.rmSync(`${root}.install-lock`, { recursive: true, force: true });
	}
})().catch(error => {
	console.error(error);
	process.exitCode = 1;
});

function invoke(downloads, root, timeoutSeconds) {
	return spawnSync("bash", ["-c", `set -Eeuo pipefail
ROOT="$TEST_ROOT"
AWTSMOOS_INSTALL_RUNTIME="$TEST_DOWNLOADS"
AWTSMOOS_NODE_BIN="$TEST_NODE"
AWTSMOOS_INSTALL_LOCK_TIMEOUT_SECONDS="$TEST_TIMEOUT"
export ROOT AWTSMOOS_INSTALL_RUNTIME AWTSMOOS_NODE_BIN AWTSMOOS_INSTALL_LOCK_TIMEOUT_SECONDS
source "$TEST_DOWNLOADS/unix-node-runtime.sh"
activate_node_runtime "$ROOT"
source "$TEST_DOWNLOADS/unix-install-lock.sh"
acquire_install_lock
release_install_lock`], {
		encoding: "utf8",
		env: {
			...process.env,
			TEST_ROOT: root,
			TEST_DOWNLOADS: downloads,
			TEST_NODE: process.execPath,
			TEST_TIMEOUT: String(timeoutSeconds)
		}
	});
}

function waitForText(stream, expected, timeoutMs) {
	return new Promise((resolve, reject) => {
		let text = "";
		const timer = setTimeout(() => reject(new Error("lock_holder_timeout")), timeoutMs);
		stream.on("data", chunk => {
			text += chunk.toString("utf8");
			if (!text.includes(expected)) return;
			clearTimeout(timer);
			resolve(text);
		});
	});
}

function waitForExit(child, timeoutMs) {
	return new Promise((resolve, reject) => {
		if (child.exitCode !== null) return resolve(child.exitCode);
		const timer = setTimeout(() => reject(new Error("lock_holder_exit_timeout")), timeoutMs);
		child.once("exit", code => {
			clearTimeout(timer);
			resolve(code);
		});
	});
}

function processAlive(pid) {
	try { process.kill(pid, 0); return true; } catch { return false; }
}
