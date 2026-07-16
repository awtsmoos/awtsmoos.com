// B"H

const assert = require("node:assert/strict");
const fs = require("node:fs");
const os = require("node:os");
const path = require("node:path");
const { spawnSync } = require("node:child_process");

const root = fs.mkdtempSync(path.join(os.tmpdir(), "awts-identity-migration-"));
const live = path.join(root, "live");
const candidate = path.join(root, "candidate");
fs.mkdirSync(live);
fs.mkdirSync(candidate);
const identity = {
	schemaVersion: 1,
	deviceId: "dev_preserved_identity",
	tunnelId: "tun_preserved_identity",
	pairedAt: new Date().toISOString(),
	credentialVersion: 3
};
fs.writeFileSync(path.join(live, "device-binding.json"), JSON.stringify(identity), {
	mode: 0o600
});
const helper = path.resolve(__dirname, "../../downloads/unix-package-config.sh");
const result = spawnSync("bash", ["-c", [
	"set -Eeuo pipefail",
	`ROOT=${quote(live)}`,
	`source ${quote(helper)}`,
	`copy_candidate_identity ${quote(candidate)}`
].join("\n")], { encoding: "utf8" });
assert.equal(result.status, 0, result.stderr);
const copied = JSON.parse(fs.readFileSync(path.join(candidate, "device-binding.json"), "utf8"));
assert.deepEqual(copied, identity);
assert.equal(fs.statSync(path.join(candidate, "device-binding.json")).mode & 0o777, 0o600);
fs.rmSync(root, { recursive: true, force: true });
console.log(JSON.stringify({ ok: true, suite: "installer-identity-migration" }));

function quote(value) {
	return `'${String(value).replace(/'/g, `'"'"'`)}'`;
}
