//B"H
// Boruch Hashem
// Blessed is He

/**
 * @module RemoteResourceGraph
 * @description The Awtsmoos gathers a bounded page constellation into local Merkava
 * files without executing a single guest word; Awtsmoos.com rewrites only roads that
 * were actually fetched through the injected guarded transport.
 */

import {
	canonicalRemoteUrl,
	remoteFileKey
} from "./remoteResourceAddress.js";
import { importMapFromHtml } from "./remoteImportMap.js";
import {
	htmlResourceRefs,
	rewriteHtmlResources
} from "./remoteHtmlResources.js";
import { createRemoteResourceFetch } from "./remoteResourceFetch.js";
import { createRemoteResourceWalkers } from "./remoteResourceWalkers.js";

const DEFAULT_LIMITS = Object.freeze({
	maxCssDepth: 8,
	maxFileBytes: 1024 * 1024,
	maxFiles: 64,
	maxModuleDepth: 12,
	maxTotalBytes: 6 * 1024 * 1024
});

export async function collectRemoteResourceGraph(options = {}) {
	const html = String(options.html ?? "");
	const pageUrl = canonicalRemoteUrl(options.pageUrl);
	const limits = { ...DEFAULT_LIMITS, ...(options.limits || {}) };
	const entryBytes = new TextEncoder().encode(html).byteLength;
	assertEntryBudget(entryBytes, limits);
	const entry = remoteFileKey(pageUrl);
	const files = { [entry]: html };
	const manifest = [];
	const warnings = [];
	const deferredAssets = [];
	const importMap = importMapFromHtml(html, pageUrl);
	warnings.push(...importMap.warnings);
	const ledger = createRemoteResourceFetch({
		files,
		initialBytes: entryBytes,
		initialFiles: 1,
		limits,
		manifest,
		transport: options.transport,
		warnings
	});
	const walkers = createRemoteResourceWalkers({
		deferredAssets,
		files,
		importMap,
		ledger,
		limits,
		warnings
	});
	const discovered = htmlResourceRefs(html, pageUrl);
	warnings.push(...discovered.warnings);
	const replacements = [];
	for (const ref of discovered.refs) {
		const record = await collectHtmlRef(ref, ledger, walkers);
		if (!record) continue;
		replacements.push({
			end: ref.end,
			start: ref.start,
			value: record.fileKey
		});
	}
	files[entry] = rewriteHtmlResources(html, replacements);
	return {
		deferredAssets,
		entry,
		files,
		manifest,
		usage: ledger.usage(),
		warnings
	};
}

async function collectHtmlRef(ref, ledger, walkers) {
	if (ref.kind === "style") return walkers.collectStyle(ref.url, 0);
	if (ref.module) return walkers.collectModule(ref.url, 0);
	return ledger.fetchText({
		accept: "text/javascript,application/javascript,text/plain,*/*;q=0.1",
		depth: 0,
		kind: "script",
		url: ref.url
	});
}

function assertEntryBudget(bytes, limits) {
	if (Number(limits.maxFiles) < 1) throw graphError("REMOTE_RESOURCE_FILE_COUNT_EXCEEDED");
	if (bytes > Number(limits.maxFileBytes)) throw graphError("REMOTE_RESOURCE_FILE_BYTES_EXCEEDED");
	if (bytes > Number(limits.maxTotalBytes)) throw graphError("REMOTE_RESOURCE_TOTAL_BYTES_EXCEEDED");
}

function graphError(code) {
	const error = new Error(code);
	error.code = code;
	return error;
}
