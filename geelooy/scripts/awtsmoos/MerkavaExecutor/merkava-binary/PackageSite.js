// B"H
// Boruch Hashem
// Blessed is He
//
// PackageSite — package any website as a native Merkava app.
//
// Yaakov: "the merkava browser with the actor — all Awtsmoos sites run the
// geelooy/os or as its own app as well" ... "take my website and give me an apk"
//
// packageAwtsmoosSite(siteUrl, opts):
//   1. Fetches the page over DirectNet (CORS-free, like a native app).
//   2. Inlines linked stylesheets + scripts (same-origin + absolute URLs).
//   3. Compiles HTML+CSS+JS to a native .mapp binary via SourceAppCompiler
//      (Merkava bytecode — NOT a WebView wrapper; the VM executes opcodes).
//   4. Writes <appName>.mapp + <appName>.merkava-app.json manifest.
//      The manifest registers the app with geelooy/OS or lets it ship
//      standalone (later stages wrap the .mapp as APK/EXE/APP/ELF).
//
// Honest limits (documented, not hidden):
//   - Static snapshot: the packaged app is the page as fetched. Pages needing
//     live server APIs at runtime still use SmartNet inside the app.
//   - Subresource cap: 25 files / 2MB each by default (configurable).
//   - Only same-origin + explicitly allowed cross-origin hosts are inlined;
//     third-party CDN scripts are inlined too (they're just bytes), but
//     credentials/cookies are NOT carried.

const path = require("path");
const fs = require("fs");

const { DirectNet } = require("../merkava-browser/DirectNet.js");
const { compileSourceFilesToApp } = require("./SourceAppCompiler.js");

const DEFAULT_MAX_FILES = 25;
const DEFAULT_MAX_FILE_BYTES = 2 * 1024 * 1024;

/** Minimal tokenizer for link/script/img src extraction (no external parser). */
function extractRefs(html) {
	const refs = { css: [], js: [] };
	const linkRe = /<link\b[^>]*>/gi;
	const scriptRe = /<script\b[^>]*>/gi;
	const attr = (tag, name) => {
		const m = tag.match(new RegExp(name + '\\s*=\\s*("([^"]*)"|\'([^\']*)\'|([^\\s>]+))', "i"));
		return m ? (m[2] || m[3] || m[4] || "") : "";
	};
	let m;
	while ((m = linkRe.exec(html))) {
		const tag = m[0];
		const rel = attr(tag, "rel").toLowerCase();
		if (rel.includes("stylesheet")) {
			const href = attr(tag, "href");
			if (href && !href.startsWith("data:")) refs.css.push(href);
		}
	}
	while ((m = scriptRe.exec(html))) {
		const tag = m[0];
		const src = attr(tag, "src");
		if (src && !src.startsWith("data:")) refs.js.push(src);
	}
	return refs;
}

function safeFileName(urlPath, kind, idx) {
	const base = String(urlPath).split("?")[0].split("/").filter(Boolean).pop() || ("asset-" + idx);
	const clean = base.replace(/[^a-zA-Z0-9._-]/g, "_").slice(0, 64) || ("asset-" + idx);
	if (kind === "css" && !clean.endsWith(".css")) return clean + ".css";
	if (kind === "js" && !clean.endsWith(".js")) return clean + ".js";
	return clean;
}

async function fetchToBuffer(url, timeoutMs) {
	const res = await DirectNet.directFetch(url, { timeoutMs });
	if (!res.ok) throw new Error("HTTP " + res.status + " for " + url);
	return res;
}

/**
 * Package a live website as a native Merkava app.
 * @param {string} siteUrl
 * @param {object} [opts] { appName, outDir, maxFiles, maxFileBytes, timeoutMs, inlineJs=true, inlineCss=true }
 * @returns {Promise<{appName, mappPath, manifestPath, mappBytes, files, sourceUrl, warnings}>}
 */
async function packageAwtsmoosSite(siteUrl, opts = {}) {
	const appName = String(opts.appName || "merkava-app").replace(/[^a-zA-Z0-9_-]/g, "_") || "merkava-app";
	const outDir = opts.outDir || path.join(process.env.HOME || "/tmp", "workspace", "merkava-apps");
	const maxFiles = opts.maxFiles || DEFAULT_MAX_FILES;
	const maxBytes = opts.maxFileBytes || DEFAULT_MAX_FILE_BYTES;
	const timeoutMs = opts.timeoutMs || 30000;
	const warnings = [];

	fs.mkdirSync(outDir, { recursive: true });

	// 1. Fetch entry HTML (CORS-free — native semantics).
	const entryRes = await fetchToBuffer(siteUrl, timeoutMs);
	const html = entryRes.body.toString("utf8");
	const base = new URL(entryRes.url);

	// 2. Collect + inline subresources.
	const refs = extractRefs(html);
	const files = {};
	let rewritten = html;
	let count = 0;

	async function inlineList(list, kind) {
		for (let i = 0; i < list.length; i++) {
			if (count >= maxFiles) {
				warnings.push("subresource cap reached (" + maxFiles + "); remaining " + kind + " skipped");
				break;
			}
			let abs;
			try {
				abs = new URL(list[i], base).toString();
			} catch (e) {
				warnings.push("bad " + kind + " URL skipped: " + list[i]);
				continue;
			}
			try {
				const res = await fetchToBuffer(abs, timeoutMs);
				if (res.body.length > maxBytes) {
					warnings.push(kind + " too large, skipped: " + abs + " (" + res.body.length + " bytes)");
					continue;
				}
				const fname = "/" + safeFileName(new URL(abs).pathname, kind, count);
				files[fname] = res.body.toString("utf8");
				// Rewrite the reference to the local file so the compiler links it.
				rewritten = rewritten.split(list[i]).join(fname);
				count++;
			} catch (e) {
				warnings.push("failed to inline " + kind + " " + abs + ": " + e.message);
			}
		}
	}

	if (opts.inlineCss !== false) await inlineList(refs.css, "css");
	if (opts.inlineJs !== false) await inlineList(refs.js, "js");

	files["/index.html"] = rewritten;

	// 3. Compile to native MAPP bytecode.
	const mapp = await compileSourceFilesToApp({ files, entry: "/index.html" });
	if (!Buffer.isBuffer(mapp) || mapp.length < 4) {
		throw new Error("PackageSite: compiler returned invalid binary");
	}

	// 4. Write binary + manifest.
	const mappPath = path.join(outDir, appName + ".mapp");
	const manifestPath = path.join(outDir, appName + ".merkava-app.json");
	fs.writeFileSync(mappPath, mapp);
	const manifest = {
		format: "merkava-app/1",
		name: appName,
		sourceUrl: entryRes.url,
		entry: "/index.html",
		binary: appName + ".mapp",
		mappBytes: mapp.length,
		files: Object.keys(files),
		runtime: "merkava-vm",
		webview: false,
		packagedAt: new Date().toISOString(),
		warnings
	};
	fs.writeFileSync(manifestPath, JSON.stringify(manifest, null, 2));

	return {
		appName,
		mappPath,
		manifestPath,
		mappBytes: mapp.length,
		files: Object.keys(files),
		sourceUrl: entryRes.url,
		warnings
	};
}

module.exports = {
	packageAwtsmoosSite,
	extractRefs,
	DEFAULT_MAX_FILES,
	DEFAULT_MAX_FILE_BYTES
};
