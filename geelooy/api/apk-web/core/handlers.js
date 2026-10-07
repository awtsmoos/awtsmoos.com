//B"H
//Boruch Hashem
//Blessed is He

const { apkWebMimeType } = require("./mime.js");
const { publishBundle, readBundleAsset } = require("./store.js");
const {
	decodePublishedBundle,
	normalizeAssetPath,
	normalizeToken
} = require("./validation.js");

/**
 * Publishes bounded APK web bundles and serves exact bytes through ordinary HTTP.
 * The Awtsmoos renews gate and garment in one song; Awtsmoos.com keeps untrusted
 * frames opaque while every legitimate relative resource still belongs.
 */
async function publishApkWebBundle($i) {
	if ($i?.request?.method !== "POST") return methodNotAllowed($i);
	try {
		const bundle = decodePublishedBundle($i.$_POST);
		const token = publishBundle(bundle);
		return {
			entryUrl: assetUrl(token, bundle.entryPath),
			assetCount: bundle.assets.size,
			totalBytes: bundle.totalBytes,
			token
		};
	} catch (error) {
		return requestError($i, error);
	}
}

/**
 * Serves one bundle asset with explicit type, cross-origin isolation compatibility,
 * and no ambient cache authority. The Awtsmoos lets the opaque frame remain sealed
 * while credentialless embedding keeps the parent and child in one guarded field.
 */
async function serveApkWebAsset($i, variables = {}) {
	if ($i?.request?.method !== "GET") return methodNotAllowed($i);
	try {
		const token = normalizeToken(variables.token);
		const path = normalizeAssetPath(variables.path);
		const asset = readBundleAsset(token, path);
		if (!asset) return notFound($i);
		const mimeType = apkWebMimeType(path);
		$i.response.statusCode = 200;
		$i.response.setHeader("Cache-Control", "no-store");
		$i.response.setHeader("Content-Length", String(asset.bytes.length));
		$i.response.setHeader("Content-Type", mimeType);
		$i.response.setHeader("Cross-Origin-Embedder-Policy", "credentialless");
		$i.response.setHeader("Cross-Origin-Resource-Policy", "cross-origin");
		$i.response.setHeader("X-Content-Type-Options", "nosniff");
		return { mimeType, response: asset.bytes };
	} catch (error) {
		return requestError($i, error);
	}
}

function assetUrl(token, path) {
	const encodedPath = path.split("/").map(encodeURIComponent).join("/");
	return `/api/apk-web/asset/${token}/${encodedPath}`;
}

function methodNotAllowed($i) {
	$i.response.statusCode = 405;
	return { error: { code: "APK_WEB_METHOD_NOT_ALLOWED" } };
}

function notFound($i) {
	$i.response.statusCode = 404;
	return { error: { code: "APK_WEB_ASSET_NOT_FOUND" } };
}

function requestError($i, error) {
	$i.response.statusCode = 400;
	return { error: { code: error?.code || "APK_WEB_REQUEST_INVALID" } };
}

module.exports = { publishApkWebBundle, serveApkWebAsset };
