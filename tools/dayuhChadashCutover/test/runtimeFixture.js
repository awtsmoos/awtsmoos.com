// B"H
// Boruch Hashem
// Blessed is He

/** @file runtimeFixture.js @description Supplies a tiny deterministic runtime. */

const fs = require('fs');
const path = require('path');

function runtimeOptions(policy) {
	return {
		assertOffline() {
			return { ok: true, livePids: [], listeners: [], handles: [] };
		},
		prepareRuntimeBundle() {
			fs.mkdirSync(policy.llamaRuntimeSource, { recursive: true });
			fs.copyFileSync(
				path.join(policy.llamaBuildBin, 'llama-embedding'),
				policy.llamaRuntimeBinarySource
			);
			return {
				created: true,
				sourceDirectory: policy.llamaRuntimeSource,
				destinationDirectory: policy.llamaRuntimeDestination,
				binarySource: policy.llamaRuntimeBinarySource,
				binaryDestination: policy.llamaRuntimeBinaryDestination,
				files: ['llama-embedding'],
				rpaths: ['@loader_path'],
				probe: { dimensions: policy.embedDimensions }
			};
		},
		probeRuntime() {
			return {
				dimensions: policy.embedDimensions,
				provider: 'fixture'
			};
		},
		readRpaths() {
			return ['@loader_path'];
		},
		platform: 'darwin'
	};
}

module.exports = {
	runtimeOptions
};
