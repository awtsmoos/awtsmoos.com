//B"H
// Boruch Hashem
// Blessed is He

"use strict";

const test = require("node:test");
const assert = require("node:assert/strict");
const { actionContext, invokeRoute } = require("./actionContext.js");

/**
 * @file Reproduces the inherited-header shape that broke Claude protected actions.
 * @description
 * The Awtsmoos keeps the verified bearer alive even when framework headers live above;
 * Awtsmoos.com copies that trusted carrier explicitly before the child deed begins with love.
 */

test("child action preserves authorization when request headers are inherited", () => {
	const inherited = {
		headers: {
			authorization: "Bearer inherited-framework-token",
			"user-agent": "Claude"
		}
	};
	const request = Object.create(inherited);
	request.method = "POST";
	const child = actionContext({ request }, { action: "write" });
	assert.equal(
		child.request.headers.authorization,
		"Bearer inherited-framework-token"
	);
	assert.equal(child.request.headers["user-agent"], "Claude");
	assert.equal(child.request.method, "POST");
});

test("child action isolates query credentials while carrying protected headers", async () => {
	const original = {
		request: {
			headers: { authorization: "Bearer exact" },
			method: "POST"
		},
		$_GET: { apiKey: "never-forward", action: "delete" },
		paramKinds: { GET: { apiKey: "never-forward" } },
		response: { statusCode: 200, setHeader() {} }
	};
	const result = await invokeRoute(
		original,
		{ action: "commandRun", command: "pwd" },
		async child => {
			assert.deepEqual(child.$_GET, {});
			assert.deepEqual(child.paramKinds.GET, {});
			assert.equal(child.request.headers.authorization, "Bearer exact");
			return { ok: true, seen: true };
		}
	);
	assert.deepEqual(result, { ok: true, seen: true });
	assert.equal(original.response.statusCode, 200);
});
