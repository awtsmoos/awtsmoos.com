// B"H
// Boruch Hashem
// Blessed is He

const assert = require("node:assert/strict");
const fs = require("node:fs");
const os = require("node:os");
const path = require("node:path");

const installRoot = fs.mkdtempSync(
	path.join(os.tmpdir(), "awtsmoos-chrome-ownership-")
);
process.env.AWTSMOOS_INSTALL_ROOT = installRoot;

const modulePath = require.resolve("../tools/chrome/processes.js");
const profile = path.join(
	os.tmpdir(),
	`awtsmoos-owned-browser-${process.pid}`
);

try {
	const Processes = require(modulePath);
	assert.equal(
		Processes.isChromeProcessCommand(
			`/Applications/Google Chrome.app/Contents/MacOS/Google Chrome --user-data-dir=${profile}`,
			profile,
			"/Applications/Google Chrome.app/Contents/MacOS/Google Chrome"
		),
		true
	);
	assert.equal(
		Processes.isChromeProcessCommand(
			`/bin/zsh -lc node cleanup.js ${profile}`,
			profile,
			"/bin/zsh"
		),
		false,
		"an unrelated shell mentioning the profile must never be killed"
	);
	assert.equal(
		Processes.isChromeProcessCommand(
			`node verifier.js --profile ${profile}`,
			profile,
			"/usr/local/bin/node"
		),
		false,
		"an agent verifier mentioning the profile must never be killed"
	);

	const record = Processes.register({
		pid: 987654,
		port: 45678,
		userDataDir: profile
	});
	assert.equal(record.port, 45678);
	assert.equal(fs.existsSync(Processes.registryPath()), true);
	assert.equal(
		fs.statSync(Processes.registryPath()).mode & 0o077,
		0,
		"durable registry must remain private"
	);

	delete require.cache[modulePath];
	const Reloaded = require(modulePath);
	assert.deepEqual(
		Reloaded.snapshot().map(item => ({
			pid: item.pid,
			port: item.port,
			userDataDir: item.userDataDir
		})),
		[{ pid:987654, port:45678, userDataDir:profile }]
	);

	console.log(JSON.stringify({
		ok: true,
		suite: "chrome-process-ownership",
		unrelatedShellProtected: true,
		unrelatedNodeProtected: true,
		registrySurvivesAgentReload: true,
		registryPrivate: true
	}, null, 2));
} finally {
	fs.rmSync(installRoot, { recursive:true, force:true });
	fs.rmSync(`${installRoot}-recovery`, { recursive:true, force:true });
}
