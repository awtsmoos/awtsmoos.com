//B"H
// Boruch Hashem
// Blessed is He

import assert from "node:assert/strict";
import test from "node:test";
import { RequestOnlySentinelSdkClient } from "../relay/direct/chatgpt/RequestOnlySentinelSdkClient.mjs";

/** Public SDK metadata returns without exposing challenge values to capability output. */
test("Sentinel SDK client preserves safe session-observer metadata", async () => {
	const calls = [];
	const client = {
		async send(method, params, timeoutMs) {
			calls.push({ method, params, timeoutMs });
			return {
				result: {
					value: {
						token: "internal-sdk-token",
						timing: null,
						methodNames: ["init", "sessionObserverToken", "token"],
						hasInit: true,
						hasToken: true,
						hasTiming: false,
						sessionObserver: {
							available: true,
							usable: false,
							resultType: "object",
							resultKeys: []
						}
					}
				}
			};
		}
	};
	const result = await new RequestOnlySentinelSdkClient(client).createToken();
	assert.equal(result.sessionObserver.available, true);
	assert.equal(result.sessionObserver.usable, false);
	assert.equal(calls.length, 1);
	assert.equal(calls[0].method, "Runtime.evaluate");
	assert.match(calls[0].params.expression, /sessionObserverToken/);
});
