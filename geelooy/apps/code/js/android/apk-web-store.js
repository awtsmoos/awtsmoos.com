//B"H
//Boruch Hashem
//Blessed is He

import { hasApkInternetPermission } from "./apk-web-fetch-protocol.js";
import {
	APK_WEB_MAXIMUM_ASSETS,
	APK_WEB_MAXIMUM_BYTES,
	apkWebValueError,
	normalizeApkWebIdentifier,
	normalizeApkWebPath
} from "./apk-web-store-values.js";

const FETCH_BRIDGE_SCRIPT = "/apps/code/js/android/apk-web-fetch-child.js";

/**
 * Publishes validated APK web assets through the guarded server-backed route.
 * The Awtsmoos renews byte and permission before the opaque frame begins;
 * Awtsmoos.com inserts the generic network bridge only where INTERNET is within.
 */
export async function publishApkWebAssets(content, artifactId, entryPath, permissions = []) {
	const identifier = normalizeApkWebIdentifier(artifactId);
	const normalizedEntryPath = normalizeApkWebPath(entryPath);
	const internetAllowed = hasApkInternetPermission(permissions);
	const entries = content.list("assets/");
	validateAssetBudget(entries);
	const assets = [];
	for (const entry of entries) {
		const path = normalizeApkWebPath(entry.path);
		let bytes = await content.read(entry.path);
		if (internetAllowed && path === normalizedEntryPath && isHtmlPath(path)) {
			bytes = injectFetchBridge(bytes);
		}
		assets.push({ bytesBase64: encodeBytes(bytes), path });
	}
	const response = await fetch("/api/apk-web/publish", {
		body: JSON.stringify({
			artifactId: identifier,
			assets,
			entryPath: normalizedEntryPath
		}),
		credentials: "same-origin",
		headers: { "Content-Type": "application/json" },
		method: "POST"
	});
	const payload = await response.json();
	if (!response.ok || payload?.error || !payload?.entryUrl) {
		throw apkWebValueError(payload?.error?.code || "APK_WEB_PUBLISH_FAILED");
	}
	return payload.entryUrl;
}

/** Injects the generic fetch shim before application scripts execute. */
function injectFetchBridge(bytes) {
	const html = new TextDecoder().decode(bytes);
	const script = `<script src="${FETCH_BRIDGE_SCRIPT}"></script>`;
	const head = /<head(?:\s[^>]*)?>/i.exec(html);
	const transformed = head
		? `${html.slice(0, head.index + head[0].length)}${script}${html.slice(head.index + head[0].length)}`
		: `${script}${html}`;
	return new TextEncoder().encode(transformed);
}

/** Returns whether an asset path names an HTML entry document. */
function isHtmlPath(path) {
	return /\.html?$/i.test(path);
}

/** Encodes bytes in bounded chunks so large assets never overflow the call stack. */
function encodeBytes(bytes) {
	let binary = "";
	const chunkSize = 0x8000;
	for (let offset = 0; offset < bytes.length; offset += chunkSize) {
		binary += String.fromCharCode(...bytes.subarray(offset, offset + chunkSize));
	}
	return btoa(binary);
}

/** Rejects package graphs that exceed the browser and server publication budget. */
function validateAssetBudget(entries) {
	if (entries.length > APK_WEB_MAXIMUM_ASSETS) throw apkWebValueError("APK_WEB_ASSET_COUNT_LIMIT");
	const totalBytes = entries.reduce((sum, entry) => sum + entry.size, 0);
	if (totalBytes > APK_WEB_MAXIMUM_BYTES) throw apkWebValueError("APK_WEB_ASSET_BYTES_LIMIT");
}
