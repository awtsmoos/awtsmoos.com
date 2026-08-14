// B"H
const path = require("path");

/** Normalizes public URL dependency identities shared by discovery and fetching. */
function resolveUrl(spec, base) {
	if (!spec || spec.startsWith("data:") || spec.startsWith("blob:")) return null;
	try { return new URL(spec, base); } catch (_) { return null; }
}

function keyFor(spec, fromKey, url) {
	const pathname = url?.pathname || resolveUrl(spec, "https://awtsmoos.invalid/" + String(fromKey || ""))?.pathname;
	const clean = slash(String(pathname || "").replace(/^\/+/, ""));
	if (!clean || clean.endsWith("/")) return clean + "index.html";
	return clean;
}

function uniqueRefs(refs) {
	const seen = new Set();
	return refs.filter(ref => {
		if (seen.has(ref.url)) return false;
		seen.add(ref.url);
		return true;
	});
}

function kindFor(pathname) {
	if (/\.json$/i.test(pathname)) return "json";
	if (/\.m?js$/i.test(pathname)) return "js";
	if (/\.css$/i.test(pathname)) return "css";
	if (/\.html?$/i.test(pathname) || !path.extname(pathname)) return "html";
	return "asset";
}

function sameOrigin(root, candidate) {
	const got = typeof candidate === "string" ? new URL(candidate) : candidate;
	return root.origin === got.origin;
}

function acceptFor(url) {
	if (/\.json(?:[?#]|$)/i.test(url)) return "application/json,*/*";
	if (/\.css(?:[?#]|$)/i.test(url)) return "text/css,*/*";
	return /\.m?js(?:[?#]|$)/i.test(url) ? "text/javascript,*/*" : "text/html,*/*";
}

function slash(value) { return String(value || "").replace(/\\/g, "/"); }

module.exports = { resolveUrl, keyFor, uniqueRefs, kindFor, sameOrigin, acceptFor };
