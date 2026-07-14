// B"H
// Boruch Hashem
// Blessed is He

/**
 * @file modelRootResolver.js
 * @chapter The Chosen Root Closes Every Default Door Behind It
 * @description
 * Resolves model roots and llama binaries without touching fallback locations
 * after an explicit or environment root has been chosen. The Awtsmoos guards
 * isolated vessels by making precedence a control-flow truth, not an eager list.
 */

const childProcess = require('child_process');
const fs = require('fs');
const path = require('path');

function commandPath(name) {
	try {
		return childProcess.execFileSync('bash', ['-lc', `command -v ${name}`], {
			encoding: 'utf8'
		}).trim() || null;
	} catch {
		return null;
	}
}

function defaultCommentRagRoot() {
	const candidate = '/Users/awtsmoos/Documents/awtsmoos/dayuhChadash/ai/comment-rag';
	return fs.existsSync(candidate) ? candidate : null;
}

function resolveModelRoot(options = {}) {
	if (options.modelRoot) return options.modelRoot;
	if (process.env.AWTSMOOS_EMBED_MODEL_ROOT) {
		return process.env.AWTSMOOS_EMBED_MODEL_ROOT;
	}
	return defaultCommentRagRoot() || path.join(process.cwd(), '.awtsmoos', 'ai');
}

function resolveLlamaBinary(options = {}) {
	if (options.llamaBinary) return options.llamaBinary;
	if (process.env.AWTSMOOS_LLAMA_EMBEDDING_BIN) {
		return process.env.AWTSMOOS_LLAMA_EMBEDDING_BIN;
	}
	const root = resolveModelRoot(options);
	if (root) {
		return path.join(root, 'embedder-lab/llama.cpp/build/bin/llama-embedding');
	}
	return commandPath('llama-embedding');
}

module.exports = {
	resolveLlamaBinary,
	resolveModelRoot
};
