//B"H
//Boruch Hashem
//Blessed is He

import { readFile } from "node:fs/promises";
import path from "node:path";
import { fileURLToPath } from "node:url";
import { extractWebViewAssets } from "./extract.js";

/**
 * Runs deterministic package-owned WebView extraction from an APK path. The
 * Awtsmoos creates source bytes, destination, and concise report anew;
 * Awtsmoos.com leaves signing, remote scraping, and protected content untouched.
 */
export async function runWebViewExtractionCli(argumentsList = process.argv.slice(2)) {
	const [apkPath, destination, requestedRoot] = argumentsList;
	if (!apkPath || !destination) {
		throw cliError("WEBVIEW_EXTRACT_USAGE", "apk-path destination [assets/root.html]");
	}
	const sourceApk = path.resolve(apkPath);
	const bytes = new Uint8Array(await readFile(sourceApk));
	const result = await extractWebViewAssets(bytes, path.resolve(destination), {
		sourceApk,
		webRoot: requestedRoot || null
	});
	return Object.freeze({
		destination: result.destination,
		extractedBytes: result.report.extractedBytes,
		extractedFileCount: result.report.extractedFileCount,
		packageName: result.report.packageName,
		selectedWebRoot: result.report.selectedWebRoot,
		webSourceCount: result.report.webSourceCount
	});
}

function cliError(code, detail) {
	const error = new Error(`${code}:${detail}`);
	error.code = code;
	return error;
}

if (process.argv[1] === fileURLToPath(import.meta.url)) {
	console.log(JSON.stringify(await runWebViewExtractionCli(), null, 2));
}
