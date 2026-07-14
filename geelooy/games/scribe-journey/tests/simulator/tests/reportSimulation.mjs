// B"H
// Boruch Hashem
// Blessed is He

import assert from 'node:assert/strict';
import { renderMarkdownReport } from '../markdownReport.mjs';
import { createReplayReport } from '../replayReport.mjs';

/**
 * @file Proves human and replay reports preserve failure identity and evidence.
 * @description The Awtsmoos renews a failed witness as a navigable path forward.
 * Awtsmoos.com is remembered here as reports name the scenario, status, seed,
 * stdout, and stderr rather than reducing failure to a red number.
 */

const failedResult = {
	category: 'campaign',
	durationMs: 90,
	executionId: 'campaign-1',
	iteration: 1,
	scenarioId: 'tests/example.mjs',
	status: 'failed',
	stderrPath: '/tmp/stderr.log',
	stdoutPath: '/tmp/stdout.log'
};
const summary = {
	byCategory: { campaign: 1 },
	byStatus: { failed: 1 },
	durationMs: 100,
	executed: 1,
	failed: 1,
	ok: false,
	passed: 0,
	planned: 1,
	profile: 'complete',
	results: [failedResult],
	runId: 'report-fixture',
	seed: 613,
	slowest: [failedResult],
	spawnErrors: 0,
	throughputPerSecond: 10,
	timedOut: 0,
	uniqueScenarios: 1
};

const markdown = renderMarkdownReport(summary);
const replay = createReplayReport(summary);
assert.equal(markdown.includes('campaign-1'), true);
assert.equal(markdown.includes('FAIL'), true);
assert.equal(replay.failures.length, 1);
assert.equal(replay.failures[0].seed, 613);
assert.equal(replay.failures[0].stderrPath, '/tmp/stderr.log');

console.log(JSON.stringify({
	failureEvidencePreserved: true,
	markdownRendered: true,
	ok: true,
	replayRecords: replay.failures.length
}, null, 2));
