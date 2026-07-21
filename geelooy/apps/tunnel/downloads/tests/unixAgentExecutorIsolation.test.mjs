// B"H

import assert from "node:assert/strict";
import { createRequire } from "node:module";

process.env.AWTSMOOS_FS_EXECUTOR_TEST_MODE = "1";
process.env.AWTSMOOS_FS_EXECUTOR_WORKERS = "2";
process.env.AWTSMOOS_FS_EXECUTOR_IDLE_MS = "1000";

const require = createRequire(import.meta.url);
const Executor = require("../../agent/tools/fs/executor/index.js");

Executor.warm();
await waitFor(() => Executor.stats().ready === 2, 15000);

let maximumTimerLagMs = 0;
let previousTick = Date.now();
const pulse = setInterval(() => {
	const now = Date.now();
	maximumTimerLagMs = Math.max(maximumTimerLagMs, now - previousTick - 10);
	previousTick = now;
}, 10);

const longAction = Executor.execute({
	action: "executorTestBlock",
	blockMs: 900,
	logicalAgentId: "slow-agent"
});
await new Promise(resolve => setTimeout(resolve, 50));
const quickStartedAt = Date.now();
await Executor.execute({
	action: "executorTestBlock",
	blockMs: 5,
	logicalAgentId: "quick-agent"
});
assert.ok(Date.now() - quickStartedAt < 750, "slow requester blocked another agent");

const completions = await Promise.all(Array.from({ length: 20 }, (_, index) => {
	return Executor.execute({
		action: "executorTestBlock",
		blockMs: 30 + index,
		logicalAgentId: `concurrent-agent-${index}`
	});
}));
await longAction;
clearInterval(pulse);
Executor.shutdown();

assert.equal(completions.length, 20);
assert.ok(completions.every(result => result.ok));
assert.ok(maximumTimerLagMs < 150, `broker pulse lagged ${maximumTimerLagMs}ms`);
console.log("unix agent executor isolation and 20-agent stress passed");

async function waitFor(predicate, timeoutMs) {
	const deadline = Date.now() + timeoutMs;
	while (Date.now() < deadline) {
		if (predicate()) return true;
		await new Promise(resolve => setTimeout(resolve, 25));
	}
	throw new Error(`executor_warm_timeout:${timeoutMs}`);
}
