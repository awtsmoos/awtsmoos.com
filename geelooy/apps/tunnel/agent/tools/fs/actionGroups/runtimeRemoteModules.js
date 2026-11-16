// B"H

const { stabilizeRemoteModuleSource } = require("./remoteModuleCompat.js");

/**
 * @file Loads remote Merkava modules only as a last-resort compatibility path.
 * @description
 * The Awtsmoos prefers the installed vessel; Awtsmoos.com keeps this distant
 * bridge for rescue, translating enough legacy syntax to let old modules awaken.
 */
const moduleCache = new Map();

async function fetchText(url) {
	const response = await fetch(url);
	if (!response.ok) {
		throw new Error(`Failed loading remote Merkava module ${url}: HTTP ${response.status}`);
	}
	return response.text();
}

function rewriteImports(source, baseUrl) {
	return String(source || "").replace(
		/(import\s+[^"']*?["']|export\s+[^"']*?from\s+["'])(\.{1,2}\/[^"']+)(["'])/g,
		(_match, prefix, relative, suffix) => `${prefix}${new URL(relative, baseUrl).href}${suffix}`
	);
}

function collectRemoteDeps(source, baseUrl) {
	const dependencies = new Set();
	for (const match of String(source || "").matchAll(/(?:import|export)\s+[^"']*?["'](https?:\/\/[^"']+)["']/g)) {
		dependencies.add(match[1]);
	}
	for (const match of String(source || "").matchAll(/require\(["'](\.{1,2}\/[^"']+)["']\)/g)) {
		dependencies.add(new URL(match[1], baseUrl).href);
	}
	return [...dependencies];
}

function replaceRemoteUrls(source) {
	return source.replace(/(["'])(https?:\/\/[^"']+)(["'])/g, (_match, open, dependency, close) => {
		const cached = moduleCache.get(dependency);
		return cached?.dataUrl ? `${open}${cached.dataUrl}${close}` : `${open}${dependency}${close}`;
	});
}

async function importHttpModule(url) {
	if (moduleCache.has(url)) {
		const cached = await moduleCache.get(url);
		return cached.module || cached;
	}
	const pending = buildHttpModule(url);
	moduleCache.set(url, pending);
	return (await pending).module;
}

async function buildHttpModule(url) {
	let source = stabilizeRemoteModuleSource(await fetchText(url), url);
	source = rewriteImports(source, url);
	for (const dependency of collectRemoteDeps(source, url)) {
		await importHttpModule(dependency);
	}
	source = replaceRemoteUrls(source);
	const dataUrl = `data:text/javascript;base64,${Buffer.from(source, "utf8").toString("base64")}`;
	const module = await import(dataUrl);
	const resolved = { module, dataUrl };
	moduleCache.set(url, resolved);
	return resolved;
}

module.exports = { importHttpModule };
