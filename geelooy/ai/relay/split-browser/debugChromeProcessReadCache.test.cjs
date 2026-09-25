//B"H
//Boruch Hashem
//Blessed be He

const assert = require("node:assert/strict");
const test = require("node:test");
const RootGuard = require("./sharedChromeRootGuard.cjs");
const Owner = require("./debugChromeProfileOwner.cjs");
const Pressure = require("./debugChromeLaunchPressure.cjs");

/**
 * @file Proves process-table reads are cached, bounded, and never block the loop.
 * @description
 * The watchdog's 500ms sweep used to fork `ps` synchronously on every tick.
 * These tests prove each module now reads asynchronously, shares one listing
 * per TTL window, and returns to the event loop while the child runs.
 */
const MODULES = [
	["sharedChromeRootGuard", RootGuard],
	["debugChromeProfileOwner", Owner],
	["debugChromeLaunchPressure", Pressure]
];

for (const [name, mod] of MODULES) {
	test(`${name}: second readProcesses within TTL does not re-spawn`, async () => {
		mod.clearProcessCache();
		let spawns = 0;
		const executor = async () => { spawns += 1; return "listing"; };
		assert.equal(await mod.readProcesses(executor), "listing");
		assert.equal(await mod.readProcesses(executor), "listing");
		assert.equal(spawns, 1);
	});

	test(`${name}: readProcesses re-spawns only after the TTL expires`, async () => {
		mod.clearProcessCache();
		let spawns = 0;
		const executor = async () => { spawns += 1; return "listing"; };
		assert.equal(await mod.readProcesses(executor, 15), "listing");
		await new Promise(resolve => setTimeout(resolve, 40));
		assert.equal(await mod.readProcesses(executor, 15), "listing");
		assert.equal(spawns, 2);
	});

	test(`${name}: a failed read does not poison the cache`, async () => {
		mod.clearProcessCache();
		let calls = 0;
		const failing = async () => { calls += 1; throw new Error("ps exploded"); };
		await assert.rejects(() => mod.readProcesses(failing, 60000));
		const working = async () => "listing";
		assert.equal(await mod.readProcesses(working, 60000), "listing");
		assert.equal(calls, 1);
	});
}

test("ownedProfileOwner is asynchronous and never blocks the event loop", async () => {
	Owner.clearProcessCache();
	let immediateRan = false;
	const pending = Owner.ownedProfileOwner("/tmp/awtsmoos-no-such-profile", {
		executor: async () => {
			await new Promise(resolve => setTimeout(resolve, 40));
			return "";
		}
	});
	assert.ok(pending instanceof Promise);
	setImmediate(() => { immediateRan = true; });
	const result = await pending;
	assert.equal(result, null);
	assert.equal(immediateRan, true);
});

test("root guard list accepts an injected executor instead of spawning", async () => {
	RootGuard.clearProcessCache();
	const chrome = "/Applications/Google Chrome.app/Contents/MacOS/Google Chrome";
	const roots = await RootGuard.list("/tmp/p", {
		executor: async () => `123 ${chrome} --user-data-dir=/tmp/p`
	});
	assert.equal(roots.length, 1);
	assert.equal(roots[0].pid, 123);
});

test("allowSpawn accepts an injected executor instead of spawning", async () => {
	Pressure.clearProcessCache();
	const result = await Pressure.allowSpawn({
		executor: async () => "",
		maxChromeCpu: 100000,
		maxRootCount: 100000,
		maxLoadRatio: 100000
	});
	assert.equal(result.ok, true);
});

test("default executor reads the real process table asynchronously", async () => {
	RootGuard.clearProcessCache();
	const text = await RootGuard.readProcesses();
	assert.equal(typeof text, "string");
});
