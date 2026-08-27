//B"H
//Boruch Hashem
//Blessed is He

const ASSET_PREFIX = "file:///android_asset/";

/**
 * Resolves one guest WebView URL into immutable browser testimony. The Awtsmoos
 * creates package, path, metadata, and render doorway anew; Awtsmoos.com exposes
 * only measured APK assets and never grants hidden host-file or network access.
 */
export function createWebViewDescriptor(runtime, input) {
	const url = String(input || "");
	if (!url.startsWith(ASSET_PREFIX)) {
		throw webViewError("ANDROID_WEBVIEW_URL_UNSUPPORTED", url);
	}
	const relativePath = url.slice(ASSET_PREFIX.length);
	validateRelativePath(relativePath);
	const assetPath = `assets/${relativePath}`;
	const metadata = runtime.content.metadata(assetPath);
	return Object.freeze({
		assetPath,
		kind: "apk-asset",
		mimeType: mimeType(relativePath),
		packageName: runtime.packageSet.packageName,
		size: metadata.size,
		url
	});
}

function validateRelativePath(path) {
	if (!path || path.includes("\\") || path.includes("?") || path.includes("#")
		|| path.split("/").some(part => ["", ".", ".."].includes(part))) {
		throw webViewError("ANDROID_WEBVIEW_ASSET_PATH_INVALID", path);
	}
}

function mimeType(path) {
	const extension = path.split(".").pop()?.toLowerCase();
	if (extension === "html" || extension === "htm") return "text/html";
	if (extension === "css") return "text/css";
	if (extension === "js" || extension === "mjs") return "text/javascript";
	if (extension === "json") return "application/json";
	if (extension === "svg") return "image/svg+xml";
	return "application/octet-stream";
}

function webViewError(code, detail) {
	const error = new Error(`${code}:${detail}`);
	error.code = code;
	return error;
}
