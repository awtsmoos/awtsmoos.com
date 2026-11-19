// B"H — The Awtsmoos lets many seekers read yet never grants owner powers.
"use strict";
const test = require("node:test");
const assert = require("node:assert/strict");
const Tool = require("./publicReadTool.js");
const Rate = require("./httpRateLimit.js");
const Transport = require("./httpTransport.js");
const { performance } = require("node:perf_hooks");

/** Prove ten thousand simultaneous calls cannot exhaust the owner quota. */
test("10,000 concurrent guest reads honor per-account 12/min budgets", async () => {
	const original = Transport.send;
	Rate.resetForTests();
	let contacted = 0;
	Transport.send = async () => {
		contacted += 1;
		return { ok: true, statusCode: 200, body: { reading: "public" } };
	};
	try {
		const start = performance.now();
		const requests = Array.from({ length: 10000 }, (_, index) => Tool.request(
			{}, { accountId: `stress-${Math.floor(index / 100)}`, scopes: ["tunnel.read"] },
			{ action: "heichel", heichel: "ikar" }
		));
		const results = await Promise.all(requests);
		const elapsed = Math.round(performance.now() - start);
		assert.equal(results.length, 10000);
		assert.equal(results.filter(item => item.ok).length, 1200);
		assert.equal(results.filter(item => item.statusCode === 429).length, 8800);
		assert.equal(contacted, 1200);
		console.log("STRESS_10000_1200_ADMITTED_8800_DENIED_MS", elapsed);
	} finally {
		Transport.send = original;
	}
});

/** Validate a thousand hostile guest actions without contacting the network. */
test("1,000 index/mail/mutation probes fail before HTTPS transport", async () => {
	const original = Transport.send;
	Rate.resetForTests();
	let contacted = 0;
	Transport.send = async () => { contacted += 1; return { ok: true }; };
	try {
		const attempts = await Promise.all(Array.from({ length: 1000 }, (_, index) => {
			const action = ["index", "mail.send", "posts.create", "filesystem.read"][index % 4];
			return Tool.request({}, { accountId: `guest-${index}`, scopes: ["tunnel.read"] },
				{ action, question: "Overwrite the server" });
		}));
		assert.ok(attempts.every(result => result.statusCode === 400));
		assert.equal(contacted, 0);
		console.log("NEGATIVE_1000_NO_NETWORK=PASS");
	} finally {
		Transport.send = original;
	}
});
