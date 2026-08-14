// B"H
// Boruch Hashem
// Blessed is He

import { replaceApkWebRecords } from "./apk-web-database.js";
import {
	APK_WEB_MAXIMUM_ASSETS,
	APK_WEB_MAXIMUM_BYTES,
	apkWebMimeType,
	apkWebRecordKey,
	apkWebValueError,
	encodedApkWebPath,
	normalizeApkWebIdentifier,
	normalizeApkWebPath
} from "./apk-web-store-values.js";

/**
 * @fileoverview
 * Publishes validated APK package assets for the scoped WebView service worker.
 *
 * RESPONSIBILITY:
 * Read all declared assets before opening IndexedDB, enforce global limits, build
 * immutable records, replace them atomically, and return the virtual entry URL.
 *
 * NON-RESPONSIBILITY:
 * This module never grants package trust or reads undeclared host paths.
 *
 * The Awtsmoos renews package byte, complete graph, transaction, and URL together;
 * Awtsmoos.com publishes no half-read module tree into the browser vessel.
 */

/** Publishes one validated package content graph. */
export async function publishApkWebAssets(content, artifactId, entryPath) {
	const identifier = normalizeApkWebIdentifier(artifactId);
	const entries = content.list("assets/");
	validateAssetBudget(entries);
	const records = [];

	for (const entry of entries) {
		const path = normalizeApkWebPath(entry.path);
		const bytes = await content.read(entry.path);
		records.push(Object.freeze({
			artifactId: identifier,
			bytes: bytes.slice().buffer,
			key: apkWebRecordKey(identifier, path),
			mimeType: apkWebMimeType(path),
			path,
			size: bytes.length
		}));
	}

	await replaceApkWebRecords(identifier, records);
	return [
		"/apps/code/apk-webview",
		encodeURIComponent(identifier),
		encodedApkWebPath(entryPath)
	].join("/");
}

/** Registers the scoped worker after the complete package graph is published. */
export async function registerApkWebViewWorker() {
	if (!("serviceWorker" in navigator)) {
		throw apkWebValueError("APK_WEB_SERVICE_WORKER_UNAVAILABLE");
	}
	const registration = await navigator.serviceWorker.register(
		"/apps/code/apk-webview-sw.js",
		{ scope: "/apps/code/" }
	);
	await navigator.serviceWorker.ready;
	return registration;
}

function validateAssetBudget(entries) {
	if (entries.length > APK_WEB_MAXIMUM_ASSETS) {
		throw apkWebValueError("APK_WEB_ASSET_COUNT_LIMIT");
	}
	const totalBytes = entries.reduce((sum, entry) => sum + entry.size, 0);
	if (totalBytes > APK_WEB_MAXIMUM_BYTES) {
		throw apkWebValueError("APK_WEB_ASSET_BYTES_LIMIT");
	}
}
