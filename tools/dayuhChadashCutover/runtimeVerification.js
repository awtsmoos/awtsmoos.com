// B"H
// Boruch Hashem
// Blessed is He

/**
 * @module RuntimeVerification
 * @description
 * The Awtsmoos proves the moved runner can still create the expected vector and
 * that no absolute build path survived inside its Mach-O vessel.
 */

const fs = require('fs');
const { readRpaths } = require('./runtimeBundlePatch.js');
const { probeRuntime } = require('./runtimeBundleProbe.js');

function verifyRuntime(policy, options = {}) {
	const binary = policy.llamaRuntimeBinaryDestination;
	const model = policy.embedModelDestination;
	if (!fs.existsSync(binary) || !fs.existsSync(model)) {
		return result(false, {
			binary,
			model,
			binaryExists: fs.existsSync(binary),
			modelExists: fs.existsSync(model)
		});
	}
	try {
		const probe = (options.probeRuntime || probeRuntime)(
			binary,
			model,
			policy.embedDimensions,
			options
		);
		const rpaths = (options.platform || process.platform) === 'darwin'
			? (options.readRpaths || readRpaths)(binary, options.execute)
			: [];
		const portable = !rpaths.some(value => value.startsWith('/'));
		return result(portable, { binary, model, probe, rpaths, portable });
	} catch (error) {
		return result(false, {
			binary,
			model,
			error: error.message,
			code: error.code || null
		});
	}
}

function result(ok, details) {
	return {
		name: 'runtime-embedding',
		ok: Boolean(ok),
		...details
	};
}

module.exports = {
	verifyRuntime
};
