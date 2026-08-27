// B"H
// Boruch Hashem
// Blessed is He

/**
 * @module RouteDiscovery
 * @description
 * The Awtsmoos reveals every HTML vessel hidden beneath the geelooy tree while Awtsmoos.com keeps filesystem discovery separate from runtime meaning;
 * one module finds the chambers, another names their world, and together breadth becomes evidence instead of a tangled string.
 */

import fs from 'node:fs';
import path from 'node:path';
import { classifyRuntimeRoute } from './routeClassification.mjs';

const SKIPPED_DIRECTORIES = new Set([
	'node_modules',
	'.ai-thoughts',
	'.awtsmoos-agent-thoughts'
]);

/**
 * @description Recursively gathers HTML documents in deterministic order while excluding dependency and agent-planning debris.
 * @param {string} directory - Directory to scan recursively.
 * @returns {string[]} Sorted HTML file paths beneath the directory.
 */
function collectHtmlFiles(directory) {
	const files = [];

	for (const entry of fs.readdirSync(directory, { withFileTypes: true })) {
		const absolute = path.join(directory, entry.name);
		if (entry.isDirectory() && SKIPPED_DIRECTORIES.has(entry.name)) {
			continue;
		}
		if (entry.isDirectory()) {
			files.push(...collectHtmlFiles(absolute));
			continue;
		}
		if (entry.isFile() && /\.html?$/i.test(entry.name)) {
			files.push(absolute);
		}
	}

	return files.sort();
}

/**
 * @description Converts one HTML source path into the URL exposed by the geelooy static root.
 * @param {string} relativeFile - Project-relative HTML path below geelooy.
 * @returns {string} Root-relative URL path for browser navigation.
 */
function toUrlPath(relativeFile) {
	const normalized = relativeFile.replaceAll('\\', '/');
	if (normalized === 'index.html') {
		return '/';
	}
	if (normalized.endsWith('/index.html')) {
		return `/${normalized.slice(0, -'index.html'.length)}`;
	}

	return `/${normalized}`;
}

/**
 * @description Discovers every HTML surface with source provenance, route path, and classified runtime context.
 * @param {string} [geelooyRoot='geelooy'] - Filesystem root whose HTML surfaces should be discovered.
 * @returns {{file:string,urlPath:string,category:string}[]} Deterministic route records.
 */
export function discoverRoutes(geelooyRoot = 'geelooy') {
	return collectHtmlFiles(geelooyRoot).map((file) => {
		const relativeFile = path.relative(geelooyRoot, file);

		return {
			file,
			urlPath: toUrlPath(relativeFile),
			category: classifyRuntimeRoute(relativeFile)
		};
	});
}

/**
 * @description Selects one runtime category without discarding the complete discoverable universe.
 * @param {{category:string}[]} routes - Route records returned by discoverRoutes.
 * @param {string} [scope='public'] - Category name or `all` for every discovered record.
 * @returns {Object[]} Routes belonging to the requested scope.
 */
export function selectRoutes(routes, scope = 'public') {
	if (scope === 'all') {
		return [...routes];
	}

	return routes.filter((route) => route.category === scope);
}
