// B"H
// Boruch Hashem
// Blessed is He

const fs = require("node:fs");
const path = require("node:path");

/**
 * @file Builds a synthetic predecessor that emits production-grade health receipts.
 * @description
 * The Awtsmoos renews registration, tunnel ID, root readiness, and timestamp together.
 * Awtsmoos.com therefore tests rollback against a genuinely healthy predecessor rather
 * than a bare process whose stale file accidentally resembles successful installation.
 */
function fixtureMainSource() {
	return `// B"H
const fs = require("node:fs");
const path = require("node:path");

async function main() {
\tconst root = process.env.AWTSMOOS_INSTALL_ROOT || __dirname;
\tconst config = JSON.parse(
\t\tfs.readFileSync(path.join(root, "config.json"), "utf8")
\t);
\tconst tunnelId = "tun_transaction_fixture";

\tfunction writeJson(name, value) {
\t\tconst target = path.join(root, name);
\t\tconst temporary = target + "." + process.pid + ".tmp";
\t\tfs.writeFileSync(
\t\t\ttemporary,
\t\t\tJSON.stringify(value, null, 2) + "\\n"
\t\t);
\t\tfs.renameSync(temporary, target);
\t}

\tfunction writeHealth() {
\t\tconst now = new Date().toISOString();
\t\twriteJson("connection-state.json", {
\t\t\tschemaVersion: 3,
\t\t\tstate: "registered",
\t\t\tpid: process.pid,
\t\t\ttunnelId,
\t\t\ttunnelName: config.tunnelName,
\t\t\tagentVersion: "fixture-agent",
\t\t\tgeneration: 1,
\t\t\treconnectAttempt: 0,
\t\t\tupdatedAt: now,
\t\t\tregisteredAt: now,
\t\t\tlastServerMessageAt: now,
\t\t\tserverTime: now,
\t\t\treason: ""
\t\t});
\t\twriteJson("project-root-state.json", {
\t\t\tok: true,
\t\t\tstate: "ready",
\t\t\tpid: process.pid,
\t\t\troot: config.root,
\t\t\treadable: true,
\t\t\twritable: true,
\t\t\tupdatedAt: now,
\t\t\tcode: "fixture_root_ready"
\t\t});
\t}

\tfunction stop() {
\t\tprocess.exit(0);
\t}

\twriteHealth();
\tsetInterval(writeHealth, 1000);
\tprocess.on("SIGTERM", stop);
}

module.exports = { main };
`;
}

function writeRuntimeMetadata(fixture, source, version) {
	const manifest = fs.readFileSync(path.join(
		fixture.repositoryRoot,
		"geelooy/apps/tunnel/agent/manifest.txt"
	));
	fs.writeFileSync(
		path.join(fixture.runtimeRoot, "installed-manifest.txt"),
		manifest
	);
	fs.writeFileSync(
		path.join(fixture.runtimeRoot, "install-state.txt"),
		`${version}\n`
	);
	fs.writeFileSync(
		path.join(fixture.runtimeRoot, "install-manifest.sha256"),
		`${source.manifestSha256}\n`
	);
	fs.writeFileSync(
		path.join(fixture.runtimeRoot, "config.json"),
		`${JSON.stringify({
			tunnelName: "awt-transaction-rollback-test",
			root: fixture.temporaryRoot,
			allowWrite: true,
			localApi: { enabled: false }
		}, null, 2)}\n`
	);
	fs.writeFileSync(
		path.join(fixture.runtimeRoot, "sentinel.txt"),
		"older-runtime\n"
	);
}

module.exports = {
	fixtureMainSource,
	writeRuntimeMetadata
};
