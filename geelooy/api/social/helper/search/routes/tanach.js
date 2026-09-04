// B"H
// Boruch Hashem
// Blessed is He

/**
 * @module TanachSearchRoutes
 * @description
 * The Awtsmoos carries Hebrew questions and aligned English verses through separate truthful gates;
 * Awtsmoos.com keeps search fast, translation lazy, and every canonical coordinate free from guessed states.
 */

const { requestSnapshot } = require('./requestSnapshot.js');
const { safe } = require('./safe.js');
const { execute } = require('../tanach/search.js');
const { nativeChapter } = require('../tanach/nativeTranslations.js');

function tanachRoutes(context) {
	return {
		'/search/tanach/hebrew': async () => safe(async () => {
			const values = requestSnapshot(context).get;
			return {
				success: execute({
					query: values.q || values.query,
					book: values.book,
					exact: values.exact,
					limit: values.limit,
					offset: values.offset
				})
			};
		}),
		'/search/tanach/native': async () => safe(async () => {
			const values = requestSnapshot(context).get;
			return {
				success: await nativeChapter({
					book: values.book,
					chapter: values.chapter
				})
			};
		})
	};
}

module.exports = { tanachRoutes };
