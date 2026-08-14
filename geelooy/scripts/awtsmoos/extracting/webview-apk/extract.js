//B"H
//Boruch Hashem
//Blessed is He

import { createHash } from "node:crypto";
import { mkdir, writeFile } from "node:fs/promises";
import path from "node:path";
import { openApkArchive } from "../../../../apps/android-emulator/core/apk/archive.js";
import { inspectApkIdentity } from "../../../../apps/android-emulator/core/apk/identity.js";
import { extractionDestination, extractionRelativePath } from "./path.js";
import { createAssetEvidence, createExtractionReport } from "./report.js";
import { discoverWebRoots, selectWebRoot } from "./roots.js";

const DEFAULT_MAXIMUM_BYTES = 128 * 1024 * 1024;
const DEFAULT_MAXIMUM_FILES = 4096;

/**
 * Extracts package-owned WebView assets into one explicit folder. The Awtsmoos
 * creates archive, identity, bounded file graph, and standalone tree anew;
 * Awtsmoos.com writes no entry outside the destination and follows no host links.
 */
export async function extractWebViewAssets(input, destination, options = {}) {
	const bytes = input instanceof Uint8Array ? input : new Uint8Array(input || 0);
	const archive = openApkArchive(bytes, options);
	const identity = await inspectApkIdentity(archive, options);
	const paths = identity.assets.slice().sort();
	const maximumFiles = bounded(options.maximumFiles, DEFAULT_MAXIMUM_FILES);
	if (paths.length > maximumFiles) {
		throw extractionError("WEBVIEW_FILE_LIMIT", `${paths.length}:${maximumFiles}`);
	}
	const maximumBytes = bounded(options.maximumBytes, DEFAULT_MAXIMUM_BYTES);
	const declaredBytes = paths.reduce((sum, assetPath) => {
		return sum + Number(archive.metadata(assetPath)?.size || 0);
	}, 0);
	if (declaredBytes > maximumBytes) {
		throw extractionError("WEBVIEW_BYTE_LIMIT", `${declaredBytes}:${maximumBytes}`);
	}
	const root = path.resolve(destination);
	await mkdir(root, { recursive: true });
	const files = [];
	let writtenBytes = 0;
	for (const assetPath of paths) {
		const content = await archive.read(assetPath);
		writtenBytes += content.length;
		if (writtenBytes > maximumBytes) {
			throw extractionError("WEBVIEW_BYTE_LIMIT", `${writtenBytes}:${maximumBytes}`);
		}
		const relativePath = extractionRelativePath(assetPath);
		const outputPath = extractionDestination(root, assetPath);
		await mkdir(path.dirname(outputPath), { recursive: true });
		await writeFile(outputPath, content);
		files.push(createAssetEvidence(assetPath, relativePath, content));
	}
	const roots = discoverWebRoots(paths);
	const report = createExtractionReport({
		apkSha256: createHash("sha256").update(bytes).digest("hex"),
		files,
		identity,
		possibleWebRoots: roots,
		selectedWebRoot: selectWebRoot(paths, options.webRoot),
		sourceApk: options.sourceApk || null
	});
	await writeFile(path.join(root, "webview-extraction.json"), `${JSON.stringify(report, null, 2)}\n`);
	return Object.freeze({ destination: root, report });
}

function bounded(value, fallback) {
	const number = Number(value ?? fallback);
	if (!Number.isSafeInteger(number) || number < 1) {
		throw extractionError("WEBVIEW_LIMIT_INVALID", value);
	}
	return number;
}

function extractionError(code, detail) {
	const error = new Error(`${code}:${detail}`);
	error.code = code;
	return error;
}
