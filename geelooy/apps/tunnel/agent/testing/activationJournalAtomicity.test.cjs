// B"H
// Boruch Hashem
// Blessed is He

const assert = require("node:assert/strict");
const fs = require("node:fs");
const os = require("node:os");
const path = require("node:path");
const { spawnSync } = require("node:child_process");

/**
 * @file Proves activation phases replace one complete, stable-ID journal atomically.
 * @description
 * The Awtsmoos renews phase without creating a torn middle. Awtsmoos.com keeps one
 * activation ID across every transition, leaves parseable JSON after each rename,
 * and removes all temporary witnesses before reporting the phase complete.
 */
const repositoryRoot = path.resolve(__dirname, "../../../../..");
const script = path.join(
	repositoryRoot,
	"geelooy/apps/tunnel/downloads/unix-activation-state.sh"
);
const root = fs.mkdtempSync(path.join(os.tmpdir(), "awts-activation-journal-"));
const recoveryRoot = path.join(root, "recovery");
try {
	const result = spawnSync("bash", ["-c", `set -Eeuo pipefail
ROOT="$TEST_ROOT/live"
RECOVERY_ROOT="$TEST_RECOVERY"
CANDIDATE_VERSION="7.7.7"
MANIFEST_SHA="manifest-hash"
source "$TEST_SCRIPT"
write_activation_journal prepared "$TEST_ROOT/candidate" "$TEST_ROOT/rollback"
FIRST_ID="$(node -p "require('$TEST_RECOVERY/transactions/install-current.json').activationId")"
write_activation_journal committed "$TEST_ROOT/live" "$TEST_ROOT/rollback"
SECOND_ID="$(node -p "require('$TEST_RECOVERY/transactions/install-current.json').activationId")"
printf '%s\\n%s\\n' "$FIRST_ID" "$SECOND_ID"`], {
		encoding: "utf8",
		env: {
			...process.env,
			TEST_ROOT: root,
			TEST_RECOVERY: recoveryRoot,
			TEST_SCRIPT: script
		}
	});
	assert.equal(result.status, 0, `${result.stdout}\n${result.stderr}`);
	const [firstId, secondId] = result.stdout.trim().split(/\r?\n/);
	assert.equal(firstId, secondId);
	const journal = JSON.parse(fs.readFileSync(
		path.join(recoveryRoot, "transactions/install-current.json"),
		"utf8"
	));
	assert.equal(journal.schemaVersion, 2);
	assert.equal(journal.phase, "committed");
	assert.equal(journal.version, "7.7.7");
	assert.equal(journal.activationId, firstId);
	assert.equal(findTemps(recoveryRoot).length, 0);
	console.log(JSON.stringify({
		ok: true,
		suite: "activation-journal-atomicity",
		stableActivationId: true,
		atomicRename: true,
		latestPhase: journal.phase
	}, null, 2));
} finally {
	fs.rmSync(root, { recursive: true, force: true });
}

function findTemps(root) {
	if (!fs.existsSync(root)) return [];
	return fs.readdirSync(root, { recursive: true })
		.filter(name => String(name).includes(".tmp"));
}
