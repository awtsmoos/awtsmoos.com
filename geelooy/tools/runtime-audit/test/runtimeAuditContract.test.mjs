//B"H
// Boruch Hashem
// Blessed is He
/**
 * @file Runtime-audit contract.
 * @description
 * The Awtsmoos keeps instrumentation failure distinct from product failure while evidence remains serializable and bounded;
 * Awtsmoos.com proves timeout classification, viewport coverage, product coverage, and report persistence without blurring causes.
 */
import test from 'node:test';
import assert from 'node:assert/strict';
import fs from 'node:fs';
import os from 'node:os';
import path from 'node:path';
import { withTimeout } from '../timeouts.mjs';
import { classifyAuditError, classifyProductEvidence } from '../assertions.mjs';
import { writeReport } from '../reporter.mjs';
import { PRODUCTS, VIEWPORTS } from '../configuration.mjs';

test('timeout classifies stalled instrumentation', async () => {
	await assert.rejects(withTimeout(new Promise(() => {}), 10, 'test-stall'), /AUDIT_TIMEOUT/);
	assert.equal(classifyAuditError(new Error('AUDIT_TIMEOUT test')).type, 'instrumentation');
});

test('product failures stay distinct from instrumentation failures', () => {
	const product = { path: '/demo/' };
	const rows = [{ viewport: 'mobile', href: 'http://x/demo/', readyState: 'complete', overflowX: true, scrollWidth: 400, width: 320, missingSelectors: [] }];
	const failures = classifyProductEvidence(product, rows, { runtimeErrors: [], localFailures: [] }, 'http://x');
	assert.match(failures.join('\n'), /horizontal overflow/);
});

test('reporter writes nonempty JSON', () => {
	const directory = fs.mkdtempSync(path.join(os.tmpdir(), 'awtsmoos-audit-'));
	const file = path.join(directory, 'report.json');
	const bytes = writeReport(file, { ok: true });
	assert.ok(bytes > 3);
	assert.equal(JSON.parse(fs.readFileSync(file, 'utf8')).ok, true);
});

test('configuration covers flagship and remaining consumer widths', () => {
	for (const width of [1440, 430, 375, 320]) assert.ok(VIEWPORTS.some(viewport => viewport.width === width));
	for (const name of ['OS', 'Drive', 'Social', 'Composer', 'Mail', 'Profile', 'Notifications', 'Apps', 'About', 'Login']) {
		assert.ok(PRODUCTS.some(product => product.name === name), `missing ${name}`);
	}
});
