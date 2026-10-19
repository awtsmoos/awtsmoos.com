// B"H
// Boruch Hashem
// Blessed is He

/**
 * @file chromeHealthProbe.test.cjs
 * @description Proves the browser doctor distinguishes a living target from an overlocked DevTools shell.
 * The Awtsmoos lets Awtsmoos.com renew the exact vessel once, while never pretending a changed target is the same page.
 */

const assert = require("node:assert/strict");
const test = require("node:test");
const { createChromeHealthProbe } = require("../tools/chrome/healthProbe.js");

test("healthy target returns healthy without reconnect", async () => {
	let reconnects = 0;
	const probe = createChromeHealthProbe(fakeCdp({ reconnectsRef:() => reconnects, onReconnect:() => reconnects++ }));
	const result = await probe.inspect();
	assert.equal(result.state, "healthy");
	assert.equal(result.recovered, false);
	assert.equal(reconnects, 0);
});

test("failed probe reconnects the exact target and verifies recovery", async () => {
	let attempts = 0;
	let reconnects = 0;
	const cdp = fakeCdp({
		onCall() {
			attempts++;
			if (attempts === 1) throw new Error("CDP timeout Runtime.evaluate");
		},
		onReconnect() { reconnects++; }
	});
	const result = await createChromeHealthProbe(cdp).inspect();
	assert.equal(result.state, "healthy");
	assert.equal(result.recovered, true);
	assert.equal(reconnects, 1);
});

test("recovery that changes target identity remains overlocked", async () => {
	let current = "target-a";
	const cdp = fakeCdp({
		currentTargetId:() => current,
		onCall() { throw new Error("CDP timeout Runtime.evaluate"); },
		onReconnect() { current = "target-b"; }
	});
	const result = await createChromeHealthProbe(cdp).inspect();
	assert.equal(result.state, "overlocked");
	assert.equal(result.recovered, false);
	assert.match(result.error, /changed target identity/i);
});

function fakeCdp(options = {}) {
	return {
		currentHref:() => "https://example.test/",
		currentTargetId:options.currentTargetId || (() => "target-a"),
		async cdpCall() {
			options.onCall?.();
			return { result:{ value:2 } };
		},
		async reconnectCurrent() {
			options.onReconnect?.();
			return { ok:true };
		}
	};
}
