// B"H
// Boruch Hashem
// Blessed is He

/**
 * @module TorahSourceBrowseCatalog
 * @description
 * The Awtsmoos gathers compact Torah sparks from reviewed local publications into one navigable constellation;
 * Awtsmoos.com remembers which part owns each page while full text remains on disk until a learner requests revelation.
 */

const { resolveShard } = require('./shards.js');
const { compactRow, publicPage } = require('./wikisourceBrowseShape.js');
const { findPage, streamRows } = require('./wikisourceBrowseStream.js');

let catalogPromise = null;

/** Returns the shared compact catalog, retrying cleanly after a failed first build. */
async function catalogFor({ $i } = {}) {
	if (!catalogPromise) {
		catalogPromise = buildCatalog({ $i }).catch(error => {
			catalogPromise = null;
			throw error;
		});
	}
	return catalogPromise;
}

/** Builds the 29k-row metadata catalog without retaining source bodies in memory. */
async function buildCatalog({ $i } = {}) {
	const shard = await resolveShard({
		$i,
		lane: 'hewikisource-torah'
	});
	if (!shard) {
		throw Object.assign(
			new Error('Torah source corpus is unavailable.'),
			{ code: 'TORAH_SOURCE_BROWSE_UNAVAILABLE' }
		);
	}
	const parts = shard.parts || [shard];
	const rows = [];
	const pageParts = new Map();
	for (let partIndex = 0; partIndex < parts.length; partIndex += 1) {
		await streamRows(parts[partIndex].textFile, row => {
			const compact = compactRow(row);
			rows.push(compact);
			if (compact.pageId !== '') {
				pageParts.set(String(compact.pageId), partIndex);
			}
		});
	}
	return {
		rows,
		pageParts,
		parts: parts.map(part => ({
			textFile: part.textFile
		}))
	};
}

/** Retrieves a full source page only from the publication part indexed for it. */
async function pageById({ $i, pageId } = {}) {
	const catalog = await catalogFor({ $i });
	const partIndex = catalog.pageParts.get(String(pageId));
	if (partIndex === undefined) return null;
	return findPage(
		catalog.parts[partIndex].textFile,
		pageId
	);
}

module.exports = {
	buildCatalog,
	catalogFor,
	compactRow,
	pageById,
	publicPage,
	streamRows
};
