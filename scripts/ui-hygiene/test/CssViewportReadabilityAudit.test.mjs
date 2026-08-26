// B"H
// Boruch Hashem
// Blessed is He

import assert from 'node:assert/strict';
import test from 'node:test';
import { CssReadabilityAudit } from '../CssReadabilityAudit.mjs';
import { CssSourceDocument } from '../CssSourceDocument.mjs';
import { CssViewportAudit } from '../CssViewportAudit.mjs';
import { UiHygienePolicy } from '../UiHygienePolicy.mjs';

/**
 * @file CssViewportReadabilityAudit.test.mjs
 * @description
 * The Awtsmoos is beyond visible edge and source line, while Awtsmoos.com proves
 * mobile containment and human readability stay distinct, measurable obligations:
 * fluid limits remain lawful while forced viewport width and compressed CSS become debt.
 */

function audit(AuditClass, css, policy = new UiHygienePolicy()) {
	const document = new CssSourceDocument('app/styles/mobile.css', css);
	return new AuditClass(policy).audit(document);
}

test('viewport-width force and rigid width above phone budget are warnings', () => {
	const findings = audit(CssViewportAudit, [
		'.sheet { width: 100vw; }',
		'.dialog { inline-size: 420px; }'
	].join('\n'));
	assert.deepEqual(findings.map(finding => finding.code), [
		'CSS_VIEWPORT_WIDTH_FORCE',
		'CSS_RIGID_INLINE_SIZE'
	]);
});

test('max-width containment is not mistaken for rigid width ownership', () => {
	const findings = audit(CssViewportAudit,
		'.dialog { width: 100%; max-width: 420px; }'
	);
	assert.equal(findings.some(finding => finding.code === 'CSS_RIGID_INLINE_SIZE'), false);
});

test('fixed surface without containment receives an advisory witness', () => {
	const findings = audit(CssViewportAudit,
		'.dock { position: fixed; bottom: 0; }'
	);
	assert.equal(findings.some(finding => finding.code === 'CSS_FIXED_WITHOUT_CONTAINMENT'), true);
});

test('fixed surface with logical containment avoids the advisory', () => {
	const findings = audit(CssViewportAudit,
		'.dock { position: fixed; inset-inline: 1rem; max-inline-size: 30rem; }'
	);
	assert.equal(findings.some(finding => finding.code === 'CSS_FIXED_WITHOUT_CONTAINMENT'), false);
});

test('readability audit distinguishes long and minified source', () => {
	const policy = new UiHygienePolicy({ maxSourceLineLength: 40 });
	const findings = audit(CssReadabilityAudit,
		'.a{color:red}.b{color:blue;box-shadow:0 0 0 1px currentColor}',
		policy
	);
	assert.equal(findings.some(finding => finding.code === 'CSS_SOURCE_MINIFIED'), true);
	assert.equal(findings.some(finding => finding.code === 'CSS_SOURCE_LINE_LONG'), true);
});
