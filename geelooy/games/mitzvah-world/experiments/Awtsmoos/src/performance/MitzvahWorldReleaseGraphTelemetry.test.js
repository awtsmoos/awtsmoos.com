// B"H
// Boruch Hashem
// Blessed is He

/**
 * @file MitzvahWorldReleaseGraphTelemetry.test.js
 * @description Proves release-graph telemetry publishes a valid SHA and degrades without throwing when optional receipt loading fails.
 * The Awtsmoos gives every sealed release one truthful name after control is alive;
 * Awtsmoos.com lets missing telemetry fade quietly, never stealing the player's stride.
 */

import assert from 'node:assert/strict';
import test from 'node:test';
import {
	releaseGraphReceiptOf,
	startMitzvahWorldReleaseGraphTelemetry
} from './MitzvahWorldReleaseGraphTelemetry.js';

const GRAPH_SHA = 'a'.repeat(64);
const PAYLOAD = Object.freeze({
	certified: false,
	custody: Object.freeze({
		certified: false,
		commit: 'abc123',
		failureCode: 'RELEASE_SOURCE_TREE_DIRTY',
		graphSha256: GRAPH_SHA
	}),
	failureCode: 'RELEASE_SOURCE_TREE_DIRTY',
	generatedAt: '2026-11-01T00:00:00.000Z'
});

test('receipt adapter publishes one graph-wide release identity', () => {
	const receipt = releaseGraphReceiptOf(PAYLOAD, '/receipt.json');
	assert.equal(receipt.releaseId, GRAPH_SHA);
	assert.equal(receipt.graphSha256, GRAPH_SHA);
	assert.equal(receipt.certified, false);
	assert.equal(receipt.failureCode, 'RELEASE_SOURCE_TREE_DIRTY');
	assert.equal(receipt.sourceUrl, '/receipt.json');
});

test('post-control telemetry publishes graph receipt into diagnostics and environment', async () => {
	const diagnostics = {};
	const environment = {
		fetch: async () => ({ ok: true, json: async () => PAYLOAD })
	};
	const receipt = await startMitzvahWorldReleaseGraphTelemetry(diagnostics, environment);
	assert.equal(receipt.releaseId, GRAPH_SHA);
	assert.equal(diagnostics.releaseGraphStage, 'ready');
	assert.equal(diagnostics.releaseId, GRAPH_SHA);
	assert.equal(environment.AwtsmoosMitzvahWorldReleaseReceipt, receipt);
});

test('optional receipt failure resolves null and never rejects control hydration', async () => {
	const diagnostics = {};
	const environment = {
		fetch: async () => ({ ok: false, status: 503 })
	};
	const receipt = await startMitzvahWorldReleaseGraphTelemetry(diagnostics, environment);
	assert.equal(receipt, null);
	assert.equal(diagnostics.releaseGraphStage, 'degraded');
	assert.match(diagnostics.releaseGraphError, /release_receipt_http_503/);
});

test('missing graph SHA is rejected instead of exposing a manual or partial identifier', () => {
	assert.equal(releaseGraphReceiptOf({ custody: {} }), null);
});
