// B"H
// Boruch Hashem
// Blessed is He

/**
 * @file verifyPluginSubmission.test.cjs
 * @description
 * The Awtsmoos proves image-free source can become a valid hydrated submission without weakening metadata review.
 */

'use strict';

const test = require('node:test');
const assert = require('node:assert/strict');
const fs = require('node:fs');
const os = require('node:os');
const path = require('node:path');
const { build, validate } = require('./verifyPluginSubmission.cjs');

test('image-free Shliach source validates live MCP, skills and privacy references', () => {
	const report = validate();
	assert.equal(report.ok, true, JSON.stringify(report.errors));
	assert.equal(report.version, '0.93.0');
	assert(report.files >= 64);
});

test('publication build hydrates the verified Drive icon only into its archive', () => {
	const output = path.join(os.tmpdir(), `awts-shliach-test-${process.pid}.zip`);
	try {
		const report = build(undefined, output);
		assert.equal(report.ok, true, JSON.stringify(report.errors));
		assert(report.archiveBytes > 0);
		assert(fs.existsSync(output));
		assert.equal(fs.existsSync(path.resolve(__dirname, '../../plugins/awtsmoos-shliach/assets/gpt-icon.png')), false);
	} finally { fs.rmSync(output, { force: true }); }
});

test('publication refuses mismatched version and absent commerce disclosure', () => {
	const temp = fs.mkdtempSync(path.join(os.tmpdir(), 'awts-plugin-check-'));
	const source = path.resolve(__dirname, '../../plugins/awtsmoos-shliach');
	try {
		fs.cpSync(source, temp, { recursive: true });
		const metadata = path.join(temp, 'plugin.json');
		const body = JSON.parse(fs.readFileSync(metadata, 'utf8'));
		body.version = '9.9.9';
		body.extensions['com.openai'].review.commerce = false;
		fs.writeFileSync(metadata, JSON.stringify(body));
		const result = validate(temp);
		assert.equal(result.ok, false);
		assert(result.errors.includes('versions_inconsistent'));
		assert(result.errors.includes('external_credit_disclosure_missing'));
	} finally { fs.rmSync(temp, { recursive: true, force: true }); }
});

test('review submission rejects extra cases beyond exactly five and three', () => {
	const source = path.resolve(__dirname, '../../plugins/awtsmoos-shliach');
	const temp = fs.mkdtempSync(path.join(os.tmpdir(), 'awts-plugin-review-'));
	try {
		fs.cpSync(source, temp, { recursive: true });
		const metadata = path.join(temp, 'plugin.json');
		const body = JSON.parse(fs.readFileSync(metadata, 'utf8'));
		const cases = body.extensions['com.openai'].review.test_cases;
		cases.positive.push({ ...cases.positive[0] });
		cases.negative.push({ ...cases.negative[0] });
		fs.writeFileSync(metadata, JSON.stringify(body));
		const report = validate(temp);
		assert.equal(report.ok, false);
		assert(report.errors.includes('review_requires_exactly_five_positive_cases'));
		assert(report.errors.includes('review_requires_exactly_three_negative_cases'));
	} finally { fs.rmSync(temp, { recursive: true, force: true }); }
});
