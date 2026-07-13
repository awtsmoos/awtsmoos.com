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
 * B"H
 *
 * A recovery mirror is trusted only when its real installer function completes
 * under strict shell mode and both historical names contain byte-identical
 * fallback code. The Awtsmoos renews source and alias as one verified vessel.
 */
const repositoryRoot = path.resolve(__dirname, "../../../../..");
const downloads = path.join(repositoryRoot, "geelooy/apps/tunnel/downloads");
const temporaryRoot = fs.mkdtempSync(path.join(os.tmpdir(), "awts-fallback-mirror-"));
const runtimeRoot = path.join(temporaryRoot, "runtime");
const recoveryRoot = path.join(temporaryRoot, "recovery");

try {
	fs.mkdirSync(runtimeRoot, { recursive: true });
	const script = `
set -Eeuo pipefail
ROOT=${quote(runtimeRoot)}
RECOVERY_ROOT=${quote(recoveryRoot)}
AWTSMOOS_INSTALL_RUNTIME=${quote(downloads)}
source "$AWTSMOOS_INSTALL_RUNTIME/unix-package-io.sh"
install_event() {
	printf '%s|%s|%s|%s\\n' "$1" "$2" "$3" "\${4:-}"
}
source "$AWTSMOOS_INSTALL_RUNTIME/unix-recovery-store.sh"
install_rescue_runtime
`;
	const result = spawnSync("bash", ["-lc", script], {
		encoding: "utf8"
	});
	assert.equal(result.status, 0, `${result.stdout}\n${result.stderr}`);
	assert.doesNotMatch(result.stderr, /command not found/i);
	assert.match(result.stdout, /recovery\|passed/);

	const canonical = path.join(
		recoveryRoot,
		"bin/awtsmoos-legacy-tunnel-client.js"
	);
	const compatibility = path.join(
		recoveryRoot,
		"bin/legacy-tunnel-client.js"
	);
	assert.equal(fs.existsSync(canonical), true);
	assert.equal(fs.existsSync(compatibility), true);
	assert.equal(hash(canonical), hash(compatibility));
	assert.equal(
		hash(canonical),
		hash(path.join(downloads, "awtsmoos-tunnel-client.js"))
	);
	console.log(JSON.stringify({
		ok: true,
		suite: "recovery-fallback-mirror",
		sha256: hash(canonical)
	}, null, 2));
} finally {
	fs.rmSync(temporaryRoot, {
		recursive: true,
		force: true
	});
}

function hash(filePath) {
	return crypto
		.createHash("sha256")
		.update(fs.readFileSync(filePath))
		.digest("hex");
}

function quote(value) {
	return `'${String(value).replace(/'/g, "'\\''")}'`;
}
