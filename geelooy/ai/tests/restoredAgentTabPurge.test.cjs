// B"H
// Boruch Hashem
// Blessed is He

const assert = require("node:assert/strict");
const test = require("node:test");
const { isAgentTarget } = require("../relay/split-browser/restoredAgentTabCatalog.cjs");
const { purgeRestoredAgentTabs, guardRestoredAgentTabs } = require("../relay/split-browser/restoredAgentTabPurge.cjs");

const AGENT = "https://chatgpt.com/g/g-6a03feea8398819192067ae3dbfa449c-awtsmoos-shliach-agent";

test("catalog matches only configured agent pages", () => {
	assert.equal(isAgentTarget({ type: "page", url: AGENT }, AGENT), true);
	assert.equal(isAgentTarget({ type: "page", url: `${AGENT}/c/one` }, AGENT), true);
	assert.equal(isAgentTarget({ type: "page", url: "https://chatgpt.com/" }, AGENT), false);
	assert.equal(isAgentTarget({ type: "page", url: "https://example.com/" }, AGENT), false);
	assert.equal(isAgentTarget({ type: "service_worker", url: AGENT }, AGENT), false);
});

test("purge closes every restored target and verifies zero", async () => {
	let targets = Array.from({ length: 87 }, (_, index) => ({ id: `tab-${index}` }));
	const result = await purgeRestoredAgentTabs({
		ports: [9224],
		port: 9224,
		sleep: async () => undefined,
		catalog: {
			list: async () => targets,
			close: async (_port, id) => { targets = targets.filter(target => target.id !== id); }
		}
	});
	assert.equal(result.ok, true);
	assert.equal(result.before, 87);
	assert.equal(result.closed, 87);
	assert.equal(result.remaining, 0);
});

test("resisting targets terminate only their dedicated debug port", async () => {
	let terminated = null;
	let alive = true;
	const result = await purgeRestoredAgentTabs({
		ports: [9224],
		port: 9224,
		attempts: 3,
		terminateOnResistance: true,
		sleep: async () => undefined,
		closeProcesses: async port => { terminated = port; alive = false; },
		catalog: {
			list: async () => alive ? [{ id: "resistant" }] : [],
			close: async () => undefined
		}
	});
	assert.equal(result.ok, true);
	assert.equal(terminated, 9224);
	assert.equal(result.remaining, 0);
});

test("startup guard catches tabs that appear after an initially clean sample", async () => {
	let now = 0;
	let scans = 0;
	let targets = [];
	const result = await guardRestoredAgentTabs({
		ports: [9224],
		port: 9224,
		durationMs: 1000,
		intervalMs: 100,
		now: () => now,
		sleep: async milliseconds => { now += milliseconds; },
		catalog: {
			list: async () => {
				scans += 1;
				if (scans === 2) targets = [{ id: "late-one" }, { id: "late-two" }];
				return targets;
			},
			close: async (_port, id) => { targets = targets.filter(target => target.id !== id); }
		}
	});
	assert.equal(result.ok, true);
	assert.equal(result.closed, 2);
	assert.deepEqual(targets, []);
});
