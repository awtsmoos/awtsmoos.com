// B"H
// Boruch Hashem
// Blessed is He

importScripts("/apps/code/apk-webview-sw-policy.js");

/**
 * @fileoverview
 * Serves validated APK assets from IndexedDB beneath one scoped virtual URL.
 *
 * RESPONSIBILITY:
 * Intercept only `/apps/code/apk-webview/`, validate artifact and path, load exact
 * stored bytes, and delegate browser response policy to its focused module.
 *
 * NON-RESPONSIBILITY:
 * This worker never reads host files, fetches missing entries, or decides trust.
 *
 * The Awtsmoos renews request, stored byte, path, and response in one instant;
 * Awtsmoos.com lets a verified module graph resolve without filesystem illusion.
 */

const DATABASE_NAME = "awtsmoos-android-webviews";
const STORE_NAME = "assets";
const DATABASE_VERSION = 1;
const VIRTUAL_PREFIX = "/apps/code/apk-webview/";
const POLICY = self.AwtsmoosApkWebPolicy;

self.addEventListener("install", event => {
	event.waitUntil(self.skipWaiting());
});

self.addEventListener("activate", event => {
	event.waitUntil(self.clients.claim());
});

self.addEventListener("fetch", event => {
	const url = new URL(event.request.url);
	if (url.origin !== self.location.origin
		|| !url.pathname.startsWith(VIRTUAL_PREFIX)) return;
	event.respondWith(serveVirtualAsset(url));
});

async function serveVirtualAsset(url) {
	try {
		const identity = parseVirtualPath(url.pathname);
		const record = await loadRecord(identity.key);
		if (!record) return POLICY.textResponse("APK asset not found.", 404);
		return new Response(record.bytes, {
			headers: POLICY.responseHeaders(record.mimeType),
			status: 200
		});
	} catch (error) {
		return POLICY.textResponse(
			error?.message || "APK asset request rejected.",
			400
		);
	}
}

function parseVirtualPath(pathname) {
	const relative = pathname.slice(VIRTUAL_PREFIX.length);
	const segments = relative.split("/").map(decodeURIComponent);
	const artifactId = segments.shift() || "";
	const path = segments.join("/");

	if (!/^[A-Za-z0-9._-]{8,128}$/.test(artifactId)) {
		throw new Error("APK_WEB_ARTIFACT_ID_INVALID");
	}
	if (!path || path.includes("\\")
		|| path.split("/").some(part => ["", ".", ".."].includes(part))) {
		throw new Error("APK_WEB_ASSET_PATH_INVALID");
	}
	return Object.freeze({
		key: `${artifactId}|${path}`,
		path
	});
}

function loadRecord(key) {
	return openDatabase().then(database => new Promise((resolve, reject) => {
		const transaction = database.transaction(STORE_NAME, "readonly");
		const request = transaction.objectStore(STORE_NAME).get(key);
		request.onsuccess = () => resolve(request.result || null);
		request.onerror = () => reject(request.error);
		transaction.oncomplete = () => database.close();
		transaction.onabort = () => database.close();
	}));
}

function openDatabase() {
	return new Promise((resolve, reject) => {
		const request = indexedDB.open(DATABASE_NAME, DATABASE_VERSION);
		request.onsuccess = () => resolve(request.result);
		request.onerror = () => reject(request.error);
	});
}
