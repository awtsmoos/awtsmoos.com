// B"H
// Boruch Hashem
// Blessed is He

/**
 * @module ExactHebrewV3
 * @description
 * The canonical gzip vessel is inflated once inside a worker. Its text and
 * section boundaries are cached, while only requested buckets are parsed.
 */

const zlib = require('zlib');
const {
	ROOTS,
	hitShape,
	normalizeWord
} = require('./exactHebrewShape.js');
const {
	parseNamedObject,
	sectionRanges
} = require('./exactHebrewJsonSlice.js');
const {
	blobBuffer,
	bucket,
	codedError,
	hashText
} = require('./exactHebrewBucket.js');

const FORMAT = 'AwtsmoosDB-DosDB-gzip-bucketed-exact-hebrew-v3';

function loadShard(database, corpus) {
	const rootKey = ROOTS[corpus];
	if (!rootKey) throw codedError('UNKNOWN_EXACT_CORPUS', corpus);
	const metadata = database.DosDB.get('meta', { rootKey });
	if (metadata?.format !== FORMAT) {
		throw codedError(
			'UNSUPPORTED_EXACT_FORMAT',
			metadata?.format || 'missing'
		);
	}
	const blob = database.DosDB.get('indexBlob', { rootKey });
	const text = zlib.gunzipSync(blobBuffer(blob)).toString('utf8');
	return {
		metadata,
		rootKey,
		text,
		sections: sectionRanges(text),
		wordBuckets: new Map(),
		refBuckets: new Map()
	};
}

function cachedBucket(loaded, kind, name) {
	const cache = kind === 'words'
		? loaded.wordBuckets
		: loaded.refBuckets;
	if (!cache.has(name)) {
		const parsed = parseNamedObject(
			loaded.text,
			name,
			loaded.sections[kind]
		) || {};
		cache.set(name, parsed);
	}
	return cache.get(name);
}

function searchShard(loaded, corpus, request) {
	const normalized = normalizeWord(request.word);
	const offset = Math.max(0, Number(request.offset) || 0);
	const limit = Math.min(
		Math.max(1, Number(request.limit) || 25),
		200
	);
	const words = cachedBucket(loaded, 'words', bucket(normalized));
	const occurrences = words[normalized]?.o || [];
	const hits = occurrences
		.slice(offset, offset + limit)
		.map(occurrence => {
			const references = cachedBucket(
				loaded,
				'refs',
				bucket(occurrence[0])
			);
			return hitShape(
				corpus,
				normalized,
				occurrence,
				references[occurrence[0]]
			);
		});
	return {
		corpus,
		totalHits: occurrences.length,
		hits,
		counts: loaded.metadata.counts
	};
}

module.exports = {
	FORMAT,
	blobBuffer,
	bucket,
	hashText,
	loadShard,
	searchShard
};
