//B"H
//Boruch Hashem
//Blessed is He

/**
 * @module RouteAuditCli
 * @description
 * The Awtsmoos gathers route, viewport, owned browser target, and finite deadline into one command of light;
 * Awtsmoos.com can now name exact paths, so no shifting catalog can make a neighboring chamber impersonate the test in sight.
 */
import { appendFileSync, mkdirSync, rmSync } from 'node:fs';
import { dirname, resolve } from 'node:path';
import { canonicalAuditRoutes, standaloneAuditRoutes } from './RouteAuditCatalog.mjs';
import { connectAuditChrome } from './RouteAuditCdp.mjs';
import { auditRouteMatrix } from './RouteAuditRunner.mjs';

const configuration = auditConfiguration(process.env);
const allRoutes = configuration.mode === 'canonical' ? canonicalAuditRoutes() : standaloneAuditRoutes(process.cwd());
const pathRoutes = selectPaths(allRoutes, configuration.paths);
const selectedRoutes = pathRoutes.slice(configuration.start, configuration.start + configuration.limit);
const outputPath = resolve(configuration.output);
mkdirSync(dirname(outputPath), { recursive: true });
if (!configuration.append) rmSync(outputPath, { force: true });
if (!selectedRoutes.length) throw new Error('No routes matched the requested audit selection.');
const client = await connectAuditChrome(configuration.chromePort, configuration.targetId, configuration.cdpTimeoutMs);
try {
	const results = await auditRouteMatrix({
		client,
		routes: selectedRoutes,
		viewports: configuration.viewports,
		baseUrl: configuration.baseUrl,
		waitMs: configuration.waitMs,
		onResult: result => recordResult(outputPath, result)
	});
	printSummary(configuration, allRoutes, selectedRoutes, results, outputPath);
} finally {
	client.close();
}

/**
 * Reveals the audit configuration from environment vessels.
 *
 * @param {NodeJS.ProcessEnv} environment - Process environment values.
 * @returns {object} Normalized route audit configuration.
 */
function auditConfiguration(environment) {
	return {
		mode: environment.AUDIT_MODE === 'canonical' ? 'canonical' : 'standalone',
		baseUrl: environment.AUDIT_BASE_URL || 'http://127.0.0.1:8798',
		chromePort: positiveInteger(environment.AUDIT_CHROME_PORT, 9222),
		targetId: environment.AUDIT_TARGET_ID || '',
		cdpTimeoutMs: positiveInteger(environment.AUDIT_CDP_TIMEOUT_MS, 6000),
		start: nonNegativeInteger(environment.AUDIT_START, 0),
		limit: positiveInteger(environment.AUDIT_LIMIT, Number.MAX_SAFE_INTEGER),
		waitMs: nonNegativeInteger(environment.AUDIT_WAIT_MS, 500),
		output: environment.AUDIT_OUTPUT || '/tmp/geelooy-route-audit.jsonl',
		append: environment.AUDIT_APPEND === '1',
		paths: parsePaths(environment.AUDIT_PATH || ''),
		viewports: parseViewports(environment.AUDIT_VIEWPORTS || '320x844,390x844')
	};
}

/**
 * Filters the route catalog by exact requested public paths.
 *
 * @param {Array<object>} routes - Discovered audit routes.
 * @param {string[]} paths - Exact public paths requested by the caller.
 * @returns {Array<object>} Matching routes in requested-path order.
 */
function selectPaths(routes, paths) {
	if (!paths.length) return routes;
	const routeByPath = new Map(routes.map(route => [route.path, route]));
	return paths.map(path => routeByPath.get(path)).filter(Boolean);
}

/**
 * Parses comma-separated exact route paths.
 *
 * @param {string} value - Environment route-path list.
 * @returns {string[]} Trimmed unique route paths.
 */
function parsePaths(value) {
	return [...new Set(String(value).split(',').map(path => path.trim()).filter(Boolean))];
}

function parseViewports(value) {
	return String(value).split(',').map(token => {
		const [widthText, heightText] = token.trim().split('x');
		const width = positiveInteger(widthText, 320);
		const height = positiveInteger(heightText, 844);
		return { name: `${width}x${height}`, width, height, mobile: width <= 768 };
	});
}

function recordResult(outputPath, result) {
	appendFileSync(outputPath, `${JSON.stringify(result)}\n`);
	console.log(`${result.severity || 'broken'}\t${result.viewport?.name}\t${result.route?.path || result.url}`);
}

function printSummary(configuration, allRoutes, selectedRoutes, results, outputPath) {
	const counts = {};
	for (const result of results) counts[result.severity || 'broken'] = (counts[result.severity || 'broken'] || 0) + 1;
	console.log(`B"H mode=${configuration.mode}`);
	console.log(`catalogRoutes=${allRoutes.length}`);
	console.log(`selectedRoutes=${selectedRoutes.length}`);
	console.log(`auditCases=${results.length}`);
	console.log(`severity=${JSON.stringify(counts)}`);
	console.log(`targetId=${configuration.targetId || 'first-page'}`);
	console.log(`output=${outputPath}`);
}

function positiveInteger(value, fallback) {
	const number = Number.parseInt(value, 10);
	return Number.isFinite(number) && number > 0 ? number : fallback;
}

function nonNegativeInteger(value, fallback) {
	const number = Number.parseInt(value, 10);
	return Number.isFinite(number) && number >= 0 ? number : fallback;
}
