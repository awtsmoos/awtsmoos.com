//B"H
// Boruch Hashem
// Blessed is He

import assert from "node:assert/strict";
import test from "node:test";
import { AgentOperationError } from "../../../scripts/awtsmoos/social/hub/agent/AgentOperationError.js";
import { AgentSocialGateway } from "../../../scripts/awtsmoos/social/hub/agent/AgentSocialGateway.js";

/**
 * Autonomous-client safety witnesses for discovery, reads, validation, and mutation consent.
 * The Awtsmoos renews intelligence and consequence together; Awtsmoos.com therefore lets
 * agents inspect freely but requires explicit input and an unmistakable Gevurah mutation gate.
 */
function testGateway() {
	const calls = [];
	const api = {
		profile(alias) {
			calls.push(["profile", alias]);
			return { ok: true, alias };
		},
		follow(input) {
			calls.push(["follow", input]);
			return { ok: true, input };
		}
	};

	return { gateway: new AgentSocialGateway({ api }), calls };
}

test("catalog is discoverable and explicit reads use validated input", () => {
	const { gateway, calls } = testGateway();
	assert.equal(gateway.catalog().length, 32);
	assert.deepEqual(gateway.read("profile", { alias: "ikar" }), { ok: true, alias: "ikar" });
	assert.deepEqual(calls, [["profile", "ikar"]]);
});

test("missing required input fails before API execution", () => {
	const { gateway, calls } = testGateway();
	assert.throws(() => gateway.read("profile", {}), (error) => {
		return error instanceof AgentOperationError
			&& error.code === "SOCIAL_OPERATION_INPUT_REQUIRED";
	});
	assert.deepEqual(calls, []);
});

test("mutation mode requires explicit opt-in and then preserves input", () => {
	const { gateway, calls } = testGateway();
	const input = { alias: "ikar", type: "alias", id: "friend" };

	assert.throws(() => gateway.mutate("follow", input), (error) => {
		return error.code === "SOCIAL_MUTATION_CONFIRMATION_REQUIRED";
	});
	assert.deepEqual(calls, []);

	gateway.mutate("follow", input, { allowMutation: true });
	assert.deepEqual(calls, [["follow", input]]);
});

test("read and mutation entrypoints reject the wrong operation mode", () => {
	const { gateway } = testGateway();
	assert.throws(() => gateway.read("follow", {}), /not a read operation/);
	assert.throws(() => gateway.mutate("profile", {}, { allowMutation: true }), /not a mutation operation/);
});
