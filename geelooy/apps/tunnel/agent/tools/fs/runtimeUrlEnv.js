// B"H
const Paths = require("./runtimeUrlPaths.js");
const Refs = require("./runtimeUrlRefs.js");
const Rewrite = require("./runtimeUrlRewrite.js");

const MAX_URL_FILES = 320;
const MAX_URL_BYTES = 1024 * 1024;

/** Collects one bounded, unique, same-origin dependency graph. */
async function buildRuntimeUrlEnv(payload = {}) {
	if (!shouldCollectUrl(payload)) return null;
	const pageUrl = new URL(String(payload.url));
	const entry = Paths.keyFor(pageUrl.href, "", pageUrl);
	const files = {}, seen = new Set(), scheduledUrls = new Set([pageUrl.href]), scheduledKeys = new Set([entry]);
	const queue = [{ url: pageUrl.href, key: entry, kind: "html" }];
	const diagnostics = [], rewriteRules = Rewrite.collectNetworkRewriteRules(payload);
	while (queue.length && Object.keys(files).length < maxFiles(payload)) {
		const job = queue.shift();
		if (seen.has(job.url) || files[job.key] !== undefined) continue;
		seen.add(job.url);
		const fetchUrl = Rewrite.rewriteRequestUrl({ url: job.url, kind: job.kind, pageUrl, rules: rewriteRules, diagnostics });
		const got = await fetchBrowserText(fetchUrl, payload);
		if (!got.ok) {
			diagnostics.push({ kind: "fetch-skip", url: job.url, fetchUrl, status: got.status, tooLarge: got.tooLarge });
			continue;
		}
		const normalized = normalizeFetchedText(got.text, job.kind);
		files[job.key] = normalized;
		enqueueRefs({ refs: Refs.refsFrom(normalized, job.key, job.url, job.kind), pageUrl, files, queue, seen, scheduledUrls, scheduledKeys, payload });
	}
	if (!files[entry]) return { entry, files: {}, source: "url", error: "url_entry_not_loaded", diagnostics, ok: false };
	return {
		entry, files, source: "url", rootUrl: pageUrl.href, diagnostics,
		networkRewrite: { enabled: rewriteRules.length > 0, rules: rewriteRules.map(Rewrite.publicRule) },
		ok: true
	};
}

function enqueueRefs(input) {
	const { refs, pageUrl, files, queue, seen, scheduledUrls, scheduledKeys, payload } = input;
	for (const ref of refs) {
		if (Object.keys(files).length + queue.length >= maxFiles(payload)) break;
		if (!Paths.sameOrigin(pageUrl, ref.url)) continue;
		if (seen.has(ref.url) || files[ref.key] !== undefined) continue;
		if (scheduledUrls.has(ref.url) || scheduledKeys.has(ref.key)) continue;
		scheduledUrls.add(ref.url);
		scheduledKeys.add(ref.key);
		queue.push(ref);
	}
}

function shouldCollectUrl(payload = {}) {
	if (!payload.url || payload.html || payload.content || payload.files || payload.files64) return false;
	const entry = payload.entry || payload.path || payload.p || payload.target;
	return !entry || String(entry).trim() === "." || /^[a-z]+:\/\//i.test(String(entry));
}

async function fetchBrowserText(url, payload = {}) {
	const response = await fetch(url, { headers: { accept: Paths.acceptFor(url) } });
	if (!response.ok) return { ok: false, status: response.status, url };
	const buffer = Buffer.from(await response.arrayBuffer());
	if (buffer.length > maxBytes(payload)) return { ok: false, status: response.status, url, tooLarge: true };
	return { ok: true, status: response.status, url, text: buffer.toString("utf8") };
}

function normalizeFetchedText(text, kind) {
	if (kind !== "html") return text;
	return String(text || "").replace(/<script[^>]+type=["']importmap["'][^>]*>[\s\S]*?<\/script>/gi, "");
}

function maxFiles(payload) { return Number(payload.maxFiles || payload.fileLimit || MAX_URL_FILES); }
function maxBytes(payload) { return Number(payload.maxBytes || payload.byteLimit || MAX_URL_BYTES); }

module.exports = {
	buildRuntimeUrlEnv,
	shouldCollectUrl,
	refsFrom: Refs.refsFrom,
	collectNetworkRewriteRules: Rewrite.collectNetworkRewriteRules,
	rewriteRequestUrl: Rewrite.rewriteRequestUrl
};
