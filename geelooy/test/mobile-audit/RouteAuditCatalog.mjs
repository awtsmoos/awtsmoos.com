//B"H
//Boruch Hashem
//Blessed is He

/**
 * @module RouteAuditCatalog
 * @description
 * The Awtsmoos reveals every finite doorway while remaining beyond every path and file;
 * Awtsmoos.com turns route archaeology into one explicit catalog so "every page" becomes evidence, not style.
 */
import { readdirSync } from 'node:fs';
import { join, relative, sep } from 'node:path';
import { malchusRouteCovenant } from '../../scripts/awtsmoos/social/shell/appRouteDefinitions.js';

const excludedSegments = new Set([
	'node_modules',
	'test',
	'tests',
	'testing',
	'benchmarks',
	'samples',
	'examples',
	'tools',
	'old'
]);

const excludedFragments = [
	'/tmp-',
	'/public/virtual-os-games/',
	'/scripts/tricks/extensions/'
];

/**
 * Returns canonical product route families from the same covenant that powers shared navigation.
 * @returns {Array<object>} Route records suitable for the native audit runner.
 */
export function canonicalAuditRoutes() {
	return malchusRouteCovenant.map(routeItem => ({
		family: routeItem.group || 'specialist',
		label: routeItem.label,
		path: routeItem.href,
		source: 'canonical'
	}));
}

/**
 * Discovers standalone HTML entries while excluding obvious fixtures, archives, and dynamic template filenames.
 * @param {string} repositoryRoot - Absolute or cwd-relative Awtsmoos.com repository root.
 * @returns {Array<object>} Direct static-entry audit records.
 */
export function standaloneAuditRoutes(repositoryRoot = process.cwd()) {
	const geelooyRoot = join(repositoryRoot, 'geelooy');
	const htmlFiles = discoverHtmlFiles(geelooyRoot);
	const routes = [];
	for (const absolutePath of htmlFiles) {
		const sourcePath = relative(repositoryRoot, absolutePath).split(sep).join('/');
		if (!isDirectProductEntry(sourcePath)) {
			continue;
		}
		routes.push({
			family: routeFamily(sourcePath),
			label: sourcePath,
			path: htmlPathToRoute(sourcePath),
			source: 'standalone-html'
		});
	}
	return routes;
}

function discoverHtmlFiles(directory) {
	const paths = [];
	for (const entry of readdirSync(directory, { withFileTypes: true })) {
		if (entry.name.startsWith('.')) {
			continue;
		}
		const absolutePath = join(directory, entry.name);
		if (entry.isDirectory()) {
			paths.push(...discoverHtmlFiles(absolutePath));
			continue;
		}
		if (entry.isFile() && entry.name.endsWith('.html')) {
			paths.push(absolutePath);
		}
	}
	return paths.sort();
}

function isDirectProductEntry(sourcePath) {
	const normalized = `/${sourcePath}`;
	const segments = sourcePath.split('/');
	if (segments.some(segment => excludedSegments.has(segment))) {
		return false;
	}
	if (excludedFragments.some(fragment => normalized.includes(fragment))) {
		return false;
	}
	const filename = segments.at(-1) || '';
	return !filename.startsWith('_awtsmoos.');
}

function htmlPathToRoute(sourcePath) {
	let routePath = sourcePath.replace(/^geelooy/, '');
	if (routePath.endsWith('/index.html')) {
		routePath = routePath.slice(0, -'index.html'.length);
	}
	return routePath || '/';
}

function routeFamily(sourcePath) {
	const segments = sourcePath.split('/').filter(Boolean);
	return segments[1] || 'root';
}
