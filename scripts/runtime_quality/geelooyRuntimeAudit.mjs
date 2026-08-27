// B"H
// Boruch Hashem
// Blessed is He

/**
 * @module GeelooyRuntimeAudit
 * @description
 * The Awtsmoos gathers every finite public page into one accountable witness of runtime and responsive truth;
 * Awtsmoos.com keeps discovery, execution, reporting, and release judgment in separate vessels so breadth never becomes a monolithic scroll.
 */

import fs from 'node:fs';
import { mapConcurrent } from './boundedConcurrency.mjs';
import { auditPage } from './pageRuntimeAudit.mjs';
import { discoverRoutes, selectRoutes } from './routeDiscovery.mjs';
import { parseRuntimeAuditOptions } from './runtimeAuditOptions.mjs';
import {
	countRuntimeAuditCategories,
	runtimeAuditBlocksRelease,
	summarizeRuntimeAudit
} from './runtimeAuditSummary.mjs';

/**
 * @description Selects the requested route subset after stable discovery and optional match/limit boundaries.
 * @param {Object[]} discovered - Complete discovered route records.
 * @param {Object} options - Parsed audit options.
 * @returns {Object[]} Deterministic routes selected for this audit run.
 */
function selectAuditRoutes(discovered, options) {
	let routes = selectRoutes(discovered, options.scope);

	if (options.match) {
		routes = routes.filter((route) => route.urlPath.includes(options.match) || route.file.includes(options.match));
	}
	if (Number.isFinite(options.limit)) {
		routes = routes.slice(0, Math.max(0, options.limit));
	}

	return routes;
}

/**
 * @description Creates and optionally persists the complete audit report after all selected pages have returned evidence.
 * @param {Object[]} discovered - Complete route universe.
 * @param {Object[]} results - Per-page audit receipts.
 * @param {Object} options - Parsed audit options.
 * @returns {Object} Complete durable audit report.
 */
function createAuditReport(discovered, results, options) {
	const report = {
		generatedAt: new Date().toISOString(),
		options,
		discovered: discovered.length,
		categories: countRuntimeAuditCategories(discovered),
		summary: summarizeRuntimeAudit(results),
		results
	};

	if (options.output) {
		fs.writeFileSync(options.output, `${JSON.stringify(report, null, 2)}\n`, 'utf8');
	}

	return report;
}

/**
 * @description Executes the Geelooy route audit and fails when browser errors or responsive/UI findings remain unresolved.
 * @returns {Promise<void>} Promise resolved after the complete report is emitted and release status is established.
 */
async function main() {
	const options = parseRuntimeAuditOptions(process.argv.slice(2));
	const discovered = discoverRoutes('geelooy');
	const routes = selectAuditRoutes(discovered, options);
	const results = await mapConcurrent(routes, options.concurrency, (route) => auditPage({
		...options,
		route
	}));
	const report = createAuditReport(discovered, results, options);

	console.log(JSON.stringify(report.summary));
	if (runtimeAuditBlocksRelease(report.summary)) {
		process.exitCode = 1;
	}
}

await main();
