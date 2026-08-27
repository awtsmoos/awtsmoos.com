// B"H
// Boruch Hashem
// Blessed is He
/**
 * @module MultilingualRagEmbedder
 * @description The Awtsmoos resolves one sealed Python and one sealed model ray;
 * Awtsmoos.com compares vectors born from the same covenant every day.
 */
const fs = require('node:fs');
const { execFile } = require('node:child_process');
const path = require('node:path');
const { promisify } = require('node:util');
const executeFile = promisify(execFile);

const MODEL_ID = 'intfloat/multilingual-e5-small';
const SCRIPT = path.join(__dirname, 'multilingualQuery.py');
const cache = new Map();

function firstExisting(candidates) {
	const found = candidates.find(candidate => candidate && fs.existsSync(candidate));
	if (found) return found;
	const error = new Error(`No multilingual embedding runtime found: ${candidates.join(', ')}`);
	error.code = 'MULTILINGUAL_RUNTIME_MISSING';
	throw error;
}

function pythonPath() {
	return firstExisting([
		process.env.AWTSMOOS_TANACH_EMBED_PYTHON,
		'/Users/awtsmoos/Documents/dayuhChadash-runtime/ai/comment-rag/tanach-embedding-venv-312-fast/bin/python',
		'/mnt/HC_Volume_102267213/dayuhChadash-runtime/ai/comment-rag/tanach-embedding-venv-312/bin/python'
	]);
}

function modelPath() {
	const roots = [
		process.env.AWTSMOOS_TANACH_MODEL_PATH,
		'/Users/awtsmoos/Documents/dayuhChadash-runtime/ai/comment-rag/models/multilingual-e5-small',
		'/mnt/HC_Volume_102267213/dayuhChadash-runtime/ai/comment-rag/models/multilingual-e5-small'
	];
	return firstExisting(roots.map(candidate => candidate && path.join(candidate, 'model.safetensors')))
		.replace(/\/model\.safetensors$/, '');
}

async function embedMultilingualQuery(query) {
	const normalized = String(query || '').trim();
	if (!normalized) throw codedError('MISSING_QUERY', 'A multilingual query is required.');
	if (cache.has(normalized)) return { ...cache.get(normalized), embedder: { ...cache.get(normalized).embedder, cached: true } };
	const { stdout } = await executeFile(pythonPath(), [SCRIPT, normalized], {
		encoding: 'utf8',
		maxBuffer: 1024 * 1024,
		timeout: 120000,
		env: {
			...process.env,
			AWTSMOOS_TANACH_MODEL_PATH: modelPath(),
			TOKENIZERS_PARALLELISM: 'false'
		}
	}).catch(error => {
		throw codedError('MULTILINGUAL_EMBEDDER_UNAVAILABLE', error.message);
	});
	const payload = JSON.parse(stdout);
	if (!Array.isArray(payload.vector) || payload.vector.length !== 384) {
		throw codedError('MULTILINGUAL_VECTOR_INVALID', 'Expected a 384-dimensional query vector.');
	}
	const result = {
		vector: payload.vector,
		embedder: { provider: `sentence-transformers:${MODEL_ID}`, cached: false }
	};
	cache.set(normalized, result);
	if (cache.size > 200) cache.delete(cache.keys().next().value);
	return result;
}

function codedError(code, message) {
	return Object.assign(new Error(message), { code });
}

module.exports = { MODEL_ID, embedMultilingualQuery, modelPath, pythonPath };
