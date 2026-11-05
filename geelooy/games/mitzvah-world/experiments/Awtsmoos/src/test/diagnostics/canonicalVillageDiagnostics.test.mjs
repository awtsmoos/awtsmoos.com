// B"H
// Boruch Hashem
// Blessed is He

/**
 * @file canonicalVillageDiagnostics.test.mjs
 * @description Protects deterministic terrain, roads, identity, foundations, arrival, and bridge.
 * The Awtsmoos needs no image to reveal coherence; Awtsmoos.com proves through ordered logs
 * that every tier preserves named places, safe roads, supported structures, and water clearance.
 */

import assert from 'node:assert/strict';
import test from 'node:test';
import { diagnosticEventsToJsonLines } from '../../diagnostics/logs/DiagnosticTextFormatter.js';
import { runVillageDiagnostics } from '../../diagnostics/logs/VillageDiagnosticsRunner.js';

const QUALITIES = Object.freeze(['low', 'medium', 'high', 'cinematic']);
const CANONICAL_IDENTITY_COUNT = 28;
const FOUNDATION_COUNT = 26;

test('all quality tiers produce deterministic zero-error logs-only reports', () => {
	const first = runVillageDiagnostics({ qualities: QUALITIES });
	const second = runVillageDiagnostics({ qualities: QUALITIES });
	assert.deepEqual(first, second);
	assert.equal(first.summary.error, 0);
	assert.equal(first.summary.fatal, 0);
	assert.equal(first.summary.warning, 0);
	assert.equal(first.summary.ok, true);
	assertRequiredCodes(first.events);
	assertEventCount(first.events, 'architecture.landmark.complete', QUALITIES.length * 4);
	assertEventCount(first.events, 'arrival.surfaceConformity.valid', QUALITIES.length);
	assertEventCount(first.events, 'bridge.clearance.valid', QUALITIES.length);
	assertCanonicalIdentities(first.events);
	assertFoundations(first.events);
	assertRoadGrades(first.events);
	const jsonLines = diagnosticEventsToJsonLines(first.events);
	assert.equal(jsonLines.split(String.fromCharCode(10)).length, first.events.length);
});

function assertRequiredCodes(events) {
	const codes = events.map((event) => event.code);
	for (const required of requiredCodes()) {
		assert.ok(codes.includes(required), `missing diagnostic code ${required}`);
	}
}

function assertEventCount(events, code, expected) {
	assert.equal(
		events.filter((event) => event.code === code).length,
		expected,
		`unexpected event count for ${code}`
	);
}

function assertCanonicalIdentities(events) {
	const identityEvents = events.filter((event) => {
		return event.code === 'canonical.identityAnchors.valid';
	});
	assert.equal(identityEvents.length, QUALITIES.length);
	for (const quality of QUALITIES) {
		const event = identityEvents.find((item) => item.data.quality === quality);
		assert.ok(event, `missing exact identity event for ${quality}`);
		assert.equal(event.data.actual, CANONICAL_IDENTITY_COUNT);
		assert.equal(event.data.expected, CANONICAL_IDENTITY_COUNT);
		assert.deepEqual(event.data.missing, []);
		assert.deepEqual(event.data.duplicates, []);
	}
}

function assertFoundations(events) {
	const foundationEvents = events.filter((event) => {
		return event.code === 'foundation.support.valid';
	});
	assert.equal(foundationEvents.length, QUALITIES.length);
	for (const event of foundationEvents) {
		assert.equal(event.data.actual, FOUNDATION_COUNT);
		assert.equal(event.data.expected, FOUNDATION_COUNT);
		assert.deepEqual(event.data.missing, []);
		assert.deepEqual(event.data.duplicates, []);
		assert.deepEqual(event.data.invalid, []);
		assert.ok(event.data.minimumClearance >= 0);
	}
}

function assertRoadGrades(events) {
	const event = events.find((item) => item.code === 'road.grade.valid');
	assert.ok(event, 'missing dense road grade evidence');
	assert.equal(event.data.routes.length, 11);
	assert.equal(event.data.nonFiniteRoutes.length, 0);
	assert.ok(event.data.maximumGrade <= event.data.maximumAllowedGrade);
}

function requiredCodes() {
	return [
		'canonical.contract.loaded',
		'canonical.identifiers.valid',
		'canonical.identityAnchors.valid',
		'road.graph.connected',
		'road.graph.measured',
		'road.grade.valid',
		'hydrology.sequence.valid',
		'hydrology.profile.measured',
		'terrain.resolution.valid',
		'terrain.authority.valid',
		'arrival.surfaceConformity.valid',
		'bridge.clearance.valid',
		'foundation.support.valid',
		'architecture.landmark.complete',
		'material.sources.valid',
		'material.generatedUtility.valid',
		'material.physicalCoverage.present',
		'performance.qualityTier.monotonic',
		'world.build.complete'
	];
}
