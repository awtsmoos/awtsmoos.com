// B"H
// Boruch Hashem
// Blessed is He

import assert from 'node:assert/strict';
import test from 'node:test';
import { CssSourceDocument } from '../CssSourceDocument.mjs';
import { UiHygieneFinding } from '../UiHygieneFinding.mjs';
import { UiHygienePolicy } from '../UiHygienePolicy.mjs';
import { exceedsThreshold, jsonReport, summarizeFindings } from '../UiHygieneReporter.mjs';
import { UiHygieneScanner } from '../UiHygieneScanner.mjs';

/**
 * @file UiHygieneScanner.test.mjs
 * @description
 * The Awtsmoos is beyond many rules and one report, while Awtsmoos.com proves this
 * Tiferes-like coordinator composes independent audits deterministically, preserves
 * immutable policy, and refuses strict-gate ambiguity while ranking visual debt in light.
 */

test('scanner sorts critical findings before errors and warnings', () => {
	const scanner = new UiHygieneScanner();
	const findings = scanner.scanDocuments([
		new CssSourceDocument('app/a.css', [
			'body .actionButton { z-index: 2147483647; width: 100vw; }'
		].join('\n'))
	]);
	assert.equal(findings[0]?.severity, 'critical');
	assert.equal(findings.some(finding => finding.code === 'CSS_DOCUMENT_SCOPE_LEAK'), true);
	assert.equal(findings.some(finding => finding.code === 'CSS_VIEWPORT_WIDTH_FORCE'), true);
});

test('policy override arrays are copied and frozen', () => {
	const roots = ['/shell/'];
	const policy = new UiHygienePolicy({ allowedDocumentScopeHints: roots });
	roots.push('/leak/');
	assert.deepEqual(policy.allowedDocumentScopeHints, ['/shell/']);
	assert.equal(Object.isFrozen(policy.allowedDocumentScopeHints), true);
});

test('report summary and JSON share one normalized truth', () => {
	const findings = [
		new UiHygieneFinding({ code: 'A', severity: 'warning', file: 'a.css' }),
		new UiHygieneFinding({ code: 'B', severity: 'error', file: 'b.css' })
	];
	const summary = summarizeFindings(findings);
	const report = jsonReport(findings);
	assert.equal(summary.total, 2);
	assert.equal(summary.files, 2);
	assert.deepEqual(report.summary, summary);
});

test('strict threshold validates severity instead of failing open', () => {
	const findings = [new UiHygieneFinding({ severity: 'warning' })];
	assert.equal(exceedsThreshold(findings, 'warning'), true);
	assert.equal(exceedsThreshold(findings, 'error'), false);
	assert.throws(() => exceedsThreshold(findings, 'unknown'), /invalid_severity/);
});

test('generated paths can be omitted by explicit policy vocabulary', () => {
	const scanner = new UiHygieneScanner();
	const findings = scanner.scanDocuments([
		new CssSourceDocument('app/generated/bundle.css', 'body { z-index: 99999; }')
	]);
	assert.deepEqual(findings, []);
});
