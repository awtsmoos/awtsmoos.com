// B"H

import assert from "node:assert/strict";
import test from "node:test";
import { AuthenticatedHostLease } from "./AuthenticatedHostLease.mjs";

test("closeAfterTask closes and verifies the host before the result resolves", async () => {
	let closeCount = 0;
	const host = {
		close: async () => {
			closeCount += 1;
			return { closed: true, verified: true, attempts: 1 };
		}
	};
	const lease = new AuthenticatedHostLease({
		openHost: async () => host,
		healthCheck: async () => true
	});
	const result = await lease.run(async () => {
		return { ok: true, closeCountInsideTask: closeCount };
	}, { closeAfterTask: true });
	assert.equal(result.closeCountInsideTask, 0);
	assert.deepEqual(result.tabClose, {
		closed: true,
		verified: true,
		attempts: 1,
		error: null
	});
	assert.equal(closeCount, 1);
	assert.equal(lease.status().active, false);
	assert.equal(lease.status().closes, 1);
});
