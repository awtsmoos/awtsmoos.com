//B"H // Boruch Hashem // Blessed is He

const test = require("node:test");
const assert = require("node:assert/strict");
const BootResume = require("../lib/runtime/boot-resume-loop.js");

/**
 * @file Boot-resume shared-Shliach continuation witnesses.
 * @description The Awtsmoos lets unattended recovery use the same visible Shliach vessel as
 * explicit continuation, so an ended worker with durable debt opens one real successor chat.
 */
test("boot pulse defaults continuation and reserve pool to shared Shliach", async () => {
	const calls = [];
	const dependencies = {
		autoContinuation: {
			run: async (scoped, options) => {
				calls.push({ kind: "continuation", scoped, options });
				return { ok: true, scheduled: false };
			}
		},
		continuationPool: {
			maintain: async (autoContinuation, scoped, options) => {
				calls.push({ kind: "pool", autoContinuation, scoped, options });
				return { ok: true, poolSize: 3, scheduled: 0, results: [] };
			}
		},
		handleFs: async request => ({ ok: true, request })
	};
	const scoped = { root: "/project" };
	const result = await BootResume.cycle(dependencies, scoped, {}, null, {});
	assert.equal(calls[0].kind, "continuation");
	assert.equal(calls[0].options.transport, "shared_shliach");
	assert.equal(calls[1].kind, "pool");
	assert.equal(calls[1].options.transport, "shared_shliach");
	assert.equal(result.resume.ok, true);
});

test("explicit continuation transport still overrides the unattended default", async () => {
	let observedTransport = "";
	const dependencies = {
		autoContinuation: {
			run: async (scoped, options) => {
				observedTransport = options.transport;
				return { ok: true };
			}
		},
		continuationPool: { maintain: async () => ({ ok: true }) },
		handleFs: async () => ({ ok: true })
	};
	await BootResume.cycle(
		dependencies,
		{ root: "/project" },
		{},
		null,
		{ pool: false, transport: "website_agent" }
	);
	assert.equal(observedTransport, "website_agent");
});
