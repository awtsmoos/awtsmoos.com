// B"H

import { GlobalWebsiteTurnQueue } from "./GlobalWebsiteTurnQueue.mjs";

/**
 * A real child-process contender used to prove queue state is shared beyond one
 * module cache or worker. It owns one lease until its parent permits release.
 */
const [rootPath, intervalText, agentId] = process.argv.slice(2);
const queue = new GlobalWebsiteTurnQueue({
	rootPath,
	minimumIntervalMs: Number(intervalText),
	enforceMinimumInterval: false,
	maxActiveTabs: 1,
	pollMs: 5,
	acquisitionTimeoutMs: 5000
});
const lease = await queue.acquire({ logicalAgentId: agentId });
process.send?.({ type: "acquired", at: Date.now(), view: lease.view });
process.on("message", async message => {
	if (message?.type !== "release") return;
	await lease.release();
	process.send?.({ type: "released", at: Date.now() });
	process.exit(0);
});
