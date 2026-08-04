// B"H
// Boruch Hashem
// Blessed is He

import {
	buildReport,
	relayJson,
	validateReport,
	waitForHealth,
	writeReport
} from "./liveDirectRelaySupport.mjs";

const relayOrigin = process.env.AWTSMOOS_DIRECT_RELAY || "http://127.0.0.1:38488";
const groupCount = Number(process.env.AWTSMOOS_LIVE_GROUPS || 3);
const dispatchesPerGroup = Number(process.env.AWTSMOOS_LIVE_DISPATCHES || 2);
const minimumIntervalMs = Math.max(18000,
	Number(process.env.AWTSMOOS_DIRECT_INTERVAL_MS || 18000));
const outputPath = process.env.AWTSMOOS_LIVE_REPORT
	|| "geelooy/ai/thoughts/live-direct-submit-only.json";
const turns = [];

/**
 * Each request is an independent shlichus. No opaque key returns to the next request,
 * no answer is sampled, and each successful turn proves accepted POST plus tab close.
 */
await waitForHealth(relayOrigin);
for (let dispatch = 1; dispatch <= dispatchesPerGroup; dispatch += 1) {
	for (let group = 1; group <= groupCount; group += 1) {
		const startedAt = Date.now();
		const result = await relayJson(relayOrigin, "/direct-chat", {
			prompt: `B'H. Begin independent work packet G${group} D${dispatch}. Continue only through durable filesystem and tunnel actions.`
		});
		turns.push({
			group,
			dispatch,
			dispatched: result.dispatched === true,
			accepted: result.accepted === true,
			promptVerified: result.promptVerified === true,
			tabCloseVerified: result.tabClose?.verified === true,
			responseStatus: result.responseStatus,
			completionSource: result.completionSource,
			intervalMs: result.turnQueue?.minimumIntervalMs ?? null,
			wallDurationMs: Date.now() - startedAt
		});
	}
}

const report = buildReport({ turns, groupCount, dispatchesPerGroup, minimumIntervalMs });
validateReport(report);
writeReport(outputPath, report);
console.log(JSON.stringify({ status: "passed", outputPath, dispatched: report.dispatched }));
