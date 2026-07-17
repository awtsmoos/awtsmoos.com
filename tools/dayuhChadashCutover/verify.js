// B"H
// Boruch Hashem
// Blessed is He

/**
 * @module DayuhChadashCutoverVerifier
 * @description
 * The Awtsmoos verifies canonical vessels, inode-preserving moves, manifest roots,
 * a working compact embedder, and one combined active storage ceiling.
 */

const fs = require('fs');
const path = require('path');
const { MANIFEST_NAMES } = require('./manifestRebase.js');
const { verifyRuntime } = require('./runtimeVerification.js');
const { activeUsage, allocatedBytes } = require('./storageUsage.js');
const { readState } = require('./state.js');

function verifyInstalled(policy, state = readState(policy), options = {}) {
	const checks = [];
	checks.push(check(
		'state-installed',
		['installed', 'testing', 'accepted'].includes(state.status),
		{ status: state.status }
	));
	for (const name of policy.requiredCanonicalNames) {
		const file = path.join(policy.packedRoot, name);
		checks.push(check(`canonical:${name}`, fs.existsSync(file), { file }));
	}
	for (const move of state.moves || []) checks.push(verifyMove(move));
	for (const name of MANIFEST_NAMES) checks.push(verifyManifest(policy, name));
	checks.push(verifyRuntime(policy, options));
	const usage = activeUsage(policy, options);
	checks.push(check('data-budget', usage.dataBytes <= policy.dataHardLimitBytes, {
		actualBytes: usage.dataBytes,
		limitBytes: policy.dataHardLimitBytes
	}));
	checks.push(check('runtime-budget', usage.runtimeBytes <= policy.runtimeHardLimitBytes, {
		actualBytes: usage.runtimeBytes,
		limitBytes: policy.runtimeHardLimitBytes
	}));
	checks.push(check('active-combined-budget', (
		usage.activeBytes <= policy.activeHardLimitBytes
	), {
		actualBytes: usage.activeBytes,
		limitBytes: policy.activeHardLimitBytes
	}));
	return {
		ok: checks.every(result => result.ok),
		checkedAt: new Date().toISOString(),
		...usage,
		checks
	};
}

function verifyMove(move) {
	const sourceExists = fs.existsSync(move.source);
	const destinationExists = fs.existsSync(move.destination);
	let inodeMatches = false;
	if (destinationExists && move.before?.inode) {
		inodeMatches = String(fs.statSync(move.destination, { bigint: true }).ino)
			=== String(move.before.inode);
	}
	return check(`move:${path.basename(move.source)}`, (
		!sourceExists && destinationExists && inodeMatches
	), { sourceExists, destinationExists, inodeMatches });
}

function verifyManifest(policy, name) {
	const file = path.join(policy.ragDestination, name);
	if (!fs.existsSync(file)) return check(`manifest:${name}`, false, { file });
	const text = fs.readFileSync(file, 'utf8');
	const pointsToDestination = text.includes(policy.aiDestination);
	const pointsToSource = text.includes(policy.aiSource);
	return check(`manifest:${name}`, pointsToDestination && !pointsToSource, {
		file,
		pointsToDestination,
		pointsToSource
	});
}

function check(name, ok, details = {}) {
	return { name, ok: Boolean(ok), ...details };
}

function assertVerified(report) {
	if (report.ok) return report;
	const failed = report.checks.filter(result => !result.ok);
	throw Object.assign(new Error('B"H cutover verification failed'), {
		code: 'AWTSMOOS_CUTOVER_VERIFICATION_FAILED',
		failed
	});
}

module.exports = {
	allocatedBytes,
	assertVerified,
	check,
	verifyInstalled,
	verifyManifest,
	verifyMove
};
