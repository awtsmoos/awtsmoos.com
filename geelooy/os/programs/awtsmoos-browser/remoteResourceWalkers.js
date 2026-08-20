//B"H
// Boruch Hashem
// Blessed is He

/**
 * @module RemoteResourceWalkers
 * @description The Awtsmoos follows only the textual branches already named by a
 * module or stylesheet; Awtsmoos.com ends cycles with visited testimony, rewrites
 * only accepted children, and leaves dynamic or binary roads for later streets.
 */

import {
	staticModuleRefs,
	rewriteModuleRefs
} from "./remoteModuleResources.js";
import {
	cssAssetRefs,
	cssImportRefs,
	rewriteCssImports
} from "./remoteCssResources.js";

export function createRemoteResourceWalkers(context = {}) {
	const moduleProcessing = new Set();
	const moduleDone = new Set();
	const styleProcessing = new Set();
	const styleDone = new Set();
	const deferredSeen = new Set();
	const maxModuleDepth = Number(context.limits?.maxModuleDepth ?? 12);
	const maxCssDepth = Number(context.limits?.maxCssDepth ?? 8);

	return { collectModule, collectStyle };

	async function collectModule(url, depth = 0) {
		if (depth > maxModuleDepth) return depthWarning("module", url, depth);
		const record = await context.ledger.fetchText({
			accept: "text/javascript,application/javascript,text/plain,*/*;q=0.1",
			depth,
			kind: "module",
			url
		});
		if (!record || moduleDone.has(record.url) || moduleProcessing.has(record.url)) return record;
		moduleProcessing.add(record.url);
		const parsed = staticModuleRefs(record.text, record.url, context.importMap);
		context.warnings.push(...parsed.warnings);
		const replacements = [];
		for (const ref of parsed.refs) {
			if (!ref.url) continue;
			const child = await collectModule(ref.url, depth + 1);
			if (child) replacements.push({ start: ref.start, end: ref.end, value: child.fileKey });
		}
		context.files[record.fileKey] = rewriteModuleRefs(record.text, replacements);
		moduleProcessing.delete(record.url);
		moduleDone.add(record.url);
		return record;
	}

	async function collectStyle(url, depth = 0) {
		if (depth > maxCssDepth) return depthWarning("style", url, depth);
		const record = await context.ledger.fetchText({
			accept: "text/css,text/plain,*/*;q=0.1",
			depth,
			kind: "style",
			url
		});
		if (!record || styleDone.has(record.url) || styleProcessing.has(record.url)) return record;
		styleProcessing.add(record.url);
		const parsed = cssImportRefs(record.text, record.url);
		const assets = cssAssetRefs(record.text, record.url);
		context.warnings.push(...parsed.warnings, ...assets.warnings);
		collectDeferred(record.url, assets.assets);
		const replacements = [];
		for (const ref of parsed.refs) {
			const child = await collectStyle(ref.url, depth + 1);
			if (child) replacements.push({ start: ref.start, end: ref.end, value: child.fileKey });
		}
		context.files[record.fileKey] = rewriteCssImports(record.text, replacements);
		styleProcessing.delete(record.url);
		styleDone.add(record.url);
		return record;
	}

	function collectDeferred(parentUrl, assets) {
		for (const asset of assets) {
			const key = `${parentUrl}\u0000${asset.url}`;
			if (deferredSeen.has(key)) continue;
			deferredSeen.add(key);
			context.deferredAssets.push({
				from: parentUrl,
				specifier: asset.specifier,
				url: asset.url
			});
		}
	}

	function depthWarning(kind, url, depth) {
		context.warnings.push({
			code: "REMOTE_RESOURCE_DEPTH_EXCEEDED",
			depth,
			kind,
			url
		});
		return null;
	}
}
