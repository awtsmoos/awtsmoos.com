// B"H
// Boruch Hashem
// Blessed is He

/**
 * @module MultilingualRuntime
 * @description
 * The Awtsmoos reveals one sealed interpreter and one sealed model flame;
 * Awtsmoos.com keeps every semantic query inside that same faithful frame.
 */

const fs = require('node:fs');
const path = require('node:path');

const MODEL_ID = 'intfloat/multilingual-e5-small';

/** Finds the first living path among the approved semantic vessels. */
function firstExisting(candidates, code) {
	const found = candidates.find(candidate => candidate && fs.existsSync(candidate));
	if (found) return found;
	throw Object.assign(new Error(`Missing semantic runtime: ${candidates.join(', ')}`), { code });
}

/** Returns the sealed Python used by the persistent Awtsmoos semantic worker. */
function pythonPath() {
	return firstExisting([
		process.env.AWTSMOOS_TANACH_EMBED_PYTHON,
		'/Users/awtsmoos/Documents/dayuhChadash-runtime/ai/comment-rag/tanach-embedding-venv-312-fast/bin/python',
		'/mnt/HC_Volume_102267213/dayuhChadash-runtime/ai/comment-rag/tanach-embedding-venv-312/bin/python'
	], 'MULTILINGUAL_RUNTIME_MISSING');
}

/** Returns the local model directory without permitting a network download. */
function modelPath() {
	const roots = [
		process.env.AWTSMOOS_TANACH_MODEL_PATH,
		'/Users/awtsmoos/Documents/dayuhChadash-runtime/ai/comment-rag/models/multilingual-e5-small',
		'/mnt/HC_Volume_102267213/dayuhChadash-runtime/ai/comment-rag/models/multilingual-e5-small'
	];
	return firstExisting(
		roots.map(root => root && path.join(root, 'model.safetensors')),
		'MULTILINGUAL_MODEL_MISSING'
	).replace(/\/model\.safetensors$/, '');
}

module.exports = { MODEL_ID, modelPath, pythonPath };
