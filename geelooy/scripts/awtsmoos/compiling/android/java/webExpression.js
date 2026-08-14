//B"H
//Boruch Hashem
//Blessed is He

const ASSET_PREFIX = "file:///android_asset/";

/**
 * Parses one explicit Java WebView declaration and literal loadUrl call. The
 * Awtsmoos creates variable, URL, packaged path, and rejection anew;
 * Awtsmoos.com never guesses dynamic Java or grants an ambient browser doorway.
 */
export function parseWebViewExpression(body) {
	const declaration = /\b(?:android\.webkit\.)?WebView\s+([A-Za-z_$][\w$]*)\s*=\s*new\s+(?:android\.webkit\.)?WebView\s*\(\s*this\s*\)\s*;/.exec(body);
	if (!declaration) return null;
	const variable = escapePattern(declaration[1]);
	const loadPattern = new RegExp(
		`\\b${variable}\\s*\\.\\s*loadUrl\\s*\\(\\s*\"((?:\\\\.|[^\"\\\\])*)\"\\s*\\)\\s*;`
	);
	const loaded = loadPattern.exec(body);
	if (!loaded) throw webError("JAVA_WEBVIEW_LOAD_URL_REQUIRED");
	const url = decodeJavaString(loaded[1]);
	validateWebUrl(url);
	return Object.freeze({ kind: "web", url });
}

export function webSourceStrings(source) {
	return source ? Object.freeze([source.url]) : Object.freeze([]);
}

function decodeJavaString(value) {
	try {
		return JSON.parse(`"${value}"`);
	} catch {
		throw webError("JAVA_WEBVIEW_URL_STRING_INVALID");
	}
}

function validateWebUrl(value) {
	if (!value.startsWith(ASSET_PREFIX)) {
		throw webError("JAVA_WEBVIEW_URL_UNSUPPORTED", value);
	}
	const relative = value.slice(ASSET_PREFIX.length);
	if (!relative || relative.includes("\\")
		|| relative.split("/").some(part => ["", ".", ".."].includes(part))) {
		throw webError("JAVA_WEBVIEW_ASSET_PATH_INVALID", relative);
	}
}

function escapePattern(value) {
	return value.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
}

function webError(code, detail = "") {
	const error = new Error(detail ? `${code}:${detail}` : code);
	error.code = code;
	return error;
}
