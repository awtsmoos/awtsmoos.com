//B"H
//Boruch Hashem
//Blessed be He

const assert = require("node:assert/strict");
const fs = require("node:fs");
const os = require("node:os");
const path = require("node:path");
const test = require("node:test");

const Registry = require("./deviceBrowserRegistry.cjs");
const Disk = require("./targetProtectionDisk.cjs");
const Files = require("./targetProtectionFiles.cjs");
const RootGuard = require("./sharedChromeRootGuard.cjs");
const SharedProfile = require("./sharedChromeProfile.cjs");

/**
 * @file Locks the Shared AI Chrome capacity contract against browser multiplication.
 * @description
 * These tests use synthetic process testimony and isolated temporary state only.
 * They never open, close, or inspect the user's real browser session.
 */
test("capacity law permits one root and one temporary agent tab", () => {
	assert.deepEqual(SharedProfile.capacity(), {
		maxBrowserRoots: 1,
		maxIdlePages: 1,
		maxAgentTabs: 1,
		maxActivePages: 2
	});
});

test("root guard ignores helpers and retires duplicate roots of only this profile", async () => {
	const profile = "/tmp/awtsmoos-shared-capacity";
	const chrome = "/Applications/Google Chrome.app/Contents/MacOS/Google Chrome";
	const processText = [
		`100 ${chrome} --remote-debugging-port=0 --user-data-dir=${profile}`,
		`101 Google Chrome Helper --type=renderer --user-data-dir=${profile}`,
		`102 ${chrome} --remote-debugging-port=0 --user-data-dir=${profile}`,
		`200 ${chrome} --remote-debugging-port=0 --user-data-dir=/tmp/other-profile`
	].join("\n");
	const killed = [];
	const result = await RootGuard.reconcile(profile, 102, {
		processText,
		kill: pid => killed.push(pid)
	});
	assert.equal(result.roots.length, 2);
	assert.equal(result.keptPid, 102);
	assert.deepEqual(killed, [100]);
});
test("remembered device profile outranks later environment drift", () => {
	const root = fs.mkdtempSync(path.join(os.tmpdir(), "awtsmoos-browser-profile-"));
	const state = path.join(root, "device-browser.json");
	const profileA = path.join(root, "profile-a");
	const profileB = path.join(root, "profile-b");
	const environment = {
		...process.env,
		AWTSMOOS_AI_BROWSER_STATE: state,
		AWTSMOOS_CHROME_PROFILE: profileA
	};
	Registry.recordSpawn({
		pid: 123,
		port: 4444,
		profile: profileA,
		startedAt: 1
	}, environment);
	environment.AWTSMOOS_CHROME_PROFILE = profileB;
	assert.equal(Registry.selectedProfile({ environment }), profileA);
	assert.equal(Registry.selectedProfile({ environment, profile: profileB }), profileB);
	fs.rmSync(root, { recursive: true, force: true });
});
test("durable human-login protection is a singleton lease", () => {
	const root = fs.mkdtempSync(path.join(os.tmpdir(), "awtsmoos-browser-lease-"));
	const previous = process.env.AWTSMOOS_BROWSER_PROTECTION_ROOT;
	process.env.AWTSMOOS_BROWSER_PROTECTION_ROOT = root;
	try {
		Disk.protect(5555, "FIRST", {
			kind: "human_login",
			ttlMs: 60000,
			surviveOwnerExit: true
		});
		Disk.protect(5555, "SECOND", {
			kind: "human_login",
			ttlMs: 60000,
			surviveOwnerExit: true
		});
		const leases = Files.records("lease");
		assert.equal(leases.length, 1);
		assert.equal(leases[0].targetId, "SECOND");
	} finally {
		if (previous === undefined) delete process.env.AWTSMOOS_BROWSER_PROTECTION_ROOT;
		else process.env.AWTSMOOS_BROWSER_PROTECTION_ROOT = previous;
		fs.rmSync(root, { recursive: true, force: true });
	}
});
