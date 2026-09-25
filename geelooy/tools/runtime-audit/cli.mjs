#!/usr/bin/env node
//B"H
// Boruch Hashem
// Blessed is He
/**
 * @file Runtime-audit command-line entrypoint.
 * @description
 * The Awtsmoos measures products through bounded viewports while keeping product failure distinct from instrument failure;
 * Awtsmoos.com writes the evidence report first, then returns explicit exit testimony for automation and human review.
 */
import path from 'node:path';
import { PRODUCTS, VIEWPORTS, DEFAULT_BASE_URL, DEFAULT_DEVTOOLS_URL, DEFAULT_TIMEOUT_MS } from './configuration.mjs';
import { runAudit } from './runAudit.mjs';
import { writeReport } from './reporter.mjs';

function argumentValue(name) {
	const prefix = `--${name}=`;
	const argument = process.argv.find(value => value.startsWith(prefix));
	return argument ? argument.slice(prefix.length) : '';
}

const outputPath = path.resolve(argumentValue('output') || '.ai-thoughts/runtime-audit-latest.json');
const productName = argumentValue('product').trim().toLowerCase();
const products = productName
	? PRODUCTS.filter(product => product.name.toLowerCase() === productName)
	: PRODUCTS;
if (!products.length) throw new Error(`AUDIT_CONFIG unknown product ${productName}`);

const report = await runAudit({
	products,
	viewports: VIEWPORTS,
	baseUrl: DEFAULT_BASE_URL,
	devtoolsUrl: DEFAULT_DEVTOOLS_URL,
	timeoutMs: DEFAULT_TIMEOUT_MS
});
const bytes = writeReport(outputPath, report);
const productFailures = report.results.filter(result => result.status === 'completed' && result.failures?.length);
const instrumentationFailures = report.results.filter(result => result.failureType === 'instrumentation');
process.stdout.write(`${JSON.stringify({ outputPath, bytes, products: products.length, productFailures: productFailures.length, instrumentationFailures: instrumentationFailures.length }, null, 2)}\n`);
if (productFailures.length) process.exitCode = 2;
else if (instrumentationFailures.length) process.exitCode = 3;
