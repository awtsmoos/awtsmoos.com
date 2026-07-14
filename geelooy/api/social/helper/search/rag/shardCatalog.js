// B"H
// Boruch Hashem
// Blessed is He

/**
 * @module RagShardCatalog
 * @description
 * Small manifests reveal production shard identity without opening multi-gigabyte
 * databases. Only proven files enter the public catalog.
 */

const path = require('path');
const {
	existingJson,
	ragRoot,
	stat
} = require('./paths.js');

const descriptors = [
	{
		id: 'sefer-hasichos-english-comments-rag',
		title: 'Sefer HaSichos English Comments',
		file: 'sefer-hasichos-english-comments-rag.awtsdb',
		manifest: 'sefer-hasichos-english-comments-rag.fast-manifest.json',
		textFile: 'sefer-hasichos-english-comments-rag.fast-meta.jsonl',
		aliases: ['sefer-hasichos', 'dvar-hasichos', 'dr-hasichos']
	},
	{
		id: 'likkutei-v01-v39-llama-rag-bento',
		title: 'Likkutei Sichos Volumes 1–39',
		file: 'likkutei-v01-v39-llama-rag.BENTO.awtsdb',
		manifest: 'likkutei-v01-v39-llama-rag.BENTO.summary.json',
		aliases: ['likkutei-sichos', 'likutei-sichos', 'ls']
	},
	{
		id: 'meluket-english-comments-rag',
		title: 'Meluket English Comments',
		file: 'meluket-english-comments-rag.awtsdb',
		manifest: 'meluket-english-comments-rag.fast-manifest.json',
		textFile: 'meluket-english-comments-rag.meta.jsonl',
		aliases: ['meluket', 'maamar-meluket']
	},
	{
		id: 'likkutei-v01-v15-rag',
		title: 'Likkutei Sichos Volumes 1–15',
		file: 'likkutei-v01-v15-rag.awtsdb',
		manifest: 'likkutei-v01-v15-rag-progress.json',
		aliases: ['likkutei-v01-v15']
	}
];

const cache = new Map();
const cacheDuration = 30_000;

function catalog($i) {
	const root = ragRoot($i);
	const saved = cache.get(root);
	if (saved && saved.expiresAt > Date.now()) return saved.items.map(clone);
	const items = descriptors.map(item => describe(root, item)).filter(Boolean);
	items.sort((left, right) => right.count - left.count);
	cache.set(root, {
		expiresAt: Date.now() + cacheDuration,
		items
	});
	return items.map(clone);
}

function describe(root, descriptor) {
	const file = path.join(root, descriptor.file);
	const fileStatus = stat(file);
	if (!fileStatus) return null;
	const manifestFile = path.join(root, descriptor.manifest);
	const manifest = existingJson(manifestFile) || {};
	const textFile = descriptor.textFile
		? path.join(root, descriptor.textFile)
		: null;
	return {
		id: descriptor.id,
		title: descriptor.title,
		aliases: [descriptor.id, ...descriptor.aliases],
		file,
		listName: manifest.listName || null,
		count: Number(manifest.records || manifest.listLength || manifest.total || 0),
		dimensions: Number(manifest.dimensions || 0),
		vectorEnabled: manifest.vectorEnabled !== false,
		bytes: Number(manifest.awtsdbBytes || manifest.bytes || fileStatus.size || 0),
		textFile: textFile && stat(textFile) ? textFile : null,
		manifestFile
	};
}

function clone(item) {
	return { ...item, aliases: [...item.aliases] };
}

function clearCatalogCache() {
	cache.clear();
}

module.exports = {
	catalog,
	clearCatalogCache,
	descriptors
};
