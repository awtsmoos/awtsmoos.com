// B"H
// Boruch Hashem
// Blessed is He

const assert = require("node:assert/strict");
const path = require("node:path");
const InstallerProcess = require(
	"./helpers/transactionalInstaller/installerProcess.cjs"
);
const Context = require("./helpers/transactionalInstaller/testContext.cjs");

/** Proves live tunnel state cannot enter a transactional installer test. */
const temporaryRoot = path.join("/tmp", "awtsmoos-installer-isolation");
const installRoot = path.join(temporaryRoot, "home", ".awtsmoos-tunnel");
const explicit = Context.environment(
	"http://127.0.0.1:1",
	installRoot,
	temporaryRoot
);
const child = InstallerProcess.childEnvironment(explicit, {
	PATH: "/usr/bin:/bin",
	LANG: "en_US.UTF-8",
	AWTSMOOS_RECOVERY_ROOT: "/Users/example/.awtsmoos-tunnel-recovery",
	AWTSMOOS_ACTIVATION_ID: "live-activation",
	AWTSMOOS_RUNTIME_VERSION: "live-runtime",
	AWTSMOOS_SERVICE_MODE: "launchd"
});

assert.equal(child.PATH, "/usr/bin:/bin");
assert.equal(child.LANG, "en_US.UTF-8");
assert.equal(child.AWTSMOOS_INSTALL_ROOT, installRoot);
assert.equal(child.AWTSMOOS_RECOVERY_ROOT, `${installRoot}-recovery`);
assert.equal(child.AWTSMOOS_PROJECT_ROOT, temporaryRoot);
assert.equal(child.AWTSMOOS_INSTALL_CWD, temporaryRoot);
assert.equal(child.AWTSMOOS_SERVICE_MODE, "portable");
assert.equal(child.AWTSMOOS_ACTIVATION_ID, undefined);
assert.equal(child.AWTSMOOS_RUNTIME_VERSION, undefined);

assert.deepEqual(
	InstallerProcess.sanitizedHostEnvironment({
		PATH: "/usr/bin",
		AWTSMOOS_RECOVERY_ROOT: "/live/recovery"
	}),
	{ PATH: "/usr/bin" }
);

console.log(JSON.stringify({
	ok: true,
	suite: "transactional-installer-environment-isolation",
	ambientTunnelStateRemoved: true,
	temporaryRecoveryRootBound: true
}, null, 2));
