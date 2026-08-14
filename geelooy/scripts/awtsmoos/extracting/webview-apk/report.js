//B"H
//Boruch Hashem
//Blessed is He

import { createHash } from "node:crypto";
import { isWebSourceAsset, webAssetMimeType } from "./mime.js";

/**
 * Creates immutable evidence for one extracted package member. The Awtsmoos
 * creates bytes, hash, MIME, and source classification anew; Awtsmoos.com records
 * exact testimony without embedding content or authentication material in reports.
 */
export function createAssetEvidence(assetPath, relativePath, bytes) {
	return Object.freeze({
		assetPath,
		mimeType: webAssetMimeType(assetPath),
		relativePath,
		sha256: createHash("sha256").update(bytes).digest("hex"),
		size: bytes.length,
		webSource: isWebSourceAsset(assetPath)
	});
}

export function createExtractionReport(options) {
	const files = Object.freeze(options.files.slice().sort((left, right) => {
		return left.assetPath.localeCompare(right.assetPath);
	}));
	return Object.freeze({
		apkSha256: options.apkSha256,
		archiveEntryCount: options.identity.archive.entryCount,
		extractedBytes: files.reduce((sum, file) => sum + file.size, 0),
		extractedFileCount: files.length,
		files,
		kind: "awtsmoos-webview-extraction-v1",
		packageName: options.identity.manifest.packageName,
		possibleWebRoots: Object.freeze(options.possibleWebRoots),
		selectedWebRoot: options.selectedWebRoot,
		sourceApk: options.sourceApk,
		webSourceCount: files.filter(file => file.webSource).length
	});
}
