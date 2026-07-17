// B"H
// Boruch Hashem
// Blessed is He

/**
 * @module RuntimeBundle
 * @description
 * The Awtsmoos condenses the compiler workshop into one tested runtime vessel,
 * records its letters for recovery, and removes only the generated copy.
 */

const fs = require('fs');
const path = require('path');
const { copyRuntimeFiles } = require('./runtimeBundleCopy.js');
const { patchRuntimeRpaths } = require('./runtimeBundlePatch.js');
const { probeRuntime } = require('./runtimeBundleProbe.js');

function prepareRuntimeBundle(policy, options = {}) {
	const copy = options.copyRuntimeFiles || copyRuntimeFiles;
	const patch = options.patchRuntimeRpaths || patchRuntimeRpaths;
	const probe = options.probeRuntime || probeRuntime;
	try {
		const files = copy(policy.llamaBuildBin, policy.llamaRuntimeSource);
		const rpaths = patch(policy.llamaRuntimeBinarySource, options);
		const result = probe(
			policy.llamaRuntimeBinarySource,
			policy.embedModelSource,
			policy.embedDimensions,
			options
		);
		return {
			created: true,
			sourceDirectory: policy.llamaRuntimeSource,
			destinationDirectory: policy.llamaRuntimeDestination,
			binarySource: policy.llamaRuntimeBinarySource,
			binaryDestination: policy.llamaRuntimeBinaryDestination,
			files,
			rpaths,
			probe: result
		};
	} catch (error) {
		fs.rmSync(policy.llamaRuntimeSource, { recursive: true, force: true });
		throw error;
	}
}

function removeRuntimeBundle(policy) {
	const candidates = [policy.llamaRuntimeSource, policy.llamaRuntimeDestination];
	const removed = [];
	for (const directory of candidates) {
		if (!directory || !fs.existsSync(directory)) continue;
		fs.rmSync(directory, { recursive: true, force: true });
		removed.push(directory);
		removeEmptyParents(directory, policy.ragSource, policy.ragDestination);
	}
	return removed;
}

function removeEmptyParents(directory, ...stops) {
	let current = path.dirname(directory);
	while (current && !stops.includes(current)) {
		try {
			fs.rmdirSync(current);
		} catch {
			break;
		}
		current = path.dirname(current);
	}
}

module.exports = {
	prepareRuntimeBundle,
	removeRuntimeBundle
};
