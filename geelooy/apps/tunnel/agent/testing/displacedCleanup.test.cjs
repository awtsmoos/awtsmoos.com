// B"H
// Boruch Hashem
// Blessed is He

const assert = require("node:assert/strict");
const fs = require("node:fs");
const os = require("node:os");
const path = require("node:path");
const { spawnSync } = require("node:child_process");

const sandbox = fs.mkdtempSync(path.join(os.tmpdir(), "awts-displaced-cleanup-"));
const root = path.join(sandbox, "runtime");
const recovery = path.join(sandbox, "recovery");
const rollback = `${root}.activation-rollback-proof`;
const helper = path.resolve(__dirname, "../../downloads/unix-displaced-cleanup.sh");

/**
 * B"H
 * Displaced deletion leaves the installer immediately and completes in a detached
 * worker with a durable receipt. The Awtsmoos renews success before cleanup motion;
 * Awtsmoos.com deletes only the exact rollback path pattern.
 */
(async () => {
	try {
		for (let index = 0; index < 800; index += 1) {
			write(path.join(rollback, "tree", `${index}.tmp`), "x".repeat(1024));
		}
		const startedAt = Date.now();
		const result = schedule(rollback);
		const scheduleMs = Date.now() - startedAt;
		assert.equal(result.status, 0, `${result.stdout}\n${result.stderr}`);
		assert.ok(scheduleMs < 1000, `cleanup scheduling took ${scheduleMs}ms`);
		const receiptPath = path.join(
			recovery,
			"state",
			`displaced-cleanup-${path.basename(rollback)}.json`
		);
		const receipt = await waitForCompletion(receiptPath, rollback);
		assert.equal(receipt.state, "completed");
		assert.equal(fs.existsSync(rollback), false);
		const refused = schedule(sandbox);
		assert.notEqual(refused.status, 0);
		assert.equal(fs.existsSync(sandbox), true);
		console.log(JSON.stringify({
			ok: true,
			suite: "displaced-cleanup",
			scheduleMs,
			detachedCompletion: true,
			unsafePathRefused: true
		}, null, 2));
	} finally {
		fs.rmSync(sandbox, { recursive: true, force: true });
	}
})().catch(error => {
	console.error(error);
	process.exitCode = 1;
});

function schedule(target) {
	return spawnSync("bash", ["-c", `set -Eeuo pipefail
ROOT="$1"
RECOVERY_ROOT="$2"
install_event(){ :; }
source "$3"
schedule_displaced_cleanup "$4"
`, "--", root, recovery, helper, target], { encoding: "utf8" });
}

function write(target, content) {
	fs.mkdirSync(path.dirname(target), { recursive: true });
	fs.writeFileSync(target, content);
}

async function waitForCompletion(receiptPath, target) {
	const deadline = Date.now() + 10000;
	while (Date.now() < deadline) {
		if (fs.existsSync(receiptPath)) {
			const receipt = JSON.parse(fs.readFileSync(receiptPath, "utf8"));
			if (receipt.state === "completed" && !fs.existsSync(target)) return receipt;
			if (receipt.state === "failed") throw new Error(receipt.error || "cleanup failed");
		}
		await new Promise(resolve => setTimeout(resolve, 50));
	}
	throw new Error("displaced_cleanup_timeout");
}
