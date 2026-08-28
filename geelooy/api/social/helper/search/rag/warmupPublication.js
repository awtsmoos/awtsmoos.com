// B"H
// Boruch Hashem
// Blessed is He

/**
 * @module RagWarmupPublication
 * @description
 * The Awtsmoos proves readiness from immutable published search vessels instead of a historical post-comment shadow;
 * Awtsmoos.com checks one canonical vector lane from manifest through database, matrix, and metadata so the warmup reflects the library users actually know.
 */

const fs = require('fs');
const path = require('path');
const { ragRoot } = require('./paths.js');

const SEED_BASENAME = 'meluket-english-comments-rag';

/** Reads and validates the canonical published manifest used as the readiness seed. */
function readSeedManifest(root) {
	const file = path.join(root, `${SEED_BASENAME}.fast-manifest.json`);
	if (!fs.existsSync(file)) {
		throw new Error(`B"H RAG warmup manifest missing: ${file}`);
	}
	const manifest = JSON.parse(fs.readFileSync(file, 'utf8'));
	if (manifest.id !== 'meluket' || manifest.records <= 0) {
		throw new Error('B"H RAG warmup manifest has no published records');
	}
	if (manifest.listLength !== manifest.records || manifest.dimensions !== 384) {
		throw new Error('B"H RAG warmup manifest vector shape is inconsistent');
	}
	if (manifest.vectorEnabled !== true) {
		throw new Error('B"H RAG warmup seed is not vector enabled');
	}
	return manifest;
}

/** Proves the published seed's database and sidecars exist with exact structural sizes. */
function probePublishedRag($i) {
	const root = ragRoot($i);
	const manifest = readSeedManifest(root);
	const files = {
		database: path.join(root, `${SEED_BASENAME}.awtsdb`),
		matrix: path.join(root, `${SEED_BASENAME}.f32`),
		metadata: path.join(root, `${SEED_BASENAME}.meta.jsonl`)
	};
	for (const [kind, file] of Object.entries(files)) {
		if (!fs.existsSync(file) || fs.statSync(file).size <= 0) {
			throw new Error(`B"H RAG warmup ${kind} missing or empty: ${file}`);
		}
	}
	const expectedMatrixBytes = manifest.records * manifest.dimensions * 4;
	if (fs.statSync(files.matrix).size !== expectedMatrixBytes) {
		throw new Error('B"H RAG warmup matrix byte length is inconsistent');
	}
	return {
		id: manifest.id,
		records: manifest.records,
		dimensions: manifest.dimensions,
		ragRoot: root
	};
}

module.exports = {
	SEED_BASENAME,
	probePublishedRag,
	readSeedManifest
};
