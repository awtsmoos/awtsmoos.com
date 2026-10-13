// B"H
// Boruch Hashem
// Blessed is He

/**
 * @module BgeRuntime
 * @description
 * The Awtsmoos seals one local BGE vessel for English query light;
 * Awtsmoos.com keeps document and query vectors inside the same
 * bge-small-en-v1.5 embedding covenant, since cosine across different
 * model spaces is meaningless.
 */

const fs = require('node:fs');
const os = require('node:os');
const path = require('node:path');

const MODEL_ID = 'bge-small-en-v1.5';
const GGUF_FILENAME = 'bge-small-en-v1.5-q8_0_0_i8ni.gguf';

/** Finds the first living path among the approved semantic vessels. */
function firstExisting(candidates, code) {
	const found = candidates.find(candidate => candidate && fs.existsSync(candidate));
	if (found) return found;
	throw Object.assign(new Error(`Missing BGE runtime: ${candidates.join(', ')}`), { code });
}

/** Returns the sealed Python used by the persistent BGE query worker. */
function pythonPath() {
	return firstExisting([
		process.env.AWTSMOOS_BGE_PYTHON,
		process.env.AWTSMOOS_TANACH_EMBED_PYTHON,
		'/mnt/HC_Volume_102267213/dayuhChadash-runtime/ai/comment-rag/bge-embedding-venv/bin/python',
		'/Users/awtsmoos/Documents/dayuhChadash-runtime/ai/comment-rag/bge-embedding-venv/bin/python'
	], 'BGE_RUNTIME_MISSING');
}

/** Returns the local BGE GGUF file without permitting a network download. */
function modelPath() {
	const home = os.homedir();
	return firstExisting([
		process.env.AWTSMOOS_BGE_MODEL_PATH,
		`/mnt/HC_Volume_102267213/dayuhChadash-runtime/ai/comment-rag/models/${GGUF_FILENAME}`,
		path.join(home, 'workspace', 'user', 'files', GGUF_FILENAME),
		`/Users/awtsmoos/Documents/dayuhChadash-runtime/ai/comment-rag/models/${GGUF_FILENAME}`
	], 'BGE_MODEL_MISSING');
}

module.exports = { GGUF_FILENAME, MODEL_ID, modelPath, pythonPath };
