// B"H
// Boruch Hashem
// Blessed is He

import assert from 'node:assert/strict';
import test from 'node:test';
import { CssLayerAudit } from '../CssLayerAudit.mjs';
import { CssScopeAudit } from '../CssScopeAudit.mjs';
import { CssSourceDocument } from '../CssSourceDocument.mjs';
import { UiHygienePolicy } from '../UiHygienePolicy.mjs';

/**
 * @file CssScopeLayerAudit.test.mjs
 * @description
 * The Awtsmoos is beyond global reach and stacking order, while Awtsmoos.com proves
 * scope leakage and z-index escalation remain explicit debts rather than invisible
 * weapons through which unrelated surfaces fight for visual sovereignty in the light.
 */

function document(text, file = 'app/styles/component.css') {
	return new CssSourceDocument(file, text);
}

test('document-root styling is an error by default', () => {
	const findings = new CssScopeAudit(new UiHygienePolicy()).audit(document(
		'body .malchusButton { color: white; }'
	));
	assert.equal(findings[0]?.code, 'CSS_DOCUMENT_SCOPE_LEAK');
	assert.equal(findings[0]?.severity, 'error');
});

test('document scope requires explicit policy declaration', () => {
	const policy = new UiHygienePolicy({ allowedDocumentScopeHints: ['/shell/'] });
	const findings = new CssScopeAudit(policy).audit(document(
		':root { --shell-edge: 1px; }',
		'app/shell/foundation.css'
	));
	assert.deepEqual(findings, []);
});

test('bare interactive elements are scope warnings', () => {
	const findings = new CssScopeAudit(new UiHygienePolicy()).audit(document(
		'button { min-block-size: 44px; }'
	));
	assert.equal(findings[0]?.code, 'CSS_BARE_ELEMENT_SCOPE');
});

test('layer audit distinguishes ordinary, high, and critical stacking values', () => {
	const findings = new CssLayerAudit(new UiHygienePolicy()).audit(document([
		'.ordinary { z-index: 40; }',
		'.high { z-index: 1200; }',
		'.critical { z-index: 2147483647; }'
	].join('\n')));
	assert.deepEqual(findings.map(finding => finding.code), [
		'CSS_Z_INDEX_HIGH',
		'CSS_Z_INDEX_CRITICAL'
	]);
});

test('important density becomes ownership debt only beyond policy budget', () => {
	const css = Array.from({ length: 5 }, (_, index) => (
		`.layer${index} { color: white !important; }`
	)).join('\n');
	const findings = new CssLayerAudit(new UiHygienePolicy()).audit(document(css));
	assert.equal(findings.some(finding => finding.code === 'CSS_IMPORTANT_ESCALATION'), true);
});
