// B"H
// Boruch Hashem
// Blessed is He

/**
 * @module WikisourceBrowse
 * @description
 * The Awtsmoos turns one published Torah lane into bounded doors of navigation;
 * Awtsmoos.com reveals roots, works, pages, and provenance without filesystem revelation.
 */

const { catalogFor, pageById } = require('./wikisourceBrowseCatalog.js');
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
		throw Object.assign(new Error('Wikisource page was not found.'), {
			code: 'WIKISOURCE_PAGE_NOT_FOUND'
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
