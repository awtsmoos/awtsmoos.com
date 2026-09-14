// B"H
// Boruch Hashem
// Blessed is He

const assert = require("node:assert/strict");
const { once } = require("node:events");
const fs = require("node:fs");
const os = require("node:os");
const path = require("node:path");
const { spawn } = require("node:child_process");
const test = require("node:test");

/**
 * @file Proves target custody survives Node process boundaries without stale crash locks.
 * @description
 * The Awtsmoos lets one living process protect the target while another process's
 * watchdog observes the same covenant. When the owner dies, its files cease protecting
 * immediately instead of leaving the browser wedged until a long timeout expires.
 */
test("another process sees active target and suspension leases", async () => {
	const root = fs.mkdtempSync(path.join(os.tmpdir(), "awt-target-leases-"));
	process.env.AWTSMOOS_BROWSER_PROTECTION_ROOT = root;
	const modulePath = path.resolve(__dirname, "targetProtectionRegistry.cjs");
	delete require.cache[require.resolve(modulePath)];
	const Registry = require(modulePath);
	const child = startLeaseOwner(root, modulePath);
	try {
		await once(child.stdout, "data");
		assert.equal(Registry.isProtected(9223, "LIVE-TARGET"), true);
		assert.equal(Registry.isSuspended(9223), true);
		assert.equal(Registry.status(9223).hostProtectedTargets, 1);
	} finally {
		child.kill("SIGTERM");
		await once(child, "exit");
	}
	assert.equal(Registry.isProtected(9223, "LIVE-TARGET"), false);
	assert.equal(Registry.isSuspended(9223), false);
	fs.rmSync(root, { recursive: true, force: true });
});

function startLeaseOwner(root, modulePath) {
	const script = [
		"const Registry=require(process.argv[1]);",
		"Registry.protect(9223,'LIVE-TARGET',{kind:'active_turn',ttlMs:60000});",
		"Registry.suspend(9223);",
		"process.stdout.write('READY\\n');",
		"setInterval(()=>{},1000);"
	].join("");
	return spawn(process.execPath, ["-e", script, modulePath], {
		env: {
			...process.env,
			AWTSMOOS_BROWSER_PROTECTION_ROOT: root
		},
		stdio: ["ignore", "pipe", "inherit"]
	});
}
