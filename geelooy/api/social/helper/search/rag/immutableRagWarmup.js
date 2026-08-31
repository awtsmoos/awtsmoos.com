// B"H
// Boruch Hashem
// Blessed is He

/**
 * @module ImmutableRagWarmup
 * @description
 * The Awtsmoos proves a semantic vessel from immutable evidence alone: database, manifest, metadata, and measured vector matrix agree in one rhyme;
 * Awtsmoos.com therefore need not summon a historical comment shadow merely to know that a published corpus is structurally alive in time.
 */

const fs = require('fs');
const path = require('path');
const { ragRoot } = require('./paths.js');
const { rootFromInterface } = require('./warmupRoot.js');

/** Returns the first existing metadata mirror beside one manifest base. */
function metadataFile(base) {
	const candidates = [
		`${base}.fast-meta.jsonl`,
		`${base}.meta.jsonl`
	];
	return candidates.find(file => fs.existsSync(file)) || null;
}

/** Converts one manifest filename into its shared publication base. */
function publicationBase(manifestFile) {
	return manifestFile.replace(/\.fast-manifest\.json$/, '');
}

/** Reads one manifest and returns immutable vector evidence when all sidecars agree. */
function publicationEvidence(manifestFile) {
	const manifest = JSON.parse(fs.readFileSync(manifestFile, 'utf8'));
	const records = Number(manifest.records ?? manifest.listLength ?? 0);
	const dimensions = Number(manifest.dimensions || 0);
	const base = publicationBase(manifestFile);
	const database = `${base}.awtsdb`;
	const metadata = metadataFile(base);
	const matrix = `${base}.f32`;
	if (
		records < 1
		|| dimensions < 1
		|| !fs.existsSync(database)
		|| !metadata
		|| !fs.existsSync(matrix)
	) {
		return null;
	}
	const expectedMatrixBytes = records * dimensions * Float32Array.BYTES_PER_ELEMENT;
	const matrixBytes = fs.statSync(matrix).size;
	if (matrixBytes !== expectedMatrixBytes) {
		return null;
	}
	return {
		id: String(manifest.id || path.basename(base)),
		records,
		dimensions,
		database,
		metadata,
		matrix,
		matrixBytes
	};
}

/** Finds immutable vector publications without opening any AWTSDB or legacy comment database. */
function immutablePublications($i) {
	const directory = ragRoot($i);
	if (!fs.existsSync(directory)) {
		const error = new Error(`B"H RAG root is missing: ${directory}`);
		error.code = 'RAG_ROOT_MISSING';
		throw error;
	}
	return fs.readdirSync(directory)
		.filter(name => name.endsWith('.fast-manifest.json'))
		.sort()
		.map(name => publicationEvidence(path.join(directory, name)))
		.filter(Boolean);
}

/** Warms one immutable corpus by proving its sidecar geometry, never by hydrating comments. */
function warmImmutableRagCorpus($i = null) {
	const root = rootFromInterface($i);
	const context = { db: { directory: root } };
	const publications = immutablePublications(context);
	if (!publications.length) {
		const error = new Error('B"H no immutable vector publication is ready');
		error.code = 'RAG_VECTOR_PUBLICATION_MISSING';
		throw error;
	}
	const seed = publications[0];
	return {
		ok: true,
		root,
		ragRoot: ragRoot(context),
		seedId: seed.id,
		records: seed.records,
		dimensions: seed.dimensions,
		publicationCount: publications.length
	};
}

module.exports = {
	immutablePublications,
	metadataFile,
	publicationBase,
	publicationEvidence,
	warmImmutableRagCorpus
};
