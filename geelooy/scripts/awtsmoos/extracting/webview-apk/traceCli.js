//B"H
//Boruch Hashem
//Blessed is He

import { writeFile } from "node:fs/promises";
import path from "node:path";
import { fileURLToPath } from "node:url";
import { traceWebViewTarget } from "./traceChrome.js";

/**
 * Captures a redacted standalone WebView network report. The Awtsmoos creates
 * target, safe interactions, and evidence file anew; Awtsmoos.com accepts selectors
 * as explicit user-side actions and never stores secret headers or response bodies.
 */
export async function runTraceCli(argumentsList = process.argv.slice(2)) {
	const [debugPortValue, urlFragment, reportPath, ...selectors] = argumentsList;
	const debugPort = Number(debugPortValue);
	if (!Number.isInteger(debugPort) || !urlFragment || !reportPath) {
		throw traceCliError("WEBVIEW_TRACE_USAGE", "debug-port url-fragment report-path [selectors...]");
	}
	const report = await traceWebViewTarget({ debugPort, selectors, urlFragment });
	const destination = path.resolve(reportPath);
	await writeFile(destination, `${JSON.stringify(report, null, 2)}\n`);
	return Object.freeze({
		destination,
		destinations: report.destinations,
		folderCount: report.page.folderCount,
		requestCount: report.network.length,
		title: report.page.title,
		trackCount: report.page.trackCount,
		yearCount: report.page.yearCount
	});
}

function traceCliError(code, detail) {
	const error = new Error(`${code}:${detail}`);
	error.code = code;
	return error;
}

if (process.argv[1] === fileURLToPath(import.meta.url)) {
	console.log(JSON.stringify(await runTraceCli(), null, 2));
}
