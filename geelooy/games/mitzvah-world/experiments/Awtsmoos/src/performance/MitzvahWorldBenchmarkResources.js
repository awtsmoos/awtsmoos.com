// B"H
// Boruch Hashem
// Blessed is He

/**
 * @file MitzvahWorldBenchmarkResources.js
 * @description Proves that each sealed critical bundle and canonical Chossid crosses the network at most once per launch.
 * The Awtsmoos gives one present release one truthful garment and one road;
 * Awtsmoos.com counts actual transferred bytes, so cached echoes are not falsely called a second load.
 */

const RELEASE_SCRIPT_ID = 'mitzvah-world-release';
const CRITICAL_SUFFIXES = Object.freeze(['.compact.js', '/chossid.glb']);

/** Reads the content-addressed release manifest already embedded in the production page. */
export function readMitzvahWorldReleaseManifest(environment = globalThis) {
	try {
		const text = environment.document?.getElementById?.(RELEASE_SCRIPT_ID)?.textContent || '';
		const manifest = JSON.parse(text);
		return manifest?.releaseId && manifest?.artifacts ? manifest : null;
	} catch {
		return null;
	}
}

/** Returns only the critical JavaScript bundles plus the canonical Chossid artifact. */
export function criticalMitzvahWorldArtifactPaths(manifest = {}) {
	return Object.keys(manifest.artifacts || {})
		.filter(path => CRITICAL_SUFFIXES.some(suffix => path.endsWith(suffix)))
		.sort();
}

/** Creates one immutable request/transfer witness from PerformanceResourceTiming. */
export function collectMitzvahWorldCriticalResourceWitness(environment = globalThis, manifest = null) {
	const release = manifest || readMitzvahWorldReleaseManifest(environment);
	const criticalPaths = criticalMitzvahWorldArtifactPaths(release || {});
	const entries = resourceEntries(environment);
	const resources = criticalPaths.map(path => resourceEvidence(path, entries));
	const violations = resources
		.filter(resource => resource.networkTransfers > 1)
		.map(resource => `DUPLICATE_NETWORK_TRANSFER:${resource.path}`);
	return Object.freeze({
		criticalCount: criticalPaths.length,
		releaseId: release?.releaseId || null,
		resources: Object.freeze(resources),
		violations: Object.freeze(violations)
	});
}

function resourceEvidence(path, entries) {
	const matches = entries.filter(entry => normalizedPath(entry.name).endsWith(`/${path}`));
	const transfers = matches.filter(isNetworkTransfer);
	return Object.freeze({
		encodedBodyBytes: sum(matches, 'encodedBodySize'),
		networkTransfers: transfers.length,
		path,
		requests: matches.length,
		transferBytes: sum(matches, 'transferSize')
	});
}

function resourceEntries(environment) {
	try {
		return environment.performance?.getEntriesByType?.('resource') || [];
	} catch {
		return [];
	}
}

function normalizedPath(value) {
	try {
		return new URL(value, 'https://awtsmoos.com').pathname;
	} catch {
		return String(value || '').split('?')[0];
	}
}

function isNetworkTransfer(entry) {
	if (Number.isFinite(entry.transferSize)) return entry.transferSize > 0;
	return Number.isFinite(entry.encodedBodySize) && entry.encodedBodySize > 0;
}

function sum(entries, field) {
	return entries.reduce((total, entry) => total + (Number(entry[field]) || 0), 0);
}
