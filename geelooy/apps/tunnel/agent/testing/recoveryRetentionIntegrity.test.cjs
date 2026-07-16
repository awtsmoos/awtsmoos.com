// B"H
// Boruch Hashem
// Blessed is He

const assert = require("node:assert/strict");
const crypto = require("node:crypto");
const fs = require("node:fs");
const os = require("node:os");
const path = require("node:path");
const { spawnSync } = require("node:child_process");

/**
 * @file Proves corrupt new archives cannot evict older healthy recovery worlds.
 * @description
 * The Awtsmoos renews integrity before chronology. Awtsmoos.com removes malformed
 * and checksum-failed directories first, then retains the newest requested number
 * of verified archives regardless of misleading directory names or timestamps.
 */
const repositoryRoot = path.resolve(__dirname, "../../../../..");
const script = path.join(
	repositoryRoot,
	"geelooy/apps/tunnel/downloads/unix-recovery-retention.sh"
);
const root = fs.mkdtempSync(path.join(os.tmpdir(), "awts-retention-integrity-"));
const recovery = path.join(root, "recovery");
const versions = path.join(recovery, "versions");
fs.mkdirSync(versions, { recursive: true });
try {
	createArchive(versions, "valid-old", "2026-01-01T00:00:00.000Z", "old");
	createArchive(versions, "valid-middle", "2026-02-01T00:00:00.000Z", "middle");
	createArchive(versions, "valid-new", "2026-03-01T00:00:00.000Z", "new");
	createArchive(versions, "corrupt-newest", "2026-12-01T00:00:00.000Z", "bad", true);
	fs.mkdirSync(path.join(versions, "malformed-latest"));
	fs.writeFileSync(path.join(versions, "malformed-latest/runtime.tar"), "debris");

	const result = spawnSync("bash", ["-c", `set -Eeuo pipefail
ROOT="$TEST_ROOT/live"
RECOVERY_ROOT="$TEST_RECOVERY"
AWTSMOOS_ARCHIVE_KEEP=2
source "$TEST_SCRIPT"
prune_recovery_versions`], {
		encoding: "utf8",
		env: {
			...process.env,
			TEST_ROOT: root,
			TEST_RECOVERY: recovery,
			TEST_SCRIPT: script
		}
	});
	assert.equal(result.status, 0, `${result.stdout}\n${result.stderr}`);
	assert.deepEqual(fs.readdirSync(versions).sort(), ["valid-middle", "valid-new"]);
	console.log(JSON.stringify({
		ok: true,
		suite: "recovery-retention-integrity",
		corruptArchivesRemovedFirst: true,
		newestHealthyRetained: true,
		healthyKeepCount: 2
	}, null, 2));
} finally {
	fs.rmSync(root, { recursive: true, force: true });
}

function createArchive(root, name, createdAt, content, corrupt = false) {
	const directory = path.join(root, name);
	const archive = path.join(directory, "runtime.tar");
	fs.mkdirSync(directory);
	fs.writeFileSync(archive, content);
	const hash = crypto.createHash("sha256").update(content).digest("hex");
	fs.writeFileSync(path.join(directory, "metadata.json"), `${JSON.stringify({
		version: name,
		createdAt,
		archiveSha256: corrupt ? "0".repeat(64) : hash
	}, null, 2)}\n`);
}
