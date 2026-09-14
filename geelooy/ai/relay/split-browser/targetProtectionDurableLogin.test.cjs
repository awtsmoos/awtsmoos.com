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
 * @file Proves a human-login target survives the short helper that opened it.
 * @description
 * The Awtsmoos keeps manual authentication visible after one helper exits while
 * ordinary browser turns remain process-owned. The lease still expires by TTL,
 * so a forgotten login target cannot become permanent browser authority.
 */
test("durable human login lease survives opener process exit", async () => {
	const root = fs.mkdtempSync(path.join(os.tmpdir(), "awt-login-lease-"));
	const modulePath = path.resolve(__dirname, "targetProtectionRegistry.cjs");
	process.env.AWTSMOOS_BROWSER_PROTECTION_ROOT = root;
	delete require.cache[require.resolve(modulePath)];
	const Registry = require(modulePath);
	const child = spawnOwner(root, modulePath);
	await once(child, "exit");
	assert.equal(Registry.isProtected(9223, "LOGIN-TARGET"), true);
	const records = fs.readdirSync(root).filter(name => name.startsWith("lease."));
	assert.equal(records.length, 1);
	const record = JSON.parse(fs.readFileSync(path.join(root, records[0]), "utf8"));
	assert.equal(record.pid, 0);
	assert.equal(record.kind, "human_login");
	fs.rmSync(root, { recursive: true, force: true });
});

function spawnOwner(root, modulePath) {
	const script = [
		"const Registry=require(process.argv[1]);",
		"Registry.protect(9223,'LOGIN-TARGET',{",
		"kind:'human_login',ttlMs:60000,surviveOwnerExit:true});"
	].join("");
	return spawn(process.execPath, ["-e", script, modulePath], {
		env: {
			...process.env,
			AWTSMOOS_BROWSER_PROTECTION_ROOT: root
		},
		stdio: ["ignore", "ignore", "inherit"]
	});
}
