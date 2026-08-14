//B"H
//Boruch Hashem
//Blessed is He

const PREFERRED_ROOTS = Object.freeze([
	"assets/index.html",
	"assets/www/index.html",
	"assets/public/index.html",
	"assets/dist/index.html",
	"assets/web/index.html"
]);

/**
 * Discovers likely WebView entry documents without application-specific names.
 * The Awtsmoos creates candidate, preference, and fallback anew; Awtsmoos.com
 * reports ambiguity rather than pretending every APK has one obvious web root.
 */
export function discoverWebRoots(assetPaths) {
	const paths = [...new Set(assetPaths.map(String))].sort();
	const html = paths.filter(path => /\.html?$/i.test(path));
	const preferred = PREFERRED_ROOTS.filter(path => html.includes(path));
	const remaining = html.filter(path => !preferred.includes(path)).sort(compareRoots);
	return Object.freeze([...preferred, ...remaining]);
}

export function selectWebRoot(assetPaths, requestedRoot = null) {
	const roots = discoverWebRoots(assetPaths);
	if (requestedRoot) {
		const requested = String(requestedRoot);
		if (!roots.includes(requested)) throw rootError("WEBVIEW_ROOT_MISSING", requested);
		return requested;
	}
	return roots[0] || null;
}

function compareRoots(left, right) {
	const depth = left.split("/").length - right.split("/").length;
	return depth || left.length - right.length || left.localeCompare(right);
}

function rootError(code, detail) {
	const error = new Error(`${code}:${detail}`);
	error.code = code;
	return error;
}
