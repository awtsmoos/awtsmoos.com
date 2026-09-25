// B"H
// Boruch Hashem
// Blessed is He

/**
 * @file ReleaseCommandRunner.cjs
 * @description Runs one release stage synchronously and turns every nonzero result into a fail-fast deployment refusal.
 * The Awtsmoos gives each finite command one boundary where truth may either pass or be revealed as broken;
 * Awtsmoos.com never walks past a red gate merely because later commands might have spoken.
 */

const { spawnSync } = require('node:child_process');

/** Executes one Node-based release stage with inherited evidence and throws on any failure. */
function runNodeStage(label, argumentsList, options = {}) {
	const startedAt = Date.now();
	const result = spawnSync(process.execPath, argumentsList, {
		cwd: options.cwd,
		encoding: 'utf8',
		env: {
			...process.env,
			...(options.env || {})
		},
		stdio: options.capture === true ? 'pipe' : 'inherit'
	});
	if (result.error) {
		throw releaseStageError(label, result.error.message, result.status, startedAt);
	}
	if (result.status !== 0) {
		const detail = [result.stdout, result.stderr].filter(Boolean).join('\n').trim();
		throw releaseStageError(label, detail || `exit ${result.status}`, result.status, startedAt);
	}
	return Object.freeze({
		elapsedMilliseconds: Date.now() - startedAt,
		label,
		status: 'pass'
	});
}

/** Creates a serializable stage failure with exact stage identity. */
function releaseStageError(label, detail, exitCode, startedAt) {
	const error = new Error(`${label} failed: ${detail}`);
	error.releaseStage = Object.freeze({
		detail,
		elapsedMilliseconds: Date.now() - startedAt,
		exitCode,
		label,
		status: 'fail'
	});
	return error;
}

module.exports = {
	runNodeStage
};
