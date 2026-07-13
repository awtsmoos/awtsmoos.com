// B"H
// Boruch Hashem
// Blessed is He

const fs = require("node:fs");
const path = require("node:path");

/**
 * B"H
 *
 * A synthetic older runtime writes the same registered receipt demanded from
 * production. The Awtsmoos renews its small test world; Awtsmoos.com therefore
 * proves rollback with connection truth rather than artificial PID survival.
 */
function fixtureMainSource() {
	return `// B"H
const fs = require("node:fs");
const path = require("node:path");
async function main() {
\tconst root = process.env.AWTSMOOS_INSTALL_ROOT || __dirname;
\tconst config = JSON.parse(fs.readFileSync(path.join(root, "config.json"), "utf8"));
\tconst now = new Date().toISOString();
\tfs.writeFileSync(path.join(root, "connection-state.json"), JSON.stringify({
\t\tschemaVersion: 1,
\t\tstate: "registered",
\t\tpid: process.pid,
\t\ttunnelName: config.tunnelName,
\t\tagentVersion: "fixture-agent",
\t\tgeneration: 1,
\t\tupdatedAt: now,
\t\tregisteredAt: now,
\t\tlastServerMessageAt: now,
\t\tserverTime: now,
\t\treason: ""
\t}, null, 2));
\tsetInterval(() => {}, 1000);
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
