// B"H
// Boruch Hashem
// Blessed is He

/**
 * @file modelRootResolver.js
 * @description
 * The Awtsmoos resolves portable model and runner roots from explicit deployment
 * vessels, preferring the compact runtime while preserving pre-cutover compatibility.
 */

const childProcess = require('child_process');
const fs = require('fs');
const path = require('path');

function commandPath(name, options = {}) {
	const execute = options.execute || childProcess.execFileSync;
	try {
		return execute('bash', ['-lc', `command -v ${name}`], {
			encoding: 'utf8'
		}).trim() || null;
	} catch {
		return null;
	}
}

function resolveModelRoot(options = {}) {
	const environment = options.environment || process.env;
	if (options.modelRoot) return path.resolve(options.modelRoot);
	if (environment.AWTSMOOS_EMBED_MODEL_ROOT) {
		return path.resolve(environment.AWTSMOOS_EMBED_MODEL_ROOT);
	}
	if (environment.AWTSMOOS_RAG_ROOT) {
		return path.resolve(environment.AWTSMOOS_RAG_ROOT);
	}
	if (environment.AWTSMOOS_AI_ROOT) {
		return path.resolve(environment.AWTSMOOS_AI_ROOT, 'comment-rag');
	}
	const cwd = options.cwd || process.cwd();
	return path.resolve(cwd, '.awtsmoos/ai/comment-rag');
}

function resolveLlamaBinary(options = {}) {
	const environment = options.environment || process.env;
	const exists = options.existsSync || fs.existsSync;
	if (options.llamaBinary) return path.resolve(options.llamaBinary);
	if (environment.AWTSMOOS_LLAMA_EMBEDDING_BIN) {
		return path.resolve(environment.AWTSMOOS_LLAMA_EMBEDDING_BIN);
	}
	const root = resolveModelRoot(options);
	const candidates = [
		path.join(root, 'runtime/llama/bin/llama-embedding'),
		path.join(root, 'embedder-lab/llama.cpp/build/bin/llama-embedding')
	];
	return candidates.find(candidate => exists(candidate))
		|| commandPath('llama-embedding', options)
		|| candidates[0];
}

module.exports = {
	commandPath,
	resolveLlamaBinary,
	resolveModelRoot
};
