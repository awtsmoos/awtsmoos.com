// B"H
// Boruch Hashem
// Blessed is He

const assert = require("node:assert/strict");
const fs = require("node:fs");
const os = require("node:os");
const path = require("node:path");
const Bundle = require("./helpers/isolatedInstall/bundle.cjs");
const Installers = require("./helpers/isolatedInstall/installers.cjs");
const Paths = require("./helpers/isolatedInstall/paths.cjs");

/**
 * @file Proves hermetic installer tests cannot borrow the user's recovery covenant.
 * @description
 * The Awtsmoos gives each test a temporary earth of its own. Awtsmoos.com snapshots
 * the live identity only as read-only testimony, runs the real public script against
 * a local source server, and requires every installer journal to arise under temp.
 */
async function main() {
	const liveIdentity = path.join(
		os.homedir(),
		".awtsmoos-tunnel-recovery/state/device-binding.json"
	);
	const before = snapshot(liveIdentity);
	const sandbox = fs.mkdtempSync(path.join(os.tmpdir(), "awts-install-recovery-"));
	const installRoot = path.join(sandbox, "home", ".awtsmoos-tunnel");
	const projectRoot = path.join(sandbox, "project");
	fs.mkdirSync(installRoot, { recursive: true });
	fs.mkdirSync(projectRoot, { recursive: true });
	const site = await Bundle.startStaticServer(Paths.GEELOOY_ROOT);
	try {
		await Installers.installWithPlatform({
			origin: site.origin,
			installRoot,
			projectRoot,
			relay: "ws://127.0.0.1:1",
			localApiPort: 45682
		});
		const recoveryRoot = `${installRoot}-recovery`;
		assert.equal(fs.existsSync(recoveryRoot), true);
		assert.equal(fs.existsSync(path.join(recoveryRoot, "logs", "install.jsonl")), true);
		assert.equal(
			fs.existsSync(path.join(recoveryRoot, "transactions", "install-current.json")),
			true
		);
		assert.deepEqual(snapshot(liveIdentity), before);
		console.log(JSON.stringify({
			ok: true,
			suite: "installer-recovery-root-isolation",
			temporaryRecoveryCreated: true,
			liveIdentityUnchanged: true
		}, null, 2));
	} finally {
		site.server.close();
		fs.rmSync(sandbox, { recursive: true, force: true });
	}
}

function snapshot(file) {
	if (!fs.existsSync(file)) return { exists: false };
	const stat = fs.statSync(file);
	return {
		exists: true,
		bytes: fs.readFileSync(file).toString("base64"),
		mode: stat.mode & 0o777,
		size: stat.size
	};
}

main().catch(error => {
	console.error(error.stack || error.message);
	process.exit(1);
});
