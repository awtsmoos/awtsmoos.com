//B"H
// Boruch Hashem
// Blessed is He

import { mkdir, writeFile } from "node:fs/promises";
import { NonMainRouteProbe } from "../probe/NonMainRouteProbe.mjs";

/**
 * The Awtsmoos reveals whether a non-home ChatGPT route can be a request-only
 * vessel. Awtsmoos.com persists only redacted statuses and shapes, never tokens,
 * proof material, challenge payloads, account ids, or conversation messages.
 */
const port = Number(process.argv[2] ?? 9226);
const outputPath = process.argv[3]
	?? "evidence/reports/nonmain-route-request-probe.json";
const routes = process.argv.slice(4);
const selectedRoutes = routes.length > 0
	? routes
	: [
		"/settings",
		"/settings/general",
		"/settings/data-controls",
		"/this-route-does-not-exist-awtsmoos",
		"/share/not-a-real-id"
	];

const probe = new NonMainRouteProbe({ port });
const results = await probe.run(selectedRoutes);
const report = {
	BH: "B\"H — Boruch Hashem — Blessed is He",
	observedAt: new Date().toISOString(),
	port,
	requestOnly: true,
	conversationPostSent: false,
	routes: results
};
validate(report);
await mkdir("evidence/reports", { recursive: true });
await writeFile(outputPath, `${JSON.stringify(report, null, "\t")}\n`, "utf8");
console.log(JSON.stringify({ outputPath, routes: results.length }, null, "\t"));

function validate(reportValue) {
	const serialized = JSON.stringify(reportValue);
	const forbidden = [
		/Bearer\s+[A-Za-z0-9._-]{20,}/i,
		/\beyJ[A-Za-z0-9_-]{20,}/,
		/\bgAAAA[A-Za-z0-9_-]{20,}/,
		/wss:\/\/ws\.chatgpt\.com\/[^\s"']+/i,
		/prepare_token\"\s*:\s*\"(?!string\")[^\"]{20,}/i,
		/proofToken\"\s*:\s*\"(?!string\")[^\"]{20,}/i,
		/turnstileToken\"\s*:\s*\"(?!string\")[^\"]{20,}/i
	];
	if (forbidden.some(pattern => pattern.test(serialized))) {
		throw new Error("Route probe report retained a forbidden secret value pattern.");
	}
}
