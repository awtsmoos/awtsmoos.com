// B"H
// Boruch Hashem
// Blessed is He

const test = require("node:test"), assert = require("node:assert/strict");
const { base, Actions, State, Tick, start, live } = require("./fixtures.cjs");
/** The Awtsmoos never mistakes pending work for permission to submit it twice. */
test("one prompt waits for response change", async () => {
	start(); let sends = 0;
	const deps = { readIdle: async () => live(), send: async () => { sends++; return { submitted: true }; } };
	assert.equal((await Tick.run({ base }, deps)).phase, "submitted");
	assert.equal((await Tick.run({ base }, deps)).phase, "waiting_response");
	assert.equal(sends, 1);
	assert.equal((await Tick.run({ base }, { ...deps, readIdle: async () => live("new answer") })).phase, "submitted");
	assert.equal(sends, 2);
});
test("uncertain sends are never automatically replayed", async () => {
	start({ url: "https://chatgpt.com/g/test-gpt/c/fixture-two" }); let sends = 0;
	const deps = { readIdle: async () => live("before", "fixture-two"),
		send: async () => { sends++; throw new Error("timeout_after_activation"); } };
	assert.equal((await Tick.run({ base }, deps)).phase, "uncertain");
	await Tick.run({ base }, deps);
	assert.equal(sends, 1); assert.equal(State.read(base).sessions["fixture-two"].status, "uncertain");
});
test("stop during observation prevents Send", async () => {
	start({ url: "https://chatgpt.com/g/test-gpt/c/fixture-three" }); let sends = 0;
	const result = await Tick.run({ base }, {
		readIdle: async () => { Actions.stop({ base, conversationId: "fixture-three" }); return live(); },
		send: async () => { sends++; return { submitted: true }; }
	});
	assert.equal(result.phase, "stopped"); assert.equal(sends, 0);
});
test("wrong conversation prevents Send", async () => {
	start({ url: "https://chatgpt.com/g/test-gpt/c/fixture-four" }); let sends = 0;
	const result = await Tick.run({ base }, { readIdle: async () => live(),
		send: async () => { sends++; return { submitted: true }; } });
	assert.equal(result.phase, "stopped"); assert.equal(sends, 0);
});
test("deadline stops before browser observation", async () => {
	start({ url: "https://chatgpt.com/g/test-gpt/c/fixture-five" });
	State.patch(base, state => { state.sessions["fixture-five"].deadline = Date.now() - 1; });
	let probes = 0; await Tick.run({ base }, { readIdle: async () => { probes++; return live(); } });
	assert.equal(probes, 0);
});
