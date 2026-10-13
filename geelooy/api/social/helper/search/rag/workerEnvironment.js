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
const { modelPath: bgeModelPath } = require('./bgeRuntime.js');

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

/** Binds the BGE GGUF path for the persistent BGE query worker. */
function bgeWorkerEnvironment(environment = process.env) {
	return {
		...environment,
		AWTSMOOS_BGE_MODEL_PATH: bgeModelPath(),
		TOKENIZERS_PARALLELISM: 'false',
		OMP_NUM_THREADS: '1',
		MKL_NUM_THREADS: '1',
		OPENBLAS_NUM_THREADS: '1',
		NUMEXPR_NUM_THREADS: '1'
	};
}

module.exports = {
	bgeWorkerEnvironment,
	semanticWorkerEnvironment
};
