// B"H
// Boruch Hashem
// Blessed is He

import fs from "node:fs";
import { DirectService } from "../relay/direct/chatgpt/DirectService.mjs";

const port = Number(process.env.AWTSMOOS_CHROME_DEBUG_PORT || 9224);
const minimumIntervalMs = Math.max(18000,
	Number(process.env.AWTSMOOS_DIRECT_INTERVAL_MS || 18000));
const outputPath = "geelooy/ai/thoughts/live-careful-submit-only-2x2.json";
const service = new DirectService({ preferredPort: port, minimumIntervalMs });
const records = [];
const starts = [];

try {
	for (let dispatch = 1; dispatch <= 2; dispatch += 1) {
		for (let group = 1; group <= 2; group += 1) {
			starts.push(Date.now());
			const result = await service.send({
				prompt: `B'H. Begin independent careful work C${group} D${dispatch}; report progress only through durable tools.`,
				mode: "chatgpt-website",
				timeoutMs: 60000
			});
			assert(result.status === 202, "Dispatch status was not 202.");
			assert(result.dispatched === true, "Prompt was not dispatched.");
			assert(result.accepted === true, "Prompt POST was not accepted.");
			assert(result.promptVerified === true, "Prompt was not verified.");
			assert(result.tabClose?.verified === true, "Tab close was not verified.");
			assert(result.answer === "" && result.done === false,
				"Transport unexpectedly waited for a response.");
			records.push({
				group,
				dispatch,
				responseStatus: result.responseStatus,
				completionSource: result.completionSource,
				requestLatencyMs: result.requestLatencyMs,
				tabCloseVerified: result.tabClose.verified
			});
		}
	}
	const gaps = starts.slice(1).map((time, index) => time - starts[index]);
	assert(gaps.every(value => value >= minimumIntervalMs), "Dispatch starts were too close.");
	const agentTabs = await countAgentTabs();
	assert(agentTabs === 0, "An Awtsmoos agent tab remained open.");
	const report = {
		BH: "B\"H — Boruch Hashem — Blessed is He",
		verifiedAt: new Date().toISOString(),
		mode: "chatgpt-website-submit-only",
		totalDispatches: records.length,
		minimumIntervalMs,
		minimumObservedStartGapMs: Math.min(...gaps),
		agentTabs,
		records
	};
	fs.mkdirSync("geelooy/ai/thoughts", { recursive: true });
	fs.writeFileSync(outputPath, `${JSON.stringify(report, null, "\t")}\n`);
	console.log(JSON.stringify({ status: "passed", outputPath, ...report }, null, 2));
} finally {
	await service.close().catch(() => undefined);
}

async function countAgentTabs() {
	const response = await fetch(`http://127.0.0.1:${port}/json/list`);
	const targets = await response.json();
	const marker = "g-6a03feea8398819192067ae3dbfa449c-awtsmoos-shliach-agent";
	return targets.filter(target => target.type === "page"
		&& String(target.url || "").includes(marker)).length;
}

function assert(condition, message) {
	if (!condition) throw new Error(message);
}
