//B"H
//Boruch Hashem
//Blessed be He

/**
 * @file ui-crawl-harness.test.mjs
 * @description Freezes the mobile-first game crawl as a trustworthy release witness.
 * Awtsmoos.com tests viewport measurement, event attribution, source location, isolated
 * browser ownership, incremental receipts, and small-source invariants together.
 *
 * Architectural invariants:
 * - Every crawler module preserves the required blessing and remains below 120 lines.
 * - Each game owns one fresh browser target so asynchronous failures cannot cross titles.
 * - Surface suspicions remain review evidence rather than automatic hard failures.
 * - Completed audits are persisted before later titles can fail.
 */
import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';
import test from 'node:test';

const modules = [
	'../scripts/diagnostics/ui-crawl/config.mjs',
	'../scripts/diagnostics/ui-crawl/cdp-client.mjs',
	'../scripts/diagnostics/ui-crawl/server.mjs',
	'../scripts/diagnostics/ui-crawl/metrics.mjs',
	'../scripts/diagnostics/ui-crawl/surface-metrics.mjs',
	'../scripts/diagnostics/ui-crawl/surface-contract.mjs',
	'../scripts/diagnostics/ui-crawl/audit-game.mjs',
	'../scripts/diagnostics/ui-crawl/isolated-audit.mjs',
	'../scripts/diagnostics/ui-crawl/run.mjs'
];

function source(relativePath) {
	return readFileSync(new URL(relativePath, import.meta.url), 'utf8');
}

test('crawl harness modules keep revelation prefaces and small vessels', () => {
	for (const modulePath of modules) {
		const text = source(modulePath);
		assert.match(text, /B"H/);
		assert.match(text, /Boruch Hashem/);
		assert.match(text, /Blessed (?:is|be) He/);
		assert.match(text, /Awtsmoos\.com/);
		assert.ok(text.split(/\r?\n/).length <= 120, `${modulePath} exceeds 120 lines`);
	}
});

test('crawl harness models public root and mobile-first viewports', () => {
	const config = source('../scripts/diagnostics/ui-crawl/config.mjs');
	assert.match(config, /path\.resolve\(process\.cwd\(\), 'geelooy'\)/);
	assert.match(config, /width:\s*1440/);
	assert.match(config, /height:\s*900/);
	assert.match(config, /width:\s*390/);
	assert.match(config, /height:\s*844/);
});

test('later measured shell presence reconciles an earlier readiness timeout', () => {
	const audit = source('../scripts/diagnostics/ui-crawl/audit-game.mjs');
	const measurementIndex = audit.indexOf('record.desktop = await client.evaluate(desktopExpression);');
	const reconcileIndex = audit.indexOf('record.ready = record.ready || record.desktop.shellCount === 1;');
	const finalIndex = audit.indexOf('finalizeRecord(record);');
	assert.ok(measurementIndex >= 0);
	assert.ok(reconcileIndex > measurementIndex);
	assert.ok(finalIndex > reconcileIndex);
});

test('browser readyState remains evidence rather than a hard readiness gate', () => {
	const audit = source('../scripts/diagnostics/ui-crawl/audit-game.mjs');
	const metrics = source('../scripts/diagnostics/ui-crawl/metrics.mjs');
	assert.doesNotMatch(audit, /document\.readyState === 'complete'/);
	assert.match(metrics, /readyState:\s*document\.readyState/);
});

test('surface measurement names escaped UI and review suspicions', () => {
	const surface = source('../scripts/diagnostics/ui-crawl/surface-metrics.mjs');
	assert.match(surface, /offscreenInteractives/);
	assert.match(surface, /offscreenPanels/);
	assert.match(surface, /fixedOverlapSuspicions/);
	assert.match(surface, /defaultControlSuspicions/);
	assert.match(surface, /intersectsViewport/);
});

test('surface hard failures stay separate from review suspicions', () => {
	const contract = source('../scripts/diagnostics/ui-crawl/surface-contract.mjs');
	assert.match(contract, /offscreen-interactives/);
	assert.match(contract, /offscreen-panels/);
	assert.match(contract, /hasSurfaceSuspicions/);
	assert.doesNotMatch(contract, /issues\.push\(`fixed-overlap/);
});

test('exception witnesses preserve source location and stack frames', () => {
	const audit = source('../scripts/diagnostics/ui-crawl/audit-game.mjs');
	assert.match(audit, /details\.exception\?\.description/);
	assert.match(audit, /stackTrace\?\.callFrames/);
	assert.match(audit, /lineNumber/);
});

test('runner persists each completed audit before moving onward', () => {
	const runner = source('../scripts/diagnostics/ui-crawl/run.mjs');
	assert.match(runner, /results\.push\(result\);\s*persist\(\);/s);
	assert.match(runner, /finally/);
	assert.match(runner, /server\.stop\(\)/);
});


test('each game owns a fresh browser target and closes it deterministically', () => {
	const isolated = source('../scripts/diagnostics/ui-crawl/isolated-audit.mjs');
	const runner = source('../scripts/diagnostics/ui-crawl/run.mjs');
	const exactHeader = '//B\"H\n//Boruch Hashem\n//Blessed be He\n';
	assert.equal(isolated.startsWith(exactHeader), true);
	assert.equal(runner.startsWith(exactHeader), true);
	assert.match(isolated, /MerkavaCdpClient\.create\(\)/);
	assert.match(isolated, /finally[\s\S]*client\.close\(\)/);
	assert.match(runner, /auditGameIsolated\(server\.origin, slug\)/);
	assert.doesNotMatch(runner, /MerkavaCdpClient/);
});
