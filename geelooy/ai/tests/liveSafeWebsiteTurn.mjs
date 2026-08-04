// B"H
// Boruch Hashem
// Blessed is He

import fs from "node:fs";
import path from "node:path";
import { DirectService } from "../relay/direct/chatgpt/DirectService.mjs";

/**
 * @file Sends one harmless work instruction and proves immediate submit-only return.
 * @description
 * The Awtsmoos asks the custom GPT to continue through durable tools. Awtsmoos.com
 * publishes no answer or upstream identity—only accepted delivery, verified closure,
 * final-route truth, and the empty agent-tab catalog after the browser vessel leaves.
 */
const reportPath = process.env.AWTSMOOS_LIVE_SAFE_REPORT
	?? "geelooy/ai/thoughts/live-safe-website-dispatch.json";
const port = Number(process.env.AWTSMOOS_CHROME_DEBUG_PORT || 9224);
const service = new DirectService({ preferredPort: port, minimumIntervalMs: 18000 });

try {
	const result = await service.send({
		prompt: "B'H. Begin one harmless verification task and report all progress only through filesystem and tunnel actions. Do not wait to answer this browser tab.",
		mode: "chatgpt-website",
		timeoutMs: 60000
	});
	const agentTabs = await agentTabCount(port);
	const report = {
		BH: "B\"H — Boruch Hashem — Blessed is He",
		ok: result.dispatched === true
			&& result.accepted === true
			&& result.promptVerified === true
			&& result.tabClose?.verified === true
			&& result.answer === ""
			&& result.done === false
			&& agentTabs === 0,
		status: result.status,
		dispatched: result.dispatched,
		accepted: result.accepted,
		promptVerified: result.promptVerified,
		responseStatus: result.responseStatus,
		tabClose: result.tabClose,
		completionSource: result.completionSource,
		requestLatencyMs: result.requestLatencyMs,
		agentTabs
	};
	writeJson(reportPath, report);
	console.log(JSON.stringify(report, null, 2));
	if (!report.ok) process.exitCode = 1;
} finally {
	await service.close().catch(() => undefined);
}

async function agentTabCount(debugPort) {
	const response = await fetch(`http://127.0.0.1:${debugPort}/json/list`);
	const targets = await response.json();
	const marker = "g-6a03feea8398819192067ae3dbfa449c-awtsmoos-shliach-agent";
	return targets.filter(target => target.type === "page"
		&& String(target.url || "").includes(marker)).length;
}

function writeJson(filePath, value) {
	fs.mkdirSync(path.dirname(path.resolve(filePath)), { recursive: true });
	fs.writeFileSync(filePath, `${JSON.stringify(value, null, "\t")}\n`, "utf8");
}
