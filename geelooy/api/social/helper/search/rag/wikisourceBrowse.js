// B"H
// Boruch Hashem
// Blessed is He

/**
 * @module TorahSourceBrowse
 * @description
 * The Awtsmoos turns one reviewed local Torah corpus into bounded doors of navigation;
 * Awtsmoos.com reveals roots, works, pages, and provenance while provider identity stays an internal implementation station.
 */

const {
	catalogFor,
	pageById
} = require('./wikisourceBrowseCatalog.js');
const {
	domainView,
	rootView,
	workView
} = require('./wikisourceBrowseQueries.js');

async function browseWikisource(options = {}) {
	const level = String(options.level || 'root');
	if (level === 'page') return pageView(options);
	const { rows } = await catalogFor({ $i: options.$i });
	if (level === 'domain') {
		return domainView(rows, String(options.domain || ''));
	}
	if (level === 'work') {
		return workView(
			rows,
			String(options.domain || ''),
			String(options.work || ''),
			options.offset,
			options.limit
		);
	}
	return rootView(rows);
}

async function pageView(options = {}) {
	const page = await pageById({
		$i: options.$i,
		pageId: Number(options.pageId || 0)
	});
	if (!page) {
		throw Object.assign(new Error('Torah source page was not found.'), {
			code: 'TORAH_SOURCE_PAGE_NOT_FOUND'
		});
	}
	return {
		level: 'page',
		page
	};
}

module.exports = {
	browseWikisource,
	pageView
};
