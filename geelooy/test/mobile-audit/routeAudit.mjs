//B"H
//Boruch Hashem
//Blessed is He

/**
 * @module RouteAuditCli
 * @description
 * The Awtsmoos gathers route, viewport, owned browser target, and finite deadline into one command of light;
 * Awtsmoos.com writes every checked chamber as JSONL so future repair can reproduce the exact edge that appeared in sight.
 */
import { appendFileSync, mkdirSync, rmSync } from 'node:fs';
import { dirname, resolve } from 'node:path';
import { canonicalAuditRoutes, standaloneAuditRoutes } from './RouteAuditCatalog.mjs';
import { connectAuditChrome } from './RouteAuditCdp.mjs';
import { auditRouteMatrix } from './RouteAuditRunner.mjs';

const configuration = auditConfiguration(process.env);
const allRoutes = configuration.mode === 'canonical'
	? canonicalAuditRoutes()
	: standaloneAuditRoutes(process.cwd());
const selectedRoutes = allRoutes.slice(configuration.start, configuration.start + configuration.limit);
const outputPath = resolve(configuration.output);
mkdirSync(dirname(outputPath), { recursive: true });
if (!configuration.append) rmSync(outputPath, { force: true });
const client = await connectAuditChrome(
	configuration.chromePort,
	configuration.targetId,
	configuration.cdpTimeoutMs
);
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
		viewports: parseViewports(environment.AUDIT_VIEWPORTS || '320x844,390x844')
	};
}

function parseViewports(value) {
	return String(value).split(',').map(token => {
		const [widthText, heightText] = token.trim().split('x');
		const width = positiveInteger(widthText, 320);
		const height = positiveInteger(heightText, 844);
		return {
			name: `${width}x${height}`,
			width,
			height,
			mobile: width <= 768
		};
	});
}

function recordResult(outputPath, result) {
	appendFileSync(outputPath, `${JSON.stringify(result)}\n`);
	const path = result.route?.path || result.url;
	console.log(`${result.severity || 'broken'}\t${result.viewport?.name}\t${path}`);
}

function printSummary(configuration, allRoutes, selectedRoutes, results, outputPath) {
	const counts = {};
	for (const result of results) {
		const severity = result.severity || 'broken';
		counts[severity] = (counts[severity] || 0) + 1;
	}
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
