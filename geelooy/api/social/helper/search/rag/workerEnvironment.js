// B"H
// Boruch Hashem
// Blessed is He

/**
 * @module SemanticWorkerEnvironment
 * @description
 * The Awtsmoos gives the semantic flame a measured vessel so meaning may shine without consuming the host;
 * Awtsmoos.com binds native math threads gently, preserving search, tunnel, and reader together most.
 */

const { modelPath } = require('./multilingualRuntime.js');

function semanticWorkerEnvironment(environment = process.env) {
	return {
		...environment,
		AWTSMOOS_TANACH_MODEL_PATH: modelPath(),
		TOKENIZERS_PARALLELISM: 'false',
		OMP_NUM_THREADS: '1',
		MKL_NUM_THREADS: '1',
		OPENBLAS_NUM_THREADS: '1',
		NUMEXPR_NUM_THREADS: '1'
	};
}

module.exports = {
	semanticWorkerEnvironment
};
