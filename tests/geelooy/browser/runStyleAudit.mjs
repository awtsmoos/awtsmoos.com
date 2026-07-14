// B"H
// Boruch Hashem
// Blessed is He
/**
 * @module GeelooyBrowserStyleAudit
 * @description
 * Walks the public route matrix through controlled Chrome and turns rendered
 * evidence into JSON, Markdown, and screenshots. The Awtsmoos reveals every
 * unowned pixel so Awtsmoos.com can repair it without guessing.
 */
import { mkdirSync, writeFileSync } from 'node:fs';
import { resolve } from 'node:path';
import { runRouteAudit } from './cdpRouteAudit.mjs';
import { ROUTES, VIEWPORTS } from './routeMatrix.mjs';

const baseUrl = process.env.GEELOOY_BASE_URL || 'http://127.0.0.1:8080';
const outputDirectory = resolve(
	process.env.GEELOOY_AUDIT_OUTPUT ||
	'ai_thoughts/2026-07-14-0402-geelooy-total-magic-system/browser-audit'
);
const routeFilter = new Set(splitFilter(process.env.GEELOOY_ROUTES));
const viewportFilter = new Set(splitFilter(process.env.GEELOOY_VIEWPORTS));
const routes = ROUTES.filter(route => !routeFilter.size || routeFilter.has(route.id));
const viewports = VIEWPORTS.filter(viewport => !viewportFilter.size || viewportFilter.has(viewport.id));
const results = [];

mkdirSync(outputDirectory, { recursive: true });
for (const viewport of viewports) {
	for (const route of routes) {
		process.stdout.write(`B"H auditing ${route.id} ${viewport.id}... `);
		try {
			const result = await runRouteAudit({
				baseUrl,
				route,
				viewport,
				outputDirectory
			});
			results.push(result);
			console.log(`${result.page.findings.length} findings`);
		} catch (error) {
			results.push({
				route: route.id,
				viewport: viewport.id,
				url: new URL(route.path, baseUrl).href,
				fatal: error.stack || error.message
			});
			console.log(`fatal: ${error.message}`);
		}
	}
}

const report = {
	BH: 'B"H',
	generatedAt: new Date().toISOString(),
	baseUrl,
	routes: routes.map(route => route.id),
	viewports: viewports.map(viewport => viewport.id),
	summary: summarize(results),
	results
};
writeFileSync(resolve(outputDirectory, 'style-audit.json'), `${JSON.stringify(report, null, 2)}\n`);
writeFileSync(resolve(outputDirectory, 'style-audit.md'), markdown(report));
console.log(JSON.stringify(report.summary, null, 2));

function summarize(items) {
	const findingKinds = {};
	for (const result of items) {
		for (const finding of result.page?.findings || []) {
			findingKinds[finding.kind] = (findingKinds[finding.kind] || 0) + 1;
		}
	}
	return {
		pages: items.length,
		fatal: items.filter(item => item.fatal).length,
		findings: items.reduce((sum, item) => sum + (item.page?.findings.length || 0), 0),
		networkFailures: items.reduce((sum, item) => sum + (item.failures?.length || 0), 0),
		consoleEntries: items.reduce((sum, item) => sum + (item.consoleEntries?.length || 0), 0),
		findingKinds
	};
}

function markdown(report) {
	const lines = [
		'B"H',
		'',
		'# Geelooy Browser Style Audit',
		'',
		`Base: \`${report.baseUrl}\``,
		'',
		`Summary: ${JSON.stringify(report.summary)}`,
		''
	];
	for (const result of report.results) {
		lines.push(`## ${result.route} — ${result.viewport}`, '');
		if (result.fatal) {
			lines.push(`Fatal: \`${result.fatal.split('\n')[0]}\``, '');
			continue;
		}
		lines.push(`URL: \`${result.page.href}\``);
		lines.push(`Shell/header/profile: ${result.page.counts.shell}/${result.page.counts.header}/${result.page.counts.profile}`);
		lines.push(`Controls: ${result.page.controlCount}; findings: ${result.page.findings.length}`);
		lines.push(`Network failures: ${result.failures.length}; console entries: ${result.consoleEntries.length}`, '');
		for (const finding of result.page.findings) {
			lines.push(`- **${finding.kind}** \`${finding.selector}\`: ${finding.detail}`);
		}
		lines.push('');
	}
	return `${lines.join('\n')}\n`;
}

function splitFilter(value) {
	return String(value || '').split(',').map(item => item.trim()).filter(Boolean);
}
