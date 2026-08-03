// B"H

import { GlobalWebsiteTurnQueue } from "./GlobalWebsiteTurnQueue.mjs";

/**
 * A real child-process contender proving the close timestamp is shared across
 * process boundaries. Release simulates verified tab disappearance.
 */
const [rootPath, intervalText, agentId] = process.argv.slice(2);
const queue = new GlobalWebsiteTurnQueue({
	rootPath,
	minimumIntervalMs: Number(intervalText),
	enforceMinimumInterval: false,
	pollMs: 5,
	acquisitionTimeoutMs: 5000
});
const lease = await queue.acquire({ logicalAgentId: agentId });
process.send?.({ type: "acquired", at: Date.now(), view: lease.view });
process.on("message", async message => {
	if (message?.type !== "release") return;
	const closedAt = Date.now();
	await lease.release({ startCooldown: true, closedAt });
	process.send?.({ type: "released", at: Date.now(), closedAt });
	process.exit(0);
});
