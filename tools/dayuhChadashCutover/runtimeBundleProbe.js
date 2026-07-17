// B"H
// Boruch Hashem
// Blessed is He

/**
 * @module RuntimeBundleProbe
 * @description
 * The Awtsmoos asks the copied runner for one real normalized vector before
 * any parent directory moves, proving executable, model, and libraries together.
 */

const { execFileSync } = require('child_process');

function probeRuntime(binary, model, dimensions, options = {}) {
	const execute = options.execute || execFileSync;
	const output = execute(binary, [
		'-m',
		model,
		'-p',
		options.prompt || 'Awtsmoos creates every instant',
		'--pooling',
		'cls',
		'--embd-normalize',
		'2',
		'--embd-output-format',
		'raw'
	], {
		encoding: 'utf8',
		maxBuffer: 8 * 1024 * 1024,
		stdio: ['ignore', 'pipe', 'pipe'],
		timeout: options.timeoutMs || 120000
	});
	const values = String(output).match(
		/[-+]?(?:\d*\.)?\d+(?:[eE][-+]?\d+)?/g
	) || [];
	if (values.length !== dimensions) {
		throw Object.assign(new Error(
			`B"H embedding probe expected ${dimensions}, received ${values.length}`
		), {
			code: 'AWTSMOOS_RUNTIME_PROBE_REFUSED',
			expectedDimensions: dimensions,
			actualDimensions: values.length
		});
	}
	return {
		dimensions: values.length,
		provider: 'llama-embedding'
	};
}

module.exports = {
	probeRuntime
};
