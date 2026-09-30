// B"H

const assert = require("node:assert/strict");
const fs = require("node:fs");
const path = require("node:path");
const Preflight = require("./tunnel-bundle-preflight.cjs");

/** Proves release integrity is established before canonical server mutation. */
const root = path.resolve(__dirname, "../..");
const activation = fs.readFileSync(path.join(__dirname, "canonical-server-activate.sh"), "utf8");
const report = Preflight.run(root);

assert.match(report.version, /^\d+\.\d+\.\d+$/);
assert.ok(report.files > 1000);
assert.ok(report.bytes > 100000);
assert.match(report.sha256, /^[0-9a-f]{64}$/);
assert.match(report.manifestSha256, /^[0-9a-f]{64}$/);

const preflightIndex = activation.indexOf('node "$tunnel_preflight" "$repo"');
const armedIndex = activation.indexOf("\narmed=1\n");
const deployRestartIndex = activation.indexOf('systemctl restart "$service"', armedIndex);
assert.ok(preflightIndex > 0, "canonical activation must invoke bundle preflight");
assert.ok(armedIndex > preflightIndex, "rollback must arm only after bundle proof");
assert.ok(deployRestartIndex > armedIndex, "deployment restart must follow armed mutation section");
assert.ok(preflightIndex < deployRestartIndex, "bundle proof must precede deployment restart");

console.log(JSON.stringify({
	ok: true,
	suite: "tunnel-bundle-preflight",
	version: report.version,
	files: report.files,
	bytes: report.bytes,
	preflightBeforeMutation: true
}, null, 2));
