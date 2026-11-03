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
 * Resolution is configuration-driven and production-shaped: explicit env
 * overrides first, then the sealed venv/model under each known runtime
 * root (the data-volume covenant root, then the root-filesystem runtime
 * where the comment-rag store actually lives), then a system python as a
 * last resort. No developer-machine paths are consulted: a macOS laptop
 * path baked into this list once made every production BGE query fail
 * with BGE_RUNTIME_MISSING while capabilities claimed the lane was ready.
 */

const fs = require('node:fs');
const os = require('node:os');
const path = require('node:path');

const MODEL_ID = 'bge-small-en-v1.5';
const GGUF_FILENAME = 'bge-small-en-v1.5-q8_0_0_i8ni.gguf';
const VENV_RELATIVE = path.join('comment-rag', 'bge-embedding-venv');
const MODELS_RELATIVE = path.join('comment-rag', 'models');

/** Runtime roots that may hold the sealed comment-rag vessels, best first. */
function runtimeRoots() {
	return unique([
		process.env.AWTSMOOS_RUNTIME_ROOT,
		process.env.AWTSMOOS_DAYUH_RUNTIME_ROOT,
		'/mnt/HC_Volume_102267213/dayuhChadash-runtime',
		'/opt/awtsmoos-runtime-ai'
	]);
}

/** Both historical layouts: <root>/ai/comment-rag and <root>/comment-rag. */
function commentRagRoots() {
	return runtimeRoots().flatMap(root => [
		path.join(root, 'ai'),
		root
	]);
}

/** Finds the first living path among the approved semantic vessels. */
function firstExisting(candidates, code) {
	const found = candidates.find(candidate => candidate && fs.existsSync(candidate));
	if (found) return found;
	throw Object.assign(new Error(`Missing BGE runtime: ${candidates.join(', ')}`), { code });
}

/** Finds an executable on PATH as the documented last-resort interpreter. */
function pathExecutable(name) {
	const directories = String(process.env.PATH || '').split(path.delimiter).filter(Boolean);
	for (const directory of directories) {
		const candidate = path.join(directory, name);
		try {
			fs.accessSync(candidate, fs.constants.X_OK);
			return candidate;
		} catch {}
	}
	return null;
}

/** Every interpreter candidate in resolution order (exported for operators/tests). */
function pythonCandidates() {
	const venvPythons = commentRagRoots().flatMap(base => [
		path.join(base, VENV_RELATIVE, 'bin', 'python'),
		path.join(base, VENV_RELATIVE, 'bin', 'python3')
	]);
	return unique([
		process.env.AWTSMOOS_BGE_PYTHON,
		process.env.AWTSMOOS_TANACH_EMBED_PYTHON,
		...venvPythons
	]);
}

/** Returns the sealed Python used by the persistent BGE query worker. */
function pythonPath() {
	const candidates = pythonCandidates();
	const found = candidates.find(candidate => candidate && fs.existsSync(candidate));
	if (found) return found;
	const system = pathExecutable('python3') || pathExecutable('python');
	if (system) return system;
	throw Object.assign(
		new Error(`Missing BGE runtime: ${[...candidates, 'python3 (PATH)', 'python (PATH)'].join(', ')}`),
		{ code: 'BGE_RUNTIME_MISSING' }
	);
}

/** Every GGUF candidate in resolution order (exported for operators/tests). */
function modelCandidates() {
	const modelFiles = commentRagRoots().map(base => path.join(base, MODELS_RELATIVE, GGUF_FILENAME));
	return unique([
		process.env.AWTSMOOS_BGE_MODEL_PATH,
		...modelFiles,
		path.join(os.homedir(), 'workspace', 'user', 'files', GGUF_FILENAME)
	]);
}

/** Returns the local BGE GGUF file without permitting a network download. */
function modelPath() {
	return firstExisting(modelCandidates(), 'BGE_MODEL_MISSING');
}

function unique(values) {
	return [...new Set(values.filter(Boolean))];
}

module.exports = {
	GGUF_FILENAME,
	MODEL_ID,
	commentRagRoots,
	modelCandidates,
	modelPath,
	pythonCandidates,
	pythonPath,
	runtimeRoots
};
